import BastaGame from '../classes/BastaGame.js'
import { Collection } from 'discord.js'

export default {
    games: new Collection<string, BastaGame>(),
    tempGames: new Collection<string, Set<string>>()
}
