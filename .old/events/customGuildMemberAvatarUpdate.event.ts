import { EmbedBuilder, GuildMember, resolveColor, TextChannel } from 'discord.js'
import { GuildMemberOptions } from '../utils/classes.js'
import { checkSend } from '../utils/utils.js'

export default async function ({ server, oldMember, newMember }: GuildMemberOptions) {
    //If the channel ID is saved in the database
    if (!server.logsChannels.memberUpdate) return

    const userActivitieChannel = (await server.guild.channels.fetch(server.logsChannels.memberUpdate)) as TextChannel

    if (!checkSend(userActivitieChannel, server.guild.members.me as GuildMember)) return //If the channel still exists and can send messages there

    const avatarEmbed = new EmbedBuilder()
        .setTitle(
            server.translate('useractivitie_event.serveravatar_change.title', { username: `${newMember.user.tag}` })
        )
        .setDescription(
            server.translate('useractivitie_event.serveravatar_change.description', { user: newMember.user.toString() })
        )
        .setImage(newMember.displayAvatarURL({ size: 4096 }))
        .setThumbnail(oldMember.displayAvatarURL())
        .setColor(resolveColor('Random'))

    userActivitieChannel.send({ embeds: [avatarEmbed] })
}
