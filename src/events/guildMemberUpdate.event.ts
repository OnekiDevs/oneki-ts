import { GuildMember } from 'discord.js'
import { Client } from '../classes/Client.js'

export default async function(oldMember: GuildMember, newMember: GuildMember) {
    const client = (newMember.client) as Client
    let server = client.servers.get(newMember.guild.id)
    if(!server) server = client.newServer(newMember.guild)

    if(oldMember.nickname !== newMember.nickname) client.emit('customGuildMemberNickameUpdate', { server, oldMember, newMember })
    if(oldMember.avatar !== newMember.avatar) client.emit('customGuildMemberAvatarUpdate', { server, oldMember, newMember })
    if(oldMember.roles.cache.size !== newMember.roles.cache.size) client.emit('customGuildMemberRoleUpdate', { server, oldMember, newMember })
    //banner
    //roles
    
    //banner del servidor
}