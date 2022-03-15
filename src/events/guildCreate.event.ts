import { Guild, GuildMember, MessageEmbed, TextChannel } from 'discord.js'
import { Client, Server } from '../utils/classes'
import { checkSend, sendError } from '../utils/utils'

export const name = 'guildCreate'

export async function run(guild: Guild) {
    try {
        if (!(guild.client as Client).servers.has(guild.id))
            (guild.client as Client).servers.set(guild.id, new Server(guild))
        console.log(
            '\x1b[34m%s\x1b[0m',
            `Nuevo Servidor Desplegado!! ${guild.name} (${guild.id})`
        )
        ;(guild.client as Client).commands
            .deploy(guild)
            .then(() =>
                console.log(
                    '\x1b[32m%s\x1b[0m',
                    'Comandos Desplegados para ' + guild.name
                )
            )
        const channel = (guild.client as Client).channels.cache.get(
            (guild.client as Client).constants.newServerLogChannel ?? ''
        ) as TextChannel
        if (channel && checkSend(channel, guild.me as GuildMember)) {
            const [u, b] = guild.members.cache.partition(m => !m.user.bot)!
            const owner = await (guild.client as Client).users.fetch(
                guild.ownerId
            )
            const embed = new MessageEmbed()
                .setThumbnail(guild.iconURL() ?? '')
                .setTitle('Me añadieron en un Nuevo Servidor')
                .setDescription(
                    `ahora estoy en ${
                        (guild.client as Client).guilds.cache.size
                    } servidores`
                )
                .addField('Servidor', `\`\`\`\n${guild.name}\n\`\`\``, true)
                .addField('ID', `\`\`\`${guild.id}\`\`\``, true)
                .addField('Roles', `\`${guild.roles.cache.size}\``, true)
                .addField('Miembros', `\`\`\`Users: ${u.size}\nBots: ${b.size}\`\`\``, true)
                .addField(
                    'Dueño',
                    `\`${owner.username}#${owner.discriminator}\n${owner.id}\``,
                    true
                )
                .setTimestamp()
                .setColor('RANDOM')
                .setFooter({
                    text: `${(guild.client as Client).user?.username} Bot v${
                        (guild.client as Client).version
                    }`,
                    iconURL: guild.client.user?.avatarURL() ?? '',
                })
                .setImage(guild.bannerURL() ?? '')
            channel.send({
                embeds: [embed],
            })
        }
    } catch (error) {
        sendError(guild.client as Client, error as Error, __filename)
    }
}
