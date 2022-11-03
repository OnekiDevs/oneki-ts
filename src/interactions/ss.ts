import { ChatInputCommandInteraction, UserFlagsBitField, AttachmentBuilder } from 'discord.js'
import puppeteer from 'puppeteer'
import Jimp from 'jimp'
export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()

    const member = interaction.options.getMember('user') ?? interaction.member
    const message = interaction.options.getString('text') as string
    const params = new URLSearchParams({
        message,
        avatar: member.displayAvatarURL({ extension: 'png' }),
        username: member.displayName,
        color: member.displayHexColor
    })
    if (member.user.bot) params.append('bot', '')
    if (member.user.flags?.has(UserFlagsBitField.Flags.VerifiedBot)) params.append('verified', '')

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    const page = await browser.newPage()
    await page.goto(`https://oneki.up.railway.app/api/fake/discord/message?${params}`, { waitUntil: 'load' })
    page.setViewport({ height: Math.round((message.length * 51) / 140 + 50), width: 500 })
    let ss: any = await page.screenshot({ type: 'png' })
    browser.close()

    ss = await Jimp.read(ss)
    const base = ss.getPixelColor(0, 0)
    await ss.autocrop()
    const c = new Jimp(ss.bitmap.width + 20, ss.bitmap.height + 20, base)
    c.composite(ss, 10, 10)
    ss = await c.getBufferAsync(Jimp.MIME_PNG)

    interaction.editReply({
        files: [new AttachmentBuilder(ss, { name: 'ss.jpg' })]
    })
}
