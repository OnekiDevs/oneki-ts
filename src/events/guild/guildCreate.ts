import { Guild, GuildMember, EmbedBuilder, TextChannel, resolveColor, codeBlock } from 'discord.js'
import { Server } from '../../utils/classes.js'
import { checkSend, sendError } from '../../utils/utils.js'
import client from '../../client.js'
import servers from '../../cache/servers.js'
import constants from '../../cache/constants.js'

export default async function (guild: Guild) {
    try {
        if (!servers.has(guild.id)) servers.set(guild.id, new Server(guild))
        console.log('\x1b[34m%s\x1b[0m', `Nuevo Servidor Desplegado!! ${guild.name} (${guild.id})`)

        const channel = client.channels.cache.get(constants.newServerLogChannel) as TextChannel
        if (channel && checkSend(channel, guild.members.me as GuildMember)) {
            const [u, b] = guild.members.cache.partition(m => !m.user.bot)!
            const owner = await client.users.fetch(guild.ownerId)
            const embed = new EmbedBuilder()
                .setThumbnail(guild.iconURL() ?? '')
                .setTitle('Me añadieron en un Nuevo Servidor')
                .setDescription(`ahora estoy en ${client.guilds.cache.size} servidores`)
                .addFields(
                    {
                        name: 'Servidor',
                        value: codeBlock(guild.name),
                        inline: true
                    },
                    {
                        name: 'ID',
                        value: codeBlock(guild.id),
                        inline: true
                    },
                    {
                        name: 'Roles',
                        value: codeBlock(guild.roles.cache.size + ''),
                        inline: true
                    },
                    {
                        name: 'Miembros',
                        value: codeBlock(`Users: ${u.size}\nBots: ${b.size}`),
                        inline: true
                    },
                    {
                        name: 'Dueño',
                        value: codeBlock(`${owner.tag}\n${owner.id}`),
                        inline: true
                    }
                )
                .setTimestamp()
                .setColor(resolveColor('Random'))
                // .setFooter(client.embedFooter)
                .setImage(guild.bannerURL() ?? null)
            channel.send({
                embeds: [embed]
            })
        }
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }
}
