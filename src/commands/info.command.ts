import {
    ApplicationCommandDataResolvable,
    CommandInteraction,
    GuildMember,
    MessageEmbed,
} from 'discord.js'
import { Command, Client, CommandType, Server } from '../utils/classes.js'

export default class Activitie extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'info',
            description: 'display info',
            defaultPermission: true,
            type: CommandType.global,
        })
    }

    async getData(): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addSubcommand((subcommand) =>
                subcommand
                    .setName('member')
                    .setDescription('display member info')
                    .addUserOption((option) =>
                        option.setName('member').setDescription('member to fetch')
                    )
            )
            .toJSON()
    }

    async run(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply()
        let server = this.client.servers.get(interaction.guildId!)
        if (!server) {
            server = new Server(interaction.guild!)
            this.client.servers.set(interaction.guildId!, server)
        }
        if (interaction.options.getSubcommand() === 'member') {
            const member = (interaction.options.getMember('member') ??
        interaction.member) as GuildMember
            const user = await interaction.client.users.fetch(member.id, {
                force: true,
            })
            const embed = new MessageEmbed()
                .setTitle(server.translate('info_cmd.member.title', { user: member.displayName }))
                .setDescription(
                    `${member?.user.bot
                        ? `Es Bot${user.flags?.has('VERIFIED_BOT') ? ' verificado' : ''}`
                        : ''
                    }
            ${member?.pending ? 'Miembro pendiente de verificación' : ''}
            ${user.flags?.has('HOUSE_BALANCE') ? 'House Balance' : ''}
            ${user.flags?.has('HOUSE_BRILLIANCE') ? 'House Brilliance' : ''}
            ${user.flags?.has('HOUSE_BRAVERY') ? 'House Bravery' : ''}
            ${user.flags?.has('DISCORD_EMPLOYEE') ? 'Empleado de Discord' : ''}
            ${user.flags?.has('DISCORD_CERTIFIED_MODERATOR')
        ? 'Moderador Certificado de Discord'
        : ''
}
            ${user.flags?.has('HYPESQUAD_EVENTS') ? 'Eventos de HypeSquad' : ''}
            ${user.flags?.has('BUGHUNTER_LEVEL_1')
        ? 'Cazador de Bugs Nivel 1'
        : ''
}
            ${user.flags?.has('BUGHUNTER_LEVEL_2')
        ? 'Cazador de Bugs Nivel 2'
        : ''
}
            ${user.flags?.has('EARLY_VERIFIED_BOT_DEVELOPER')
        ? 'Desarrollador de Bots Verificado'
        : ''
}`
                )
            embed.addField('ID', '```\n' + user.id + '\n```', true)
                .addField('Tag', '```\n' + user.tag + '\n```', true)
            if (member.nickname) embed.addField('Nickname', '```\n' + member.nickname + '\n```', true)
            embed.addField(
                server.translate('info_cmd.member.member_color'),
                '```\n' + `${member.displayColor} / ${member.displayHexColor}` + '\n```',
                true
            )
            if (user.accentColor)
                embed.addField(
                    server.translate('info_cmd.member.user_color'),
                    '```\n' + `${user.accentColor} / ${user.hexAccentColor}` + '\n```',
                    true
                )
            embed
                .addField(
                    'Fecha de creación',
                    `<t:${Math.round(user.createdTimestamp / 1000)}:d> <t:${Math.round(
                        user.createdTimestamp / 1000
                    )}:R>`,
                    true
                )
                .addField(
                    'Entro el',
                    `<t:${Math.round(
                        (member.joinedTimestamp ?? 1) / 1000
                    )}:d> <t:${Math.round((member.joinedTimestamp ?? 1) / 1000)}:R>`,
                    true
                )
                .setColor(member.displayColor)
                .setThumbnail(member.displayAvatarURL({ size: 512 }))
            if (user.banner)
                embed.setImage(user.bannerURL({ dynamic: true, size: 2048 }) ?? '')
            if (member.premiumSinceTimestamp)
                embed.addField(
                    server.translate('info_cmd.member.boosting_from'),
                    `<t:${Math.round(member.premiumSinceTimestamp / 1000)}:R>`,
                    true
                )
            embed.addField(server.translate('info_cmd.member.roles'), member.roles.cache.map((r) => `${r}`).join(' '))
            const embeds = [
                embed,
                new MessageEmbed()
                    .setTitle('Avatar')
                    .setURL(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                    .setImage(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                    .setColor(member.user.accentColor ?? member.displayColor),
            ]
            if (member.avatar)
                embeds.push(
                    new MessageEmbed()
                        .setTitle('Avatar en Server')
                        .setURL(member.avatarURL({ dynamic: true, size: 2048 }) ?? '')
                        .setImage(member.avatarURL({ dynamic: true, size: 2048 }) ?? '')
                        .setColor(member.user.accentColor ?? member.displayColor)
                )
            interaction.editReply({
                embeds: embeds,
            })
        }
    }
}
