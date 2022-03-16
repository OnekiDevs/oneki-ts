import { config } from 'dotenv'
config()

import { Client } from './utils/classes.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { newServer } from './utils/utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const client: Client = new Client({
    intents: [
        'DIRECT_MESSAGES',
        'GUILD_MESSAGES',
        'GUILDS',
        'GUILD_WEBHOOKS',
        'GUILD_BANS',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_VOICE_STATES'
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
        logWarnFn: msg => console.warn('WARN', msg),
        logErrorFn: msg => console.error('ERROR', msg),
        missingKeyFn: msg => console.error('LANG', msg),
        mustacheConfig: {
            tags: ['{{', '}}'],
            disable: false
        }
    }
})

client.login(process.env.DISCORD_TOKEN)

client.ws.on('INTERACTION_CREATE', async interaction => {
    if (interaction.type !== 2) return
    const { data: {name: commandName, options: [{name: subcommandGroup, options:[{name: subcommand}]}]} } = interaction
    if (!(commandName === 'config' && subcommandGroup === 'import' && subcommand === 'file')) return
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
    const { prefixies, lang, logs_channels } = await req.json()
    const obj = {
        prefixies, lang, logs_channels
    }

    newServer(client.guilds.cache.get(interaction.guild_id)!, obj) 
    
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
