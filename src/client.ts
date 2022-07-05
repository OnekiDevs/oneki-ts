import { Client, GatewayIntentBits } from './utils/classes.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import { sendError } from './utils/utils.js'

config()

const __dirname = dirname(fileURLToPath(import.meta.url))

export default new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent
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
        fallbacks: {
            'en-*': 'en',
            'es-*': 'es'
        },
        logWarnFn: (msg: string) => console.warn('WARN _l', msg),
        logErrorFn: (msg: string) => console.error('ERROR _l', msg),
        missingKeyFn: (locale: string, value: string) => {
            sendError(
                new Error(`Missing translation for "${value}" in "${locale}"`),
                join(import.meta.url, '..', '..', 'lang', locale + '.json')
            )
            return value ?? '_'
        },
        mustacheConfig: {
            tags: ['{{', '}}'],
            disable: false
        }
    }
})
