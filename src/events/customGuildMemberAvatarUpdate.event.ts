import { MessageEmbed, TextChannel } from 'discord.js'
import { GuildMemberOptions } from '../utils/classes.js'

export default async function({ server, oldMember, newMember }: GuildMemberOptions){
    //If the channel ID is saved in the database
    if(!server.logsChannels.useractivitie) return

    //If the channel still exists
    const userActivitieChannel = await server.guild.channels.fetch(server.logsChannels.useractivitie) as TextChannel
    if(!userActivitieChannel) return

    const avatarEmbed = new MessageEmbed()
        .setTitle(server.translate('useractivitie_event.serveravatar_change.title', { username: `${newMember.user.tag}` }))
        .setDescription(server.translate('useractivitie_event.serveravatar_change.description', { user: newMember.user.toString() }))
        .setImage(newMember.displayAvatarURL({ size: 4096, dynamic: true }))
        .setThumbnail(oldMember.displayAvatarURL({ dynamic: true }))
        .setColor('RANDOM')
    
    userActivitieChannel.send({ embeds: [avatarEmbed] })
}