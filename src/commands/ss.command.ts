import { ApplicationCommandDataResolvable, CommandInteraction, Guild, MessageAttachment } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes'
// import webshot from 'webshot-node'
import cw from 'capture-website'

export default class SS extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'ss',
            description: 'make a fake ss',
            type: CommandType.guild,
            public: false,
            guilds: ['834440041010561074', '885674114310881362']
        })
    }

    async getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addStringOption(option => option.setName('text').setDescription('Text to show').setRequired(true))
            .addUserOption(option => option.setName('user').setDescription('The user to show'))
            .toJSON()
    }

    async run(interaction: CommandInteraction<'cached'>): Promise<any> {
        await interaction.deferReply()
        const member = interaction.options.getMember('user') ?? interaction.member
        const text = interaction.options.getString('text') as string
        const params = new URLSearchParams({
            text,
            avatar: member.displayAvatarURL({ format: 'png' }),
            user: member.displayName,
            color: member.displayHexColor.slice(1),
            bot: member.user.bot?'1':'0',
            verified: member.user.flags?.has('VERIFIED_BOT')?'1':'0'
        })
        console.log(Math.round(((text.length * 50) / 10) + 50))
        
        const ss = await cw.buffer('https://oneki.herokuapp.com/api/fakeDiscordMessage?' + params, {
            height: Math.round(((text.length * 50) / 140) + 50),
            width: 500
        })
        interaction.editReply({
            files: [new MessageAttachment(ss, 'ss.jpg')]
        })
    }
}