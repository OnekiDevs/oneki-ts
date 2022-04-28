import { EmbedBuilder, TextChannel, Util } from 'discord.js'
import { GuildMemberOptions } from '../utils/classes.js'

export default async function({ server, oldMember, newMember }: GuildMemberOptions){
    //If the channel ID is saved in the database
    if(!server.logsChannels.memberUpdate) return

    //If the channel still exists
    const userActivitieChannel = await server.guild.channels.fetch(server.logsChannels.memberUpdate) as TextChannel
    if(!userActivitieChannel) return

    const avatarEmbed = new EmbedBuilder()
        .setTitle(server.translate('useractivitie_event.serveravatar_change.title', { username: `${newMember.user.tag}` }))
        .setDescription(server.translate('useractivitie_event.serveravatar_change.description', { user: newMember.user.toString() }))
        .setImage(newMember.displayAvatarURL({ size: 4096,  }))
        .setThumbnail(oldMember.displayAvatarURL({  }))
        .setColor(Util.resolveColor(Util.resolveColor('Random')))

    userActivitieChannel.send({ embeds: [avatarEmbed] })
}