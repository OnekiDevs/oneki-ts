import { ApplicationCommandDataResolvable, ChatInputCommandInteraction, Attachment, UserFlagsBitField } from 'discord.js'
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

    async run(interaction: ChatInputCommandInteraction<'cached'>) {
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
    
        const ss = await cw.buffer('https://oneki.herokuapp.com/api/fake/discord/message?' + params, {
            height: Math.round((message.length * 50) / 140 + 50),
            width: 500,
            launchOptions: { args: ['--no-sandbox'] }
        })
        interaction.editReply({
            files: [new Attachment(ss, 'ss.jpg')]
        })
    }
}
