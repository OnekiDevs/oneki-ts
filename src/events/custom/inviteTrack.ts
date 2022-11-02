import { GuildMember, Invite, TextChannel } from 'discord.js'
import client from '../../client.js'

type JoinType = 'permissions' | 'normal' | 'vanity' | 'unknown'

export default async function (member: GuildMember, type: JoinType, invite: Invite) {
    const server = client.getServer(member.guild)
    if (!server.logsChannels.invite || !server.premium) return

    const welcomeChannel = (await member.guild.channels.fetch(server.logsChannels.invite)) as TextChannel
    if (type === 'normal')
        return welcomeChannel.send({
            content: server.translate('invites_event.default_message', {
                invited: member.toString(),
                inviter: invite.inviter?.toString()
            }),
            allowedMentions: { roles: [] }
        })

    if (type === 'vanity')
        return welcomeChannel.send({
            content: server.translate('invites_event.custom_url', { invited: member.toString() }),
            allowedMentions: { roles: [] }
        })

    if (type === 'permissions')
        return welcomeChannel.send({
            content: server.translate('invites_event.permissions_error', { invited: member.toString() }),
            allowedMentions: { roles: [] }
        })

    return welcomeChannel.send({
        content: server.translate('invites_event.cant_find_inviter', { invited: member.toString() }),
        allowedMentions: { roles: [] }
    })
}
