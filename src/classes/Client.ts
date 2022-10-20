/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client as BaseClient, Collection, TextChannel, Guild, GuildMember, AttachmentBuilder, User } from 'discord.js'
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore'
import InvitesTracker from '@androz2091/discord-invites-tracker'
import { initializeApp, cert } from 'firebase-admin/app'
import { EmbedBuilder } from '@discordjs/builders'
import { checkSend, sendError } from '../utils/utils.js'
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
    Message
} from '../utils/classes.js'
import i18n from 'i18n'
import { sleep } from '../utils/utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const version = createRequire(import.meta.url)('../../package.json').version

export class Client extends BaseClient<true> {
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
    embeds = new Collection<string, { embed: EmbedBuilder; interactionId: string }>()
    reconect = true
    _wsw = false

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
        this._wsw = false
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

            console.log('ws closed event')
            console.log(`WebSocket closed, reconnecting in ${5_000 * this._wsintent++} miliseconds...`)
            clearInterval(this._wsInterval)
            // if (!this._wsw) setTimeout(() => this._initWebSocket(), 5_000 * this._wsintent)
            this._wsw = true
        })

        this.websocket.on('message', () => this._onWebSocketMessage)

        this.websocket.on('error', () => {
            if (!this.reconect) return

            console.log('ws error event')
            console.log(`WebSocket closed, reconnecting in ${5_000 * this._wsintent++} miliseconds...`)
            clearInterval(this._wsInterval)
            // if (!this._wsw) setTimeout(() => this._initWebSocket(), 5_000 * this._wsintent)
            this._wsw = true
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
        ghost(this)

        InvitesTracker.init(this, {
            fetchGuilds: true,
            fetchVanity: true,
            fetchAuditLogs: true,
            exemptGuild: guild => {
                const server = this.getServer(guild)
                return !(server.logsChannels.invite && server.premium)
            }
        }).on('guildMemberAdd', (...args) => this.emit('customGuildMemberAdd', ...args))

        for (const command of this.application?.commands.cache.values() ?? []) {
            await command.delete()
        }

        console.log('\x1b[31m%s\x1b[0m', `${this.user?.username} ${this.version} Lista y Atenta!!!`)
    }

    private _onWebSocketMessage(message: string): void {
        try {
            const data = JSON.parse(message)
            if (data.event === 'error') {
                this.reconect = false
                console.error(data.message)
                sendError(new Error(data.message), import.meta.url)
            } else if (data.event) this.emit(data.event, data.data)
        } catch (error) {
            if ((error as string).startsWith('SyntaxError')) console.error('SyntaxError on socket', message)
        }
    }

    initializeEventListener(path: string) {
        return Promise.all(
            readdirSync(path, { withFileTypes: true }).map(async file => {
                if (file.isDirectory()) {
                    readdirSync(join(path, file.name))
                        .filter(f => f.endsWith('.event.js'))
                        .forEach(async f => {
                            const event = await import('file:///' + join(path, file.name, f))
                            const [eventName] = f.split('.')
                            this.on(eventName, (...args) => event.default(...args))
                        })
                } else if (file.name.endsWith('.event.js')) {
                    const event = await import('file:///' + join(path, file.name))
                    const [eventName] = file.name.split('.')
                    this.on(eventName, (...args) => event.default(...args))
                }
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

function ghost(client: Client) {
    const getRandomChannelId = () => {
        const c = [
            // '1030688845475360879' // test
            '972563930830483470',
            '996613158527586354',
            '972563930830483473',
            '1009913867998076998',
            '996612762350387210',
            '972563931233148980',
            '972563931233148981',
            '972563931233148982',
            '996818789154951189',
            '972563931233148983',
            '972563931233148984',
            '972579441760952340',
            '996780304956149780',
            '972591254149922866',
            '972563931233148978',
            '1013863203530346566',
            '1013863331930570772',
            '999102000375529643'
        ]
        return c[Math.floor(Math.random() * c.length)]
    }
    const randomTime = () => (Math.floor(Math.random() * 15) + 5) * 60000
    const calulatePonts = (xp: number, t: number) =>
        Math.round(150 - ((t - 70) * 2 + Math.pow(Math.round((Math.sqrt(100 * xp + 25) + 50) / 100) - 1, 3) / 2))
    const caza = async (): Promise<any> => {
        const channel = client.channels.cache.get(getRandomChannelId()) as TextChannel
        const member = client.guilds.cache
            .get('972563929836445778')
            ?.members.cache.get('901956486064922624') as GuildMember
        if (!channel || !checkSend(channel, member)) return caza()
        const message = (await channel.send({
            files: [
                new AttachmentBuilder(
                    'https://www.kindpng.com/picc/m/392-3922815_cute-kawaii-chibi-ghost-halloween-asthetic-tumblr-cartoon.png'
                )
            ]
        })) as Message<true>
        try {
            // get reaction
            const reactions = await message.awaitReactions({ time: 60_000, max: 1, errors: ['time'] })
            message.delete().catch(() => null)
            if (!reactions.size) return sleep(randomTime()).then(caza)
            const reaction = reactions.first()
            if (!reaction) return sleep(randomTime()).then(caza)
            const user = reaction.users.cache.first() as User
            const ref = await client.db.collection('guilds').doc(message.guild.id).collection('events').doc('ghost2022')
            const snapshot = await ref.get()
            // calculate points
            const points = calulatePonts(
                snapshot.data()?.[user.id] ?? 0,
                Math.floor((new Date().getTime() - message.createdTimestamp) / 1000)
            )
            // update database and notify
            const obj = {
                [user.id]: FieldValue.increment(points)
            }
            ref.update(obj).catch(() => ref.set(obj).catch(console.error))
            message.channel
                .send(`${points} puntos para <@${user.id}>`)
                .then(m => sleep(5_000).then(() => m.delete().catch(() => null)))
            console.table({
                user: user.username,
                points,
                total: (snapshot.data()?.[user.id] ?? 0) + points,
                channel: channel.name
            })
            ;(message.guild.channels.cache.get('1030688845475360879') as TextChannel).send({
                content: `${points} puntos para <@${user.id}> en <#${channel.id}>`,
                allowedMentions: { users: [] }
            })
            await sleep(randomTime())
            caza()
        } catch (error) {
            message.delete().catch(() => null)
            await sleep(randomTime())
            caza()
        }
        //!troleo
        //     if(ch){
        //         if(ch.id !== '850338969135611926' && (Math.floor(Math.random()*5)+1) > 3){
        //             const e = ch.guild.emojis.cache.filter(e=>e.available).map(e=>`<${e.animated?'a':''}:${e.name}:${e.id}>`)
        //             const msg = [
        //                 'se te perdió algo?',
        //                 'buscabas algo?',
        //                 `${e[Math.floor(Math.random()*e.length)]}`
        //             ]
        //             const m = await ch.send(msg[Math.floor(Math.random()*msg.length)])
        //             await util.sleep((Math.floor(Math.random()*30)+20)*1000)
        //             ch = client.channels.cache.get(channel())
        //             await m.delete()
        //         }
    }
    if (process.env.NODE_ENV) caza()
}
