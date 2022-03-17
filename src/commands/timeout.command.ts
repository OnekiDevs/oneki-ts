import { ApplicationCommandDataResolvable, CommandInteraction, GuildMember } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes.js'

export default class Ban extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'timeout',
            description: 'Timeout a memeber',
            defaultPermission: false,
            type: CommandType.guild
        })
    }

    async getData(): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addUserOption(option => option.setName('member').setDescription('The member to timeout').setRequired(true))
            .addIntegerOption(option =>
                option.setName('minutes').setDescription('The minutes to timeout').setRequired(true)
            )
            .addStringOption(option => option.setName('reason').setDescription('The reason to timeout'))
            .toJSON()
    }

    async run(interaction: CommandInteraction<'cached'>) {
        const member = interaction.options.getMember('member') as GuildMember
        const minutes = interaction.options.getInteger('minutes') as number
        const reason = interaction.options.getString('reason') as string
        const server = (interaction.client as Client).servers.get(interaction.guildId)
        if (!server) (interaction.client as Client).newServer(interaction.guild)

        if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
            return interaction.reply({
                content: server.translate('timeout_cmf.user_permissions'),
                ephemeral: true
            })

        await member.timeout(minutes * 1000, reason)

        interaction.reply(server.translate('timeout_cmf.reply', { user: member }))

        //TODO Implementar notas aqui
    }
}
