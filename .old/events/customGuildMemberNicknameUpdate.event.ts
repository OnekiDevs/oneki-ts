import { TextChannel } from 'discord.js'
import { GuildMemberOptions } from '../utils/classes.js'

export default async function({ server, oldMember, newMember }: GuildMemberOptions){
    //If the channel ID is saved in the database
    if(!server.logsChannels.memberUpdate) return

    //If the channel still exists
    const userActivitieChannel = await server.guild.channels.fetch(server.logsChannels.memberUpdate) as TextChannel
    if(!userActivitieChannel) return

    userActivitieChannel.send(server.translate('useractivitie_event.nickname_change', { user: newMember.user.toString(), oldNickname: oldMember.nickname, newNickname: newMember.nickname }))

    if(!server.premium) return
    const userSnap = (await server.db.collection('users').doc(newMember.id).get()).data()
    if(!userSnap) return
    const userNicknamesList = userSnap.nicknames
    const newNicknamesList = [...userNicknamesList, newMember.nickname]

    server.db.collection('users').doc(newMember.id).update({
        nicknames: newNicknamesList
    }).catch(() => 
        server.db.collection('users').doc(newMember.id).set({
            nicknames: newNicknamesList
        })
    )
}