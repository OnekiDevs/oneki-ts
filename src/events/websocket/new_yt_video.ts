import { ChannelType } from 'discord.js'
import { getServer } from '../../cache/servers.js'
import client from '../../client.js'
import { checkSend } from '../../utils/utils.js'

export default async function ({ server: serverid, data }: { server: string; data: any }) {
    const server = getServer(client.guilds.cache.get(serverid)!)

    if (server.ytNotificationChannel) {
        const channel = client.channels.cache.get(server.ytNotificationChannel)
        if (!channel || channel.type !== ChannelType.GuildText) server.ytNotificationChannel = null
        else if (checkSend(channel, server.guild.members.me!)) {
            channel.send(server.ytNotificationMessage)
        } //TODO: checkSend error
    }
}
