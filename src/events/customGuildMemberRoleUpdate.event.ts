/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GuildMember, TextChannel } from 'discord.js'
import { GuildMemberOptions } from '../utils/classes.js'
import { checkSend } from '../utils/utils.js'

export default async function({ server, oldMember, newMember }: GuildMemberOptions){
    //If the channel ID is saved in the database
    if(!server.logsChannels.memberUpdate) return

    const userActivitieChannel = await server.guild.channels.fetch(server.logsChannels.memberUpdate) as TextChannel

    if(!checkSend(userActivitieChannel, server.guild.members.me as GuildMember)) return //If the channel still exists and can send messages there

    const changedRole = newMember.roles.cache.difference(oldMember.roles.cache).first()!
    const wasAdded = newMember.roles.cache.size > oldMember.roles.cache.size 

    if(wasAdded) return userActivitieChannel.send({ content: server.translate('useractivitie_event.roles_change.added', { user: newMember.user.toString(), role: changedRole.toString() }), allowedMentions: { roles: [] } })
    return userActivitieChannel.send({ content: server.translate('useractivitie_event.roles_change.removed', { user: newMember.user.toString(), role: changedRole.toString() }), allowedMentions: { roles: [] } })
}