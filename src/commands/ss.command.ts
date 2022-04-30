import { ChatInputCommandInteraction, Attachment, UserFlagsBitField, ApplicationCommandOptionType } from 'discord.js'
import { Command, Client } from '../utils/classes.js'
import cw from 'capture-website'

export default class SS extends Command {
    constructor(client: Client) {
        super(client, {
            name: {
                'en-US': 'ss',
                'es-ES': 'ss'
            },
            description: {
                'en-US': 'Shows a fake message',
                'es-ES': 'Muestra un mensaje falso'
            },
            options: [{
                name: 'text',
                type: ApplicationCommandOptionType.String,
                description: 'The text of the message',
                required: true,
            },{
                name: 'user',
                type: ApplicationCommandOptionType.User,
                description: 'The user of the message',
            }]
        })
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
