import { GuildMember, TextChannel } from 'discord.js'
import { FieldValue } from 'firebase-admin/firestore'
import { Client } from '../classes/Client.js'
import { Server } from '../classes/Server.js'

export const name = 'guildMemberUpdate'

export async function run(oldMember: GuildMember, newMember: GuildMember) {
    console.log('asd')
    const client = (newMember.client) as Client
    let server = client.servers.get(newMember.guild.id)
    if(!server) server = client.newServer(newMember.guild)

    //If the channel ID is saved in the database
    console.log('asdasdsa')
    if(!server.logsChannels.useractivitie) return
    console.log('que')
    const userActivitieChannel = await server.guild.channels.fetch(server.logsChannels.useractivitie) as TextChannel
    //If the channel still exists
    if(!userActivitieChannel) return
    console.log('e')
    if(oldMember.nickname !== newMember.nickname) await nicknameUpdate(server, oldMember, newMember)
    if(oldMember.avatar !== newMember.avatar) await avatarUpdate(server, oldMember, newMember)
    //banner
    //roles
}

async function nicknameUpdate(server: Server, oldMember: GuildMember, newMember: GuildMember){
    if(!server.logsChannels.useractivitie) return //this is typescript's fault

    const userActivitieChannel = await server.guild.channels.fetch(server.logsChannels.useractivitie) as TextChannel
    userActivitieChannel.send(server.translate('useractivitie_event.nickname_change', { user: newMember.user.toString(), oldNickname: oldMember.nickname, newNickname: newMember.nickname }))

    if(!server.premium) return

    server.db.collection('users').doc(newMember.id).update({
        nicknames: FieldValue.arrayUnion(newMember.nickname)
    }).catch(() => 
        server.db.collection('users').doc(newMember.id).set({
            nicknames: [newMember.nickname]
        })
    )
}

async function avatarUpdate(server: Server, oldMember: GuildMember, newMember: GuildMember){
    console.log('avatar update')
}