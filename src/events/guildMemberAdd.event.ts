/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GuildMember, Invite, TextChannel } from 'discord.js'
import { Client } from '../classes/Client.js'

export const name = 'guildMemberAdd'

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

// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// import { GuildMember, Invite } from 'discord.js'
// import { Client } from '../classes/Client.js'

// export const name = 'guildMemberAdd'

// export async function run(member: GuildMember) {
//     const client = (member.client) as Client
//     const server = client.servers.get(member.guild.id) ?? client.newServer(member.guild)
//     if (!server.premium || !server.logsChannels.invite) return
//     // const welcomeChannel = await member.guild.channels.fetch(server.logsChannels.invite) as TextChannel
//     const currentPartialsInvites = await member.guild.invites.fetch()    

//     const posible: Invite[] = []
//     const currentInvites = await Promise.all(currentPartialsInvites.map(async inv => {
//         const invite = await client.fetchInvite(inv.code)
//         const compare = server.invites.find(i => i.code === invite.code)
//         console.log(
//             !!compare,
//             invite.code,
//             compare?.code,
//             invite.memberCount,
//             compare?.memberCount,
//             compare && invite.memberCount > compare.memberCount,
//             !compare && invite.memberCount > 0
//         )
        
//         if (compare && invite.memberCount > compare.memberCount) {
//             posible.push(invite)
//             return {
//                 memberCount: invite.memberCount,
//                 code: invite.code
//             }
//         } else if (!compare && invite.memberCount > 0) {
//             posible.push(invite)
//             return {
//                 memberCount: invite.memberCount,
//                 code: invite.code
//             }
//         } else return {
//             memberCount: invite.memberCount,
//             code: invite.code
//         }
//     }))

//     server.invites = currentInvites

//     console.log(posible)
//     return
// }