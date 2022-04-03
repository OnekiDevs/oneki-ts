import { ApplicationCommandDataResolvable, CommandInteraction, GuildMember, Permissions } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes.js'
import { permissionsError, Translator } from '../utils/utils.js'

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
        const translate = Translator(interaction)
        const member = interaction.options.getMember('member') as GuildMember
        const reason = interaction.options.getString('reason') as string
        
        if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
            return interaction.reply({
                content: translate('kick_cmd.user_permissions'),
                ephemeral: true
            })

        if (!member.kickable) return permissionsError(interaction, Permissions.FLAGS.BAN_MEMBERS)

        await interaction.guild.members.kick(member, reason)

        interaction.reply(translate('kick_cmd.reply', { user: member }))

        //TODO Implementar notas aqui
    }
}
