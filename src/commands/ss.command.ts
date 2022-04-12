import { ApplicationCommandDataResolvable, CommandInteraction, MessageAttachment } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes.js'
import cw from 'capture-website'

export default class SS extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'ss',
            description: 'make a fake ss',
            category: 'Entertainment',
            defaultPermission: true,
            type: CommandType.global
        })
    }

    async getData(): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addStringOption(option => option.setName('text').setDescription('Text to show').setRequired(true))
            .addUserOption(option => option.setName('user').setDescription('The user to show'))
            .toJSON()
    }

    async run(interaction: CommandInteraction<'cached'>) {
        await interaction.deferReply()
        const member = interaction.options.getMember('user') ?? interaction.member
        const text = interaction.options.getString('text') as string
        const params = new URLSearchParams({
            text,
            avatar: member.displayAvatarURL({ format: 'png' }),
            user: member.displayName,
            color: member.displayHexColor.slice(1)
        })
        if (member.user.bot) params.append('bot', '')
        if (member.user.flags?.has('VERIFIED_BOT')) params.append('verified', '')

        const ss = await cw.buffer('https://oneki.herokuapp.com/api/fake/discord/message?' + params, {
            height: Math.round((text.length * 50) / 140 + 50),
            width: 500,
            launchOptions: { args: ['--no-sandbox'] }
        })
        interaction.editReply({
            files: [new MessageAttachment(ss, 'ss.jpg')]
        })
    }
}
