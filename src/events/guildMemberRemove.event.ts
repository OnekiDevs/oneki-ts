import { GuildMember } from 'discord.js'
import { Client } from '../classes/Client'

export default function(member: GuildMember){
    if(member.user.bot) return

    const client = (member.client) as Client
    let server = client.servers.get(member.guild.id)
    if(!server) server = client.newServer(member.guild)

    if(!server.keepRoles || !server.premium) return

    const memberRoles = member.roles.cache.filter(role => !role.managed && role.id !== member.guild.id)
    const memberIdRoles = memberRoles.map(role => role.id)
    
    server.db.collection('users').doc(member.id).set({
        roles: memberIdRoles
    })
}