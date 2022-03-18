/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client as BaseClient, Collection, TextChannel, Guild } from 'discord.js'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { initializeApp, cert } from 'firebase-admin/app'
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
    ButtonManager,
    OldCommandManager,
    anyFunction,
    UnoGame,
    Server
} from '../utils/classes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const version = createRequire(import.meta.url)('../../package.json').version

export class Client extends BaseClient {
    db: Firestore
    version: string
    i18nConfig: {
        locales: string[];
        directory: string;
        defaultLocale: string;
        retryInDefaultLocale: boolean;
        objectNotation: boolean;
        logWarnFn: anyFunction;
        logErrorFn: anyFunction;
        missingKeyFn: anyFunction;
        mustacheConfig: {
            tags: [string, string];
            disable: boolean;
        }
    }
    commands: CommandManager
    oldCommands: OldCommandManager
    buttons: ButtonManager
    servers: ServerManager = new ServerManager(this)
    websocket: WebSocket = new WebSocket('wss://oneki.herokuapp.com/')
    constants: ClientConstants
    private _wsInterval = setInterval(() => '', 20000000)
    private _wsintent = 1
    uno: Collection<string, UnoGame> = new Collection()

    constructor(options: ClientOptions) {
        super(options)
        
        this.oldCommands = new OldCommandManager(this, options.routes.oldCommands)
        this.commands = new CommandManager(this, options.routes.commands)
        this.buttons = new ButtonManager(this, options.routes.buttons)

        this.i18nConfig = options.i18n
        this.version = version??'1.0.0'

        this.db = getFirestore(initializeApp({
            credential: cert(options.firebaseToken),
        }))

        this.constants = options.constants

        this.once('ready', () => this._onReady({ eventsPath: options.routes?.events ?? join(__dirname, '../events') }))

        this._initWebSocket()
    }

    private _initWebSocket() {
        try {
            this.websocket = new WebSocket('wss://oneki.herokuapp.com/')
            this.websocket.on('open', () => {
                console.time('WebSocket Connection')
                console.log('\x1b[33m%s\x1b[0m', 'Socket Conectado!!!')
                this._wsInterval = setInterval(() => this.websocket.ping(() => ''), 20000)
                this._wsintent = 1
            })
            this.websocket.on('close', () => {
                clearInterval(this._wsInterval)
                console.error('Socket Cerrado!!')
                console.timeEnd('WebSocket Connection')
                setTimeout(() => {
                    console.log('Reconectando Socket ...')
                    this._initWebSocket()
                }, 1_000 * this._wsintent++)
            })
            this.websocket.on('message', () => this._onWebSocketMessage)
            this.websocket.on('error', () => {
                console.log('Socket no disponible\nReintentando en un momento...')
                setTimeout(() => {
                    console.log('Reconectando Socket...')
                    this._initWebSocket()
                }, 1_000 * this._wsintent++)
            })
        } catch (error) {
            console.log('Socket no disponible\nReintentando en un momento...')
            setTimeout(() => {
                console.log('Reconectando Socket...')
                this._initWebSocket()
            }, 1_000 * this._wsintent++)
        }
    }

    private async _onReady(options: { eventsPath: string }) {
        await this.servers.initialize()
        console.log('\x1b[34m%s\x1b[0m', 'Servidores Desplegados!!')

        await this.commands.deploy()
        console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados!!')

        await this.initializeEventListener(options.eventsPath)
        console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')
        
        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} Lista y Atenta!!!`)
        
        this._checkBirthdays()
    }

    private _onWebSocketMessage(message: string): void {
        try {
            const data = JSON.parse(message)
            if (data.event) this.emit(data.event, data.data)
        } catch (error) {
            if ((error as string).startsWith('SyntaxError')) console.error('SyntaxError on socket', message)
        }
    }

    initializeEventListener(path: string) {
        return Promise.all(
            readdirSync(path)
                .filter((f) => f.endsWith('.event.js'))
                .map(async (file) => {
                    const event = await import('file:///'+join(path, file))

                    this.on(event.name, (...args) => event.run(...args))
                }),
        )
    }


    private async _checkBirthdays(){
        const usersSnap = await this.db.collection('users').get()
        usersSnap.forEach(async user => {
            
            const birthday = user.data().birthday
            if (!birthday) return
            const [ month, day, year ] = birthday.split('/')

            //Check if it's the user's birthday
            if(parseInt(year) > new Date().getFullYear()) return
            if(parseInt(month) != new Date().getMonth() + 1 || parseInt(day) != new Date().getDate()) return
            
            //Celebrate user's birthday
            this.servers.map(async server => {
                console.log(server.logsChannels)
                
                const birthdayChannel = server.logsChannels.birthdayChannel
                if(!birthdayChannel) return

                /* Revisar si el usuario está en el servidor */
                let member = server.guild.members.cache.get(user.id)
                if(!member) member = await server.guild.members.fetch(user.id) //Si no está en la cache
                if(!member) return //Si no está tampoco en la API retornamos

                /* Revisar si el canal sigue existiendo y obtenerlo */
                let channel = server.guild.channels.cache.get(birthdayChannel) as TextChannel
                if(!channel) channel = await server.guild.channels.fetch(birthdayChannel) as TextChannel
                if(!channel) return server.removeBirthdayChannel() //Si no está tampoco en la API lo borramos de la base de datos
                
                channel.send(server.logsChannels.birthdayMessage?.replaceAll('{username}',`<@${user.id}>`)??`Feliz cumpleaños <@${user.id}>!!`)
            })

            //Update user's birthday
            console.log('year',year)
            console.log('parseintyear',parseInt(year))
            console.log('parseintyearmas1',parseInt(year)+1)
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
}
