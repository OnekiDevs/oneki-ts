/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { sleep } from '../utils/utils.js'
import { Player } from './Player.js'
import { UnoGame } from './UnoGame.js'

export class Players extends Array<Player> {
    game: UnoGame
    constructor(game: UnoGame) {
        super()
        this.game = game
    }

    add(player: Player) {
        this.push(player)
    }
    get(id: string) {
        return this.find(p => p.id == id)
    }
    has(id: string) {
        return !!this.find(p => p.id == id)
    }
    toString() {
        return this.map(p => `${p}`).join(', ')
    }
    get size() {
        return this.length
    }
    first() {
        return this[0]
    }
    async rotate(rigth: boolean) {
        console.log(this.keys())
        if (rigth) this.push(this.shift()!)
        else this.unshift(this.pop()!)
        this.#updateMessage()
        return this
    }
    async #updateMessage() {
        await sleep(3_000)
        if (
            this.game.message.embeds[0].data.description !=
            this.game.server.translate('uno_old.turn', { user: this.game.turn })
        )
            this.game.message.edit(this.game.embed)
    }
}
