import { GuildMember, PermissionResolvable } from 'discord.js'

import { ClientOptions as BaseClientOptions } from 'offdjs'

import Client from '../classes/Client.js'
import Server from '../classes/Server.js'
export default Client
export { Client, Server }

export * from '../classes/Client.js'
export * from '../classes/Server.js'

export * from '../classes/Player.js'
export * from '../classes/UnoCards.js'
export * from '../classes/Players.js'
export * from '../classes/UnoGame.js'

export interface oldCommandData {
    name: string
    description: string
    category: string
    alias: string[]
    user_permisions: PermissionResolvable[]
    bot_permisions: PermissionResolvable[]
    use: string
    example: string
    module: 'mts' | 'mpy' | 'mrs'
    type: 'slash' | 'command'
}

export interface PollDatabaseModel {
    guild: string
    options: {
        name: string
        value: string
        votes: string[]
    }[]
    show_results: boolean
    title: string
    context: string
    multiple_choices: boolean
    author: string
    block_choices: boolean
    message: string
    channel: string
}

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

export interface ClientConstants {
    newServerLogChannel: string
    imgChannel: string
    errorChannel: string
    jsDiscordRoll: string
    issuesChannel: string
}

export interface ClientOptions extends BaseClientOptions {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // firebaseToken?: any
    constants: ClientConstants
}

export interface GuildMemberOptions {
    server: Server
    oldMember: GuildMember
    newMember: GuildMember
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type anyFunction = (msg: string, k?: any) => any
