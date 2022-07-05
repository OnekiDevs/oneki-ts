import { Guild, GuildMember, EmbedBuilder, TextChannel } from 'discord.js'
import { checkSend, sendError, Util } from '../utils/utils.js'
import { Server } from '../utils/classes.js'
import client from '../client.js'

export default async function (guild: Guild) {
    try {
        if (!client.servers.has(guild.id)) client.servers.set(guild.id, new Server(guild))
        console.log('\x1b[34m%s\x1b[0m', `Nuevo Servidor Desplegado!! ${guild.name} (${guild.id})`)
        client.commands
            .deploy(guild)
            .then(() => console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados para ' + guild.name))
        const channel = client.channels.cache.get(client.constants.newServerLogChannel ?? '') as TextChannel
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
                        value: '```' + guild.name + '```',
                        inline: true
                    },
                    {
                        name: 'ID',
                        value: '```' + guild.id + '```',
                        inline: true
                    },
                    {
                        name: 'Roles',
                        value: '```' + String(guild.roles.cache.size) + '```',
                        inline: true
                    },
                    {
                        name: 'Miembros',
                        value: '```' + `Users: ${u.size}\nBots: ${b.size}` + '```',
                        inline: true
                    },
                    {
                        name: 'Dueño',
                        value: '```' + `${owner.tag}\n${owner.id}` + '```',
                        inline: true
                    }
                )
                .setTimestamp()
                .setColor(Util.resolveColor('Random'))
                .setFooter(client.embedFooter)
                .setImage(guild.bannerURL() ?? '')
            channel.send({
                embeds: [embed]
            })
        }
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }
}
