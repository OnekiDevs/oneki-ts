import { ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js'
import JSZip from 'jszip'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const emojis = await Promise.all(
        (
            await interaction.guild.emojis.fetch()
        ).map(async e => {
            const res = await fetch(e.url)
            const blob = await res.arrayBuffer()
            return {
                buffer: Buffer.from(blob),
                name: e.name,
                animated: e.animated
            }
        })
    )

    const zip = new JSZip()
    await Promise.all(emojis.map(e => zip.file(`${e.name}.${e.animated ? 'gif' : 'png'}`, e.buffer)))
    const zipGenerated = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

    interaction.editReply({
        files: [new AttachmentBuilder(zipGenerated, { name: `${msg.guild.name}_emojis.zip` })]
    })
}
