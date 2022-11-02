import { Collection, Guild } from 'discord.js'
import { Client as BaseClient } from 'offdjs'
import { ClientConstants, ClientOptions } from '../utils/classes.js'
import Server from './Server.js'
import { WebSocket } from 'ws'
import { sleep } from '../utils/utils.js'
import { Firestore } from '@google-cloud/firestore'
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
