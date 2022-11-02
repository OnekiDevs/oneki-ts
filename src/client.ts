import './utils/writeCredentials.js'
import { GatewayIntentBits } from 'discord.js'
import { join } from 'path'
import Client from './classes/Client.js'

export default new Client({
    routes: {
        events: join(process.cwd(), 'build', 'events'),
        commands: join(process.cwd(), 'build', 'commands'),
        interactions: join(process.cwd(), 'build', 'interactions')
    },
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    i18n: {
        locales: ['en', 'es', 'ja', 'ru'],
        directory: join(process.cwd(), 'lang'),
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
            // sendError(
            //     new Error(`Missing translation for "${value}" in "${locale}"`),
            //     join(import.meta.url, '..', '..', 'lang', locale + '.json')
            // )
            return value ?? '_'
        },
        mustacheConfig: {
            tags: ['{{', '}}'],
            disable: false
        }
    },
    interactionSplit: ':',
    syncCommands: 'local_to_remote',
    constants: {
        newServerLogChannel: '885674115946643458',
        imgChannel: '885674115946643456',
        errorChannel: '885674115615301651',
        jsDiscordRoll: '885674114663211038',
        issuesChannel: '1036769217346814042'
    }
})
