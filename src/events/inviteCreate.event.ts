import { Invite } from 'discord.js'
import { Client } from '../classes/Client'

export const name = 'inviteCreate'

export async function run(invite: Invite) {
    if (!invite.guild) return
    const guild = await invite.guild.fetch()
    let server = (invite.client as Client).servers.get(invite.guild.id)
    if (!server) server = (invite.client as Client).newServer(guild)

    server.invites.push({
        code: invite.code,
        count: invite.memberCount,
        user: invite.inviter?.username??'Server'
    })
}