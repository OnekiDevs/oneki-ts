import { GuildMember, /*TextChannel*/} from 'discord.js'
// import { Client } from '../classes/Client'

export const name = 'guildMemberAdd'

export async function run(member: GuildMember) {
    // const { client, guild } = member
    // const invites = await guild.invites.fetch()
    // let server = (client as Client).servers.get(guild.id)
    // if (!server) server = (client as Client).newServer(guild)

    // const invite = invites.find(i => {
    //     const inv = server?.invites.find(j=>j.code === i.code)
    //     return !!(inv && inv.count < i.memberCount)
    // })

    // if (!invite) return // no se encontro
    // const inviter = invite.inviter??'Server'
    // // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // server.invites.find(i => i.code = invite.code)!.count ++

    // const channel = guild.channels.cache.get('885674115615301650') as TextChannel
    // channel.send(`invited: ${member}\ninviter: ${inviter}`)
}