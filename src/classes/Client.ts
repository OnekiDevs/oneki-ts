/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client as BaseClient, Collection, TextChannel, Guild } from 'discord.js'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
// import InvitesTracker from '@androz2091/discord-invites-tracker'
import { initializeApp, cert } from 'firebase-admin/app'
import { EmbedBuilder } from '@discordjs/builders'
import { sendError } from '../utils/utils.js'
import { createRequire } from 'module'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdirSync } from 'fs'
import { WebSocket } from 'ws'
import {
    CommandManager,
    ClientOptions,
    ServerManager,
    ClientConstants,
    ComponentManager,
    OldCommandManager,
    UnoGame,
    Server,
    UnoCards
} from '../utils/classes.js'
import i18n from 'i18n'

const __dirname = dirname(fileURLToPath(import.meta.url))
const version = createRequire(import.meta.url)('../../package.json').version

export class Client extends BaseClient {
    db: Firestore
    version: string
    i18n = i18n
    commands: CommandManager
    oldCommands: OldCommandManager
    components: ComponentManager
    servers: ServerManager = new ServerManager(this)
    websocket?: WebSocket
    constants: ClientConstants
    private _wsInterval!: ReturnType<typeof setInterval>
    private _wsintent = 1
    uno: Collection<string, UnoGame> = new Collection()
    UnoCards = UnoCards
    embeds = new Collection<string, { embed: EmbedBuilder; interactionId: string }>()
    reconect = true

    constructor(options: ClientOptions) {
        super(options)

        this.oldCommands = new OldCommandManager(this, options.routes.oldCommands)
        this.commands = new CommandManager(this, options.routes.commands)
        this.components = new ComponentManager(this, options.routes.components)

        this.i18n.configure(options.i18n)
        this.version = version ?? '1.0.0'

        this.db = getFirestore(
            initializeApp({
                credential: cert(options.firebaseToken)
            })
        )

        this.constants = options.constants

        this.once('ready', () => this._onReady({ eventsPath: options.routes?.events ?? join(__dirname, '../events') }))

        this._initWebSocket()
    }

    get embedFooter() {
        return {
            text: `${this.user?.username} Bot v${this.version}`,
            iconURL: this.user?.avatarURL() as string
        }
    }

    private _initWebSocket() {
        console.log('\x1b[36m%s\x1b[0m', 'Iniciando WebSocket...')
        // this.websocket = new WebSocket('ws://localhost:3000')
        this.websocket = new WebSocket('wss://oneki.up.railway.app/')

        this.websocket.on('open', () => {
            console.time('WebSocket Connection')
            this.websocket?.send(this.token)
            console.log('\x1b[33m%s\x1b[0m', 'Socket Conectado!!!')
            this._wsInterval = setInterval(() => this.websocket?.ping(() => ''), 20_000)
            this._wsintent = 1
        })

        this.websocket.on('close', () => {
            if (!this.reconect) return

            console.log(`WebSocket closed, reconnecting in ${5_000 * this._wsintent++} seconds...`)
            clearInterval(this._wsInterval)
            setTimeout(() => this._initWebSocket(), 5_000 * this._wsintent)
        })

        this.websocket.on('message', () => this._onWebSocketMessage)

        this.websocket.on('error', () => {
            if (!this.reconect) return

            console.log(`WebSocket closed, reconnecting in ${5_000 * this._wsintent++} seconds...`)
            clearInterval(this._wsInterval)
            setTimeout(() => this._initWebSocket(), 5_000 * this._wsintent)
        })
    }

    private async _onReady(options: { eventsPath: string }) {
        await this.servers.initialize()
        console.log('\x1b[34m%s\x1b[0m', 'Servidores Desplegados!!')

        await this.commands.deploy()
        console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados!!')

        await this.initializeEventListener(options.eventsPath)
        console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')

        await this._checkBirthdays()
        await this.checkBans()

        // InvitesTracker.init(this, {
        //     fetchGuilds: true,
        //     fetchVanity: true,
        //     fetchAuditLogs: true,
        //     exemptGuild: guild => {
        //         const server = this.getServer(guild)
        //         return !(server.logsChannels.invite && server.premium)
        //     }
        // }).on('guildMemberAdd', (...args) => this.emit('customGuildMemberAdd', ...args))

        // for (const command of this.application?.commands.cache.values()??[]) {
        //     await command.delete()
        // }

        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} Lista y Atenta!!!`)
    }

    private _onWebSocketMessage(message: string): void {
        try {
            const data = JSON.parse(message)
            if (data.event === 'error') {
                this.reconect = false
                console.error(data.message)
                sendError(this, new Error(data.message), import.meta.url)
            } else if (data.event) this.emit(data.event, data.data)
        } catch (error) {
            if ((error as string).startsWith('SyntaxError')) console.error('SyntaxError on socket', message)
        }
    }

    initializeEventListener(path: string) {
        return Promise.all(
            readdirSync(path)
                .filter(f => f.includes('.event.'))
                .map(async file => {
                    const event = await import('file:///' + join(path, file))
                    const [eventName] = file.split('.')
                    this.on(eventName, (...args) => event.default(...args))
                })
        )
    }

    private async checkBans() {
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
            this.checkBans()
        }, 900000)
    }

    private async _checkBirthdays() {
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
            this._checkBirthdays()
        }, 86400000)
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

    /**
     * Get a Server Class
     * @param {Guild} guild - guild to refer. it is necessary to create the class in case the server doesn't exist, if you don't have the Guild, try client.servers.ger(guild_id)
     * @returns a Server Class
     */
    getServer(guild: Guild): Server {
        return this.servers.get(guild.id) ?? this.newServer(guild)
    }
}
