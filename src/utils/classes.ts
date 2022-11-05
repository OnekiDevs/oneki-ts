import { GuildMember } from 'discord.js'

import Server from '../classes/Server.js'
export { Server }

export * from '../classes/Player.js'
export * from '../classes/UnoCards.js'
export * from '../classes/Players.js'
export * from '../classes/UnoGame.js'
export interface GuildMemberOptions {
    server: Server
    oldMember: GuildMember
    newMember: GuildMember
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type anyFunction = (msg: string, k?: any) => any
