import InvitesTracker from '@androz2091/discord-invites-tracker'
import { Guild, Intents } from 'discord.js'
import { Client, GuildDataBaseModel, SuggestChannelObject } from './utils/classes.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config()

const __dirname = dirname(fileURLToPath(import.meta.url))

const client: Client = new Client({
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MEMBERS
    ],
    partials: ['CHANNEL'],
    firebaseToken: JSON.parse(process.env.FIREBASE_TOKEN as string),
    constants: {
        newServerLogChannel: '885674115946643458',
        imgChannel: '885674115946643456',
        errorChannel: '885674115615301651',
        jsDiscordRoll: '885674114663211038'
    },
    routes: {
        commands: join(__dirname, 'commands'),
        oldCommands: join(__dirname, 'oldCommands'),
        events: join(__dirname, 'events'),
        buttons: join(__dirname, 'buttons')
    },
    i18n: {
        locales: ['en', 'es'],
        directory: join(__dirname, '..', 'lang'),
        defaultLocale: 'en',
        retryInDefaultLocale: true,
        objectNotation: true,
        logWarnFn: msg => console.warn('WARN _l', msg),
        logErrorFn: msg => console.error('ERROR _l', msg),
        missingKeyFn: msg => console.error('LANG _l', msg),
        mustacheConfig: {
            tags: ['{{', '}}'],
            disable: false
        }
    }
})

InvitesTracker.init(client, {
    fetchGuilds: true,
    fetchVanity: true,
    fetchAuditLogs: true
}).on('guildMemberAdd', (member, type, invite) => client.emit('customGuildMemberAdd', member, type, invite))

client.login(process.env.DISCORD_TOKEN)

client.ws.on('INTERACTION_CREATE', async interaction => {

    if (interaction.type !== 2) return    

    if (interaction.data.name !== 'config') return
    if (interaction.data.options?.[0].name !== 'import') return
    if (interaction.data.options?.[0].options?.[0].name !== 'file') return

    const command = interaction.data.options[0].options[0]

    await fetch(`https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`, {
        method: 'POST',
        body: JSON.stringify({
            type: 5
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!(interaction.data.resolved.attachments[command.options[0].value].filename as string).endsWith('.json'))
        return fetch(
            `https://discord.com/api/v10/webhooks/${client.user?.id}/${interaction.token}/messages/@original`,
            {
                method: 'POST',
                body: JSON.stringify({
                    type: 4,
                    data: {
                        content: 'Requires a `.json` file'
                    }
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

    const req = await fetch(interaction.data.resolved.attachments[command.options[0].value].url)
    const guild = (await client.guilds.fetch(interaction.guild_id)) as Guild
    const server = client.servers.get(guild.id)??client.newServer(guild)

    const { prefixes, lang, logs_channels, birthday, suggest_channels, autoroles, emoji_analisis_enabled } = await req.json() as GuildDataBaseModel

    if (prefixes) server.prefixes = prefixes
    if (lang) server.lang = lang
    if (logs_channels) {
        const { message_update, message_delete, message_attachment } = logs_channels

        if (message_update) server.setMessageDeleteLog(message_update)
        if (message_delete) server.setMessageDeleteLog(message_delete)
        if (message_attachment) server.setMessageAttachmentLog(message_attachment)
    }
    if (birthday) {
        const { message, channel } = birthday

        if (channel) server.setBirthdayChannel(channel)
        if (message) server.setBirthdayMessage(message)
    }
    suggest_channels?.forEach((channel: SuggestChannelObject) => {
        if (channel.channel_id) delete channel.channel_id
        server.addSuggestChannel(channel)
    })
    if (autoroles) for (const [key, value] of Object.entries(autoroles)) {
        server.autoroles.set(key, new Set(value))
    } 
    if (emoji_analisis_enabled) server.startEmojiAnalisis()
    server.syncDB(true)

    await fetch(`https://discord.com/api/v10/webhooks/${client.user?.id}/${interaction.token}/messages/@original`, {
        method: 'PATCH',
        body: JSON.stringify({
            content: 'Configuration loaded'
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(console.error)
    return
})
