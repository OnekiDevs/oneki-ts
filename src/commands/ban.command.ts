import { ApplicationCommandDataResolvable, CommandInteraction, Guild, GuildMember, MessageAttachment, Permissions } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes.js'
import { permissionsError } from '../utils/utils.js'

import cw from 'capture-website'

export default class Ban extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'ban',
            description: 'Ban a memeber',
            defaultPermission: false,
            type: CommandType.guild
        })
    }

    async getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addUserOption(option => option.setName('member').setDescription('The member to ban').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('The reason to ban'))
            .addIntegerOption(option => option.setName('reason').setDescription('The reason to ban'))
            .toJSON()
    }

    async run(interaction: CommandInteraction<'cached'>) {
        const member = interaction.options.getMember('member') as GuildMember
        const reason = interaction.options.getString('reason') as string
        const days = interaction.options.getInteger('days') as number
        const server = (interaction.client as Client).servers.get(interaction.guildId)
        if (!server) (interaction.client as Client).newServer(interaction.guild)

        if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return interaction.reply({
            content: server.translate('ban_cmf.user_permissions'),
            ephemeral: true
        })

        if (!member.bannable) return permissionsError(interaction, Permissions.FLAGS.BAN_MEMBERS)

        await interaction.guild.members.ban(member, { reason, days })

        interaction.reply(server.translate('ban_cmf.reply'))

        //TODO Implementar notas aqui
    }
}

