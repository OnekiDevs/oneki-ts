import { GuildMember, Invite, TextChannel } from 'discord.js'
import { Client } from '../classes/Client.js'

export const name = 'customGuildMemberAdd'

type JoinType = 'permissions' | 'normal' | 'vanity' | 'unknown';

export async function run(member: GuildMember, type: JoinType, invite: Invite) {
    const server = (member.client as Client).servers.get(member.guild.id) ?? (member.client as Client).newServer(member.guild)
    if (!server.logsChannels.invite || !server.premium) return
    const welcomeChannel = await member.guild.channels.fetch(server.logsChannels.invite) as TextChannel
    if(type === 'normal') return welcomeChannel.send(server.translate('invites_event.default_message', { invited: member.toString(), inviter: invite.inviter?.toString() }))
    else if(type === 'vanity') return welcomeChannel.send(server.translate('invites_event.custom_url', { invited: member.toString() }))
    else if(type === 'permissions') return welcomeChannel.send(server.translate('invites_event.permissions_error', { invited: member.toString() }))
    else return welcomeChannel.send(server.translate('invites_event.cant_find_inviter', { invited: member.toString() }))
}