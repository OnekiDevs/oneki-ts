import { Collection } from 'discord.js'

export default new Collection<string, PollDatabaseModel>()

export interface PollDatabaseModel {
    title: string
    context: string
    options: { id: number; title: string; votes: string[] }[]
    show_results: boolean
    message: string
    channel: string
    guild: string
    block_choice: boolean
    multiple_choice: boolean
    author: string
}
