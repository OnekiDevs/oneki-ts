/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TextChannel } from 'discord.js'
import { GuildMemberOptions } from '../utils/classes.js'


export default async function({ server, oldMember, newMember }: GuildMemberOptions){
    //If the channel ID is saved in the database
    if(!server.logsChannels.useractivitie) return

    //If the channel still exists
    const userActivitieChannel = await server.guild.channels.fetch(server.logsChannels.useractivitie) as TextChannel
    if(!userActivitieChannel) return

    const changedRole = newMember.roles.cache.difference(oldMember.roles.cache).first()!
    const wasAdded = newMember.roles.cache.size > oldMember.roles.cache.size 
    if(wasAdded){
        return userActivitieChannel.send({ content: server.translate('useractivitie_event.roles_change.added', { user: newMember.user.toString(), role: changedRole.toString() }), allowedMentions: { roles: [] } })
    }
    return userActivitieChannel.send({ content: server.translate('useractivitie_event.roles_change.removed', { user: newMember.user.toString(), role: changedRole.toString() }), allowedMentions: { roles: [] } })
}