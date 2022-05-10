import { ChatInputCommandInteraction, Attachment, ApplicationCommandOptionType, UserFlagsBitField } from 'discord.js'
import { Command, Client } from '../utils/classes.js'
import cw from 'capture-website'
import Jimp from 'jimp'
import { HybridInteraction } from '../classes/HybridInteraction.js'

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

    async interacion(interaction: ChatInputCommandInteraction<'cached'>) {        
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
        
        let ss: any = await cw.buffer('https://oneki.herokuapp.com/api/fake/discord/message?' + params, {
            height: Math.round((message.length * 51) / 140 + 50),
            width: 500,
            launchOptions: { args: ['--no-sandbox'] }
        })

        ss = await Jimp.read(ss)
        const base = ss.getPixelColor(0, 0)
        await ss.autocrop()
        const c = new Jimp(ss.bitmap.width+20, ss.bitmap.height+20, base)
        c.composite(ss, 10, 10)
        ss = await c.getBufferAsync(Jimp.MIME_PNG)

        interaction.editReply({
            files: [new Attachment(ss, 'ss.jpg')]
        })
    }

    async run(interaction: HybridInteraction<'message' | 'interaction'>) {  
        await interaction.deferReply()

        let member;
        if (interaction.isInteraction()) {
            member = interaction.base.options.getMember('user') ?? interaction.base.member
        } else {
            interaction.base // Property 'base' does not exist on type 'never'
        }
    }

}