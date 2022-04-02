/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { GuildMember, Invite, TextChannel } from 'discord.js'
import { Client } from '../classes/Client.js'

export const name = 'customGuildMemberAdd'

export async function run(member: GuildMember, type: 'normal' | 'vanity' | 'permissions' | 'unknown', invite: Invite) {
    console.log('hola')
    const client = (member.client) as Client
    let server = client.servers.get(member.guild.id)
    if(!server) server = client.newServer(member.guild)
    const welcomeChannelID = server.logsChannels.invite!
    const welcomeChannel = await member.guild.channels.fetch(welcomeChannelID) as TextChannel
    if(type === 'normal'){
        return welcomeChannel.send(server.translate('invites_event.default_message', { invited: member.toString(), inviter: invite.inviter?.username.toString() }))
    }

    if(type === 'vanity'){
        return welcomeChannel.send(server.translate('invites_event.custom_url', { invited: member.toString() }))
    }

    if(type === 'permissions'){
        return welcomeChannel.send(server.translate('invites_event.permissions_error', { invited: member.toString() }))
    }

    if(type === 'unknown'){
        return welcomeChannel.send(server.translate('invites_event.cant_find_inviter', { invited: member.toString() }))
    }
    return
}