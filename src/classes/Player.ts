import {
    ButtonInteraction,
    ButtonBuilder,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    ButtonStyle
} from 'discord.js'
import Jimp from 'jimp'
import { UnoCard, UnoGame } from '../utils/classes.js'
import { randomId } from '../utils/utils.js'

export class Player {
    id: string
    cards: Array<UnoCard> = []
    interaction?: ButtonInteraction

    constructor(id: string, cards: UnoCard[]) {
        this.id = id
        const rc = () => cards[Math.floor(Math.random() * cards.length)]
        this.cards.push(rc(), rc(), rc(), rc(), rc(), rc(), rc())
    }

    addCard(card: UnoCard) {
        this.cards.push(card)
    }

    toString() {
        return `<@${this.id}>`
    }

    setInteraction(interaction: ButtonInteraction) {
        this.interaction = interaction
    }

    async cardsToImage(): Promise<Buffer> {
        let img = this.cards[0].img
        const c = new Jimp(
            this.cards.length <= 10
                ? (img.bitmap.width * this.cards.length) / 2 + img.bitmap.width / 2
                : (img.bitmap.width * this.cards.length) / 3 + (img.bitmap.width / 3) * 2,
            img.bitmap.height
        )

        let p = 0
        for (const { img: im } of this.cards) {
            c.composite(im, this.cards.length <= 10 ? (p * im.bitmap.width) / 2 : (p * im.bitmap.width) / 3, 0)
            p++
        }

        return c.getBufferAsync('image/png')
    }

    cardsToButtons({ actualCard, id }: UnoGame): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
        let j = 0,
            k = 0
        const buttons: ActionRowBuilder<MessageActionRowComponentBuilder>[] = []
        const dis = this.cards.filter(c => c.symbol == actualCard.symbol || c.color == actualCard.color)
        for (const i of dis) {
            const btn = new ButtonBuilder()
                .setStyle(
                    i.color == 'blue'
                        ? ButtonStyle.Primary
                        : i.color == 'green'
                        ? ButtonStyle.Success
                        : i.color == 'red'
                        ? ButtonStyle.Danger
                        : ButtonStyle.Secondary
                )
                .setLabel(`${i.symbol} ${i.color}`)
                .setCustomId(`uno_${id}_${i.id}_${randomId().slice(-2)}`)

            if (j == 0) buttons.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([btn]))
            else buttons[k].addComponents([btn])
            if (j == 4) {
                j = 0
                k++
            } else j++
        }
        return buttons
    }
}
