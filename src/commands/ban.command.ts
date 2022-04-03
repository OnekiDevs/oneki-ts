import { ApplicationCommandDataResolvable, CommandInteraction, GuildMember, Permissions } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes.js'
import { permissionsError, Translator } from '../utils/utils.js'

export default class Ban extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'ban',
            description: 'Ban a memeber',
            defaultPermission: false,
            type: CommandType.guild
        })
    }

    async getData(): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addUserOption(option => option.setName('member').setDescription('The member to ban').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('The reason to ban'))
            .addIntegerOption(option => option.setName('days').setDescription('The reason to ban'))
            .toJSON()
    }

    async run(interaction: CommandInteraction<'cached'>) {
        const translate = Translator(interaction)
        const member = interaction.options.getMember('member') as GuildMember
        const reason = interaction.options.getString('reason') as string
        const days = interaction.options.getInteger('days') as number

        if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0)
            return interaction.reply({
                content: translate('ban_cmd.user_permissions'),
                ephemeral: true
            })

        if (!member.bannable) return permissionsError(interaction, Permissions.FLAGS.BAN_MEMBERS)

        await interaction.guild.members.ban(member, { reason, days })

        interaction.reply(translate('ban_cmd.reply', { user: member }))

        //TODO Implementar notas aqui
    }
}
