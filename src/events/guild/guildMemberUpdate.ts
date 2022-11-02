import { GuildMember } from 'discord.js'
import client from '../../client.js'

export default async function (oldMember: GuildMember, newMember: GuildMember) {
    const server = client.getServer(newMember.guild)

    if (oldMember.nickname !== newMember.nickname)
        client.emit('guildMemberNickameUpdate', { server, oldMember, newMember })
    if (oldMember.avatar !== newMember.avatar) client.emit('guildMemberAvatarUpdate', { server, oldMember, newMember })
    if (oldMember.roles.cache.size !== newMember.roles.cache.size)
        client.emit('guildMemberRoleUpdate', { server, oldMember, newMember })
    //banner
    //roles

    //banner del servidor
}
