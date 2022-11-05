import { Client } from 'offdjs'
import db from '../../cache/db.js'
import servers, { getServer } from '../../cache/servers.js'
import Server from '../../classes/Server.js'
import { TextChannel } from 'discord.js'
import InvitesTracker from '@androz2091/discord-invites-tracker'

export default async function (client: Client) {
    await Promise.all(
        client.guilds.cache.map(async guild => {
            const server = new Server(guild)
            await server.init()
            return servers.set(guild.id, server)
        })
    )
    console.log('\x1b[34m%s\x1b[0m', 'Servidores Desplegados!!')

    await checkBirthdays()
    await checkBans()
    // ghost(this)

    InvitesTracker.init(client, {
        fetchGuilds: true,
        fetchVanity: true,
        fetchAuditLogs: true,
        exemptGuild: guild => {
            const server = getServer(guild)
            return !(server.logsChannels.invite && server.premium)
        }
    }).on('guildMemberAdd', (...args) => client.emit('inviteTrack', ...args))

    for (const command of client.application.commands.cache.values() ?? []) {
        await command.delete()
    }

    console.log('\x1b[31m%s\x1b[0m', `${client.user.username} Lista y Atenta!!!`)
}

async function checkBirthdays() {
    console.log('\x1b[34m%s\x1b[0m', 'Revisando cumpleaños...')
    const usersSnap = await db.collection('users').get()
    usersSnap.forEach(async user => {
        const birthday = user.data().birthday
        if (!birthday) return
        const [month, day, year] = birthday.split('/')

        //Check if it's the user's birthday
        if (year > new Date().getFullYear()) return
        if (month > new Date().getMonth() + 1 || day > new Date().getDate()) return
        //Celebrate user's birthday
        servers.map(async server => {
            const birthdayChannel = server.birthday.channel
            if (!birthdayChannel) return

            /* Revisar si el usuario está en el servidor */
            let member = server.guild.members.cache.get(user.id)
            if (!member) member = await server.guild.members.fetch(user.id)
            if (!member) return //Si no está tampoco en la API retornamos

            /* Revisar si el canal sigue existiendo y obtenerlo */
            let channel = server.guild.channels.cache.get(birthdayChannel) as TextChannel
            if (!channel) channel = (await server.guild.channels.fetch(birthdayChannel)) as TextChannel
            if (!channel) return server.removeBirthdayChannel() //Si no está tampoco en la API lo borramos de la base de datos

            channel.send(
                server.birthday.message?.replaceAll('{username}', `<@${user.id}>`) ??
                    server.translate('birthday_cmd.default_message', { username: `<@${user.id}>` })
            )
        })

        //Update user's birthday
        const newBirthday = `${month}/${day}/${parseInt(year) + 1}`
        db.collection('users').doc(user.id).update({ birthday: newBirthday })
    })

    setTimeout(checkBirthdays, 86_400_000)
}

async function checkBans() {
    console.log('\x1b[32m%s\x1b[0m', 'Revisando bans...')
    servers.map(async server => {
        const bansSnap = await server.db.collection('bans').get()
        bansSnap.forEach(async bannedUser => {
            const bannedDate = bannedUser.data().date
            const timeSinceBanned = new Date().getTime() - bannedDate
            const banDuration = bannedUser.data().duration
            if (timeSinceBanned > banDuration) {
                server.guild.members.unban(bannedUser.id)
                server.db.collection('bans').doc(bannedUser.id).delete()
            }
            console.log(`El usuario ${bannedUser.id} ha sido desbaneado de ${server.guild.id}`)
        })
    })

    setTimeout(checkBans, 900_000)
}
