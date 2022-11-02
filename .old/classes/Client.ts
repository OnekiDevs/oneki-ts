/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client as BaseClient, Collection, TextChannel, Guild, GuildMember, AttachmentBuilder, User } from 'discord.js'
import { ClientOptions, ClientConstants, UnoGame, Server, Message, Command, OldCommand } from '../utils/classes.js'
import InvitesTracker from '@androz2091/discord-invites-tracker'
import { Firestore, FieldValue } from '@google-cloud/firestore'
import { checkSend, sendError, sleep } from '../utils/utils.js'
import { EmbedBuilder } from '@discordjs/builders'
import { createRequire } from 'module'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdirSync } from 'fs'
import { WebSocket } from 'ws'
import i18n from 'i18n'

const __dirname = dirname(fileURLToPath(import.meta.url))
const version = createRequire(import.meta.url)('../../package.json').version

export class Client extends BaseClient<true> {
    db: Firestore
    version: string
    i18n = i18n
    commands = new Collection<string, Command>()
    oldCommands = new Collection<string, OldCommand>()
    servers = new Collection<string, Server>()
    constants: ClientConstants
    uno: Collection<string, UnoGame> = new Collection()
    embeds = new Collection<string, { embed: EmbedBuilder; interactionId: string }>()
    reconect = true
    #wsw = false
    #wsInterval!: ReturnType<typeof setInterval>
    #wsintent = 1
    websocket?: WebSocket
    cr: string

    constructor(options: ClientOptions) {
        super(options)

        this.i18n.configure(options.i18n)
        this.version = version ?? '1.0.0'

        for (const file of readdirSync(options.routes.oldCommands).filter(f => f.includes('.oldCommand.'))) {
            import('file:///' + join(options.routes.oldCommands, file)).then(command => {
                const cmd: OldCommand = new command.default(this)
                this.oldCommands.set(cmd.name, cmd)
            })
        }
    }

    async deployCommands(guild?: Guild) {
        if (process.env.DEPLOY_COMMANDS == 'true')
            return Promise.all(this.commands.map(command => command.deploy(guild)))
        else return Promise.resolve()
    }
}

export function ghost(client: Client) {
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
    const calulatePonts = (xp: number, t: number) => {
        const n = Math.round(Math.sqrt(100 * xp + 25) + 50)
        const p = Math.pow(n / 100 - 1, 2) / 2
        return Math.round(200 - ((t - 70) * 2 + p))
    }
    const caza = async (): Promise<any> => {
        let channel = client.channels.cache.get(getRandomChannelId()) as TextChannel
        const member = channel?.guild.members.cache.get('901956486064922624') as GuildMember
        if (!channel || !checkSend(channel, member)) return caza()
        // troleo
        if (Math.floor(Math.random() * 10) + 1 < 6) {
            const e = channel.guild.emojis.cache
                .filter(e => e.available)
                .map(e => `<${e.animated ? 'a' : ''}:${e.name}:${e.id}>`)
            const msg = ['se te perdió algo?', `${e[Math.floor(Math.random() * e.length)]}`, 'buscabas algo?']
            const m = await channel.send(msg[Math.floor(Math.random() * msg.length)])
            await sleep((Math.floor(Math.random() * 30) + 20) * 1000)
            channel = client.channels.cache.get(getRandomChannelId()) as TextChannel
            await m.delete()
            if (!channel || !checkSend(channel, member)) return caza()
        }
        // fin troleo
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
            const t = Math.floor((new Date().getTime() - message.createdTimestamp) / 1000)
            const points = calulatePonts(snapshot.data()?.[user.id] ?? 0, t)
            console.table([points, snapshot.data()?.[user.id] ?? 0, t])
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
    }
    if (process.env.NODE_ENV) caza()
}
