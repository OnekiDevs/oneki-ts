import { Client as BaseClient, Collection } from 'discord.js'
import admin from 'firebase-admin'
import {
    CommandManager,
    ClientOptions,
    ServerManager,
    ClientConstants,
    ButtonManager,
    OldCommandManager,
    anyFunction
} from '../utils/classes'
import { join } from 'path'
import { WebSocket } from 'ws'
import { readdirSync } from 'fs'
import { UnoGame } from './UnoGame'
import jlen from '../lang/en.json'
import jles from '../lang/es.json'

export class Client extends BaseClient {
    db
    version!: string
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
    constants: ClientConstants = {}
    private _wsInterval = setInterval(() => { }, 20000000)
    private _wsintent = 1
    uno: Collection<string, UnoGame> = new Collection()

    constructor(options: ClientOptions) {
        super(options)
        console.log(options.routes?.commands ?? join(__dirname, '../commands'), 'sdfgh')

        console.log(JSON.stringify(jlen, () => ''))
        console.log(JSON.stringify(jles, () => ''))

        this.oldCommands = new OldCommandManager(options.routes?.oldCommands ?? join(__dirname, '../oldCommands'))
        this.commands = new CommandManager(this, options.routes?.commands ?? join(__dirname, '../commands'))
        this.buttons = new ButtonManager(this, options.routes?.buttons ?? join(__dirname, '../buttons'))

        this.i18nConfig = options.i18n
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        this.version = require('../../package.json').version??'1.0.0'
        this.db
            ?.collection('s')
            .get()
            .then((s) => {
                s.forEach((s) => { })
            })
        if (options.firebaseToken) {
            admin.initializeApp({
                credential: admin.credential.cert(options.firebaseToken),
            })
            this.db = admin.firestore()
        }
        if (options.constants) this.constants = options.constants

        this.once('ready', () => this._onReady({ eventsPath: options.routes?.events ?? join(__dirname, '../events') }))

        this._initWebSocket()
    }

    private _initWebSocket() {
        try {
            this.websocket = new WebSocket('wss://oneki.herokuapp.com/')
            this.websocket.on('open', () => {
                console.time('WebSocket Connection')
                console.log('\x1b[33m%s\x1b[0m', 'Socket Conectado!!!')
                this._wsInterval = setInterval(() => this.websocket.ping(() => { }), 20000)
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
        this.servers.initialize().then(() => {
            console.log('\x1b[34m%s\x1b[0m', 'Servidores Desplegados!!')
            this.commands.deploy().then(() => {
                console.log('\x1b[32m%s\x1b[0m', 'Comandos Desplegados!!')
                this.initializeEventListener(options.eventsPath).then(() => {
                    console.log('\x1b[35m%s\x1b[0m', 'Eventos Cargados!!')
                    console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} Listo y Atento!!!`)
                })
            })
        })
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
                    const event = await import(join(path, file))

                    this.on(event.name, (...args) => event.run(...args))
                }),
        )
    }
}
