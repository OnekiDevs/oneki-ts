import { ApplicationCommandDataResolvable, CommandInteraction, GuildMember, Permissions } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes.js'
import { permissionsError } from '../utils/utils.js'

export default class Ban extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'kick',
            description: 'Kick a memeber',
            defaultPermission: false,
            type: CommandType.guild
        })
    }

    async getData(): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addUserOption(option => option.setName('member').setDescription('The member to kick').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('The reason to kick'))
            .toJSON()
    }

    async run(interaction: CommandInteraction<'cached'>) {
        const member = interaction.options.getMember('member') as GuildMember
        const reason = interaction.options.getString('reason') as string
        const server = (interaction.client as Client).servers.get(interaction.guildId)
        if (!server) (interaction.client as Client).newServer(interaction.guild)

        if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
            return interaction.reply({
                content: server.translate('kick_cmf.user_permissions'),
                ephemeral: true
            })

        if (!member.kickable) return permissionsError(interaction, Permissions.FLAGS.BAN_MEMBERS)

        await interaction.guild.members.kick(member, reason)

        interaction.reply(server.translate('kick_cmf.reply', { user: member }))

        //TODO Implementar notas aqui
    }
}
