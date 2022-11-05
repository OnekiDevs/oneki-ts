import '../utils/writeCredentials.js'
import { Firestore } from '@google-cloud/firestore'

export default new Firestore({ keyFilename: './google_credentials.json' })

export interface SuggestChannelObject {
    channel: string
    default: boolean
    alias?: string
}

export interface LogsChannelsDatabaseModel {
    message_update?: string
    message_delete?: string
    message_attachment?: string
    invite?: string
    member_update?: string
    sanction?: string
}

export interface GuildDataBaseModel {
    yt_notification_channel?: string
    yt_notification_message?: string
    prefixes?: string[]
    suggest_channels?: SuggestChannelObject[]
    last_suggest?: number
    logs_channels?: LogsChannelsDatabaseModel
    premium?: boolean
    birthday?: {
        channel?: string
        message?: string
    }
    blacklisted_words?: string[]
    disabled_channels?: string[]
    keep_roles?: boolean
    emoji_analisis_enabled?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emoji_statistics?: any
    autoroles?: { [key: string]: string[] }
}
