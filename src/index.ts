import { Client, GatewayIntentBits } from './utils/classes.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config()

const __dirname = dirname(fileURLToPath(import.meta.url))

const client: Client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
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
        components: join(__dirname, 'components')
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

client.login()

// client.on('ready', async (client) => {
//     await new Promise(resolve => setTimeout(resolve, 10_000))
//     console.log('deleting commands')    
//     for (const command of client.application.commands.cache.values()) await command.delete()
//     for (const guild of client.guilds.cache.values()) for (const command of guild.commands.cache.values()) await command.delete()
//     console.log('deleted commands')
// })