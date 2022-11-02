import { Collection, Guild, TextChannel } from 'discord.js'
import { Client as BaseClient } from 'offdjs'
import { ClientConstants, ClientOptions } from '../utils/classes.js'
import Server from './Server.js'
import { WebSocket } from 'ws'
import { sleep } from '../utils/utils.js'
import { Firestore } from '@google-cloud/firestore'
import InvitesTracker from '@androz2091/discord-invites-tracker'
import { join } from 'path'
export default class Client extends BaseClient {
    servers = new Collection<string, Server>()
    constants: ClientConstants
    #wsw = false
    #wsInterval!: ReturnType<typeof setInterval>
    #wsintent = 1
    websocket?: WebSocket
    reconect = true
    db = new Firestore({ keyFilename: './google_credentials.json' })

    constructor(options: ClientOptions) {
        super(options)
        this.constants = options.constants
        this.once('ready', () => this.#onReady())
    }

    /**
     * Get a Server Class
     * @param {Guild} guild - guild to refer. it is necessary to create the class in case the server doesn't exist, if you don't have the Guild, try client.servers.ger(guild_id)
     * @returns a Server Class
     */
    getServer(guild: Guild): Server {
        return this.servers.get(guild.id) ?? this.newServer(guild)
    }

    /**
     * Return a new Server cached
     * @param {Guild} guild
     * @param {GuildDataBaseModel} data
     * @returns {Server}
     */
    newServer(guild: Guild): Server {
        const server = new Server(guild)
        this.servers.set(guild.id, server)
        return server
    }

    async #initializeServers() {
        return Promise.all(
            this.guilds.cache.map(async guild => {
                const server = new Server(guild)
                await server.init()
                return this.servers.set(guild.id, server)
            })
        )
    }

    async #checkBans() {
        console.log('\x1b[32m%s\x1b[0m', 'Revisando bans...')
        this.servers.map(async server => {
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

        setTimeout(() => {
            this.#checkBans()
        }, 900000)
    }

    async #checkBirthdays() {
        console.log('\x1b[34m%s\x1b[0m', 'Revisando cumpleaños...')
        const usersSnap = await this.db.collection('users').get()
        usersSnap.forEach(async user => {
            const birthday = user.data().birthday
            if (!birthday) return
            const [month, day, year] = birthday.split('/')

            //Check if it's the user's birthday
            if (year > new Date().getFullYear()) return
            if (month > new Date().getMonth() + 1 || day > new Date().getDate()) return
            //Celebrate user's birthday
            this.servers.map(async server => {
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
            this.db.collection('users').doc(user.id).update({ birthday: newBirthday })
        })

        setTimeout(() => {
            this.#checkBirthdays()
        }, 86400000)
    }

    async #onReady() {
        await this.#initializeServers()
        console.log('\x1b[34m%s\x1b[0m', 'Servidores Desplegados!!')

        await this.#checkBirthdays()
        await this.#checkBans()
        // ghost(this)

        InvitesTracker.init(this, {
            fetchGuilds: true,
            fetchVanity: true,
            fetchAuditLogs: true,
            exemptGuild: guild => {
                const server = this.getServer(guild)
                return !(server.logsChannels.invite && server.premium)
            }
        }).on('guildMemberAdd', (...args) => this.emit('inviteTrack', ...args))

        for (const command of this.application?.commands.cache.values() ?? []) {
            await command.delete()
        }

        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} Lista y Atenta!!!`)
    }

    #initWebSocket() {
        console.log('\x1b[36m%s\x1b[0m', 'Iniciando WebSocket...')
        this.#wsw = false
        // this.websocket = new WebSocket('ws://localhost:3000')
        this.websocket = new WebSocket('wss://oneki.up.railway.app/')

        this.websocket.on('open', () => {
            console.time('WebSocket Connection')
            this.websocket?.send(this.token)
            console.log('\x1b[33m%s\x1b[0m', 'Socket Conectado!!!')
            this.#wsInterval = setInterval(() => this.websocket?.ping(() => ''), 20_000)
            this.#wsintent = 1
        })

        this.websocket.on('close', () => {
            if (!this.reconect) return

            console.log('ws closed event')
            console.log(`WebSocket closed, reconnecting in ${5_000 * this.#wsintent++ + 1_000} miliseconds...`)
            clearInterval(this.#wsInterval)
            if (!this.#wsw) setTimeout(() => this.#initWebSocket(), 5_000 * this.#wsintent)
            this.#wsw = true
        })

        this.websocket.on('message', () => this.#onWebSocketMessage)

        this.websocket.on('error', async () => {
            if (!this.reconect) return

            console.log('ws error event')
            await sleep()
            if (!this.#wsw) {
                console.log(`WebSocket closed, reconnecting in ${5_000 * this.#wsintent++ + 2_000} miliseconds...`)
                clearInterval(this.#wsInterval)
                setTimeout(() => this.#initWebSocket(), 5_000 * this.#wsintent)
                this.#wsw = true
            }
        })
    }

    #onWebSocketMessage(message: string): void {
        try {
            const data = JSON.parse(message)
            if (data.event === 'error') {
                this.reconect = false
                console.error(data.message)
                // sendError(new Error(data.message), import.meta.url)
            } else if (data.event) this.emit(data.event, data.data)
        } catch (error) {
            if ((error as string).startsWith('SyntaxError')) console.error('SyntaxError on socket', message)
        }
    }
}
