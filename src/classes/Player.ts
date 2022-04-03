import { ButtonInteraction, MessageButton, MessageActionRow } from 'discord.js'
import canvas from 'canvas'
import { UnoCard, randomCard, UnoGame } from '../utils/classes.js'
import { randomId } from '../utils/utils.js'
import { MessageButtonStyles } from 'discord.js/typings/enums'

export class Player {
    id: string
    cards: Array<UnoCard> = []
    interaction?: ButtonInteraction

    constructor(id: string) {
        this.id = id
        this.cards.push(randomCard(), randomCard(), randomCard(), randomCard(), randomCard(), randomCard(), randomCard())
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
        let img = await canvas.loadImage(this.cards[0].url)
        const c = canvas.createCanvas(
            this.cards.length <= 10
                ? (img.width * this.cards.length) / 2 + img.width / 2
                : (img.width * this.cards.length) / 3 + (img.width / 3) * 2,
            img.height,
        )
        const ctx = c.getContext('2d')
        let p = 0
        for (const i of this.cards) {
            
            img = await canvas.loadImage(i.url)
            ctx.drawImage(
                img,
                this.cards.length <= 10 ? (p * img.width) / 2 : (p * img.width) / 3,
                0,
                img.width,
                img.height,
            )
            p++
        }
        
        return Promise.resolve(c.toBuffer('image/png'))
    }

    cardsToButtons(game: UnoGame): MessageActionRow[] {
        
        let j = 0, k = 0
        const buttons: MessageActionRow[] = []
        const dis = this.cards.filter((c) => c.symbol == game.actualCard.symbol || c.color == game.actualCard.color)
        for (const i of dis) {
            const btn = new MessageButton()
                .setStyle(
                    i.color == 'blue'
                        ? MessageButtonStyles.PRIMARY
                        : i.color == 'green'
                            ? MessageButtonStyles.SUCCESS
                            : i.color == 'red'
                                ? MessageButtonStyles.DANGER
                                : MessageButtonStyles.SECONDARY,
                )
                .setLabel(`${i.symbol} ${i.color}`)
                .setCustomId(`uno_${game.id}_${i.id}_${randomId().slice(-2)}`)
            
            if (j == 0) buttons.push(new MessageActionRow().addComponents([btn]))
            else buttons[k].addComponents([btn])
            if (j == 4) {
                j = 0
                k++
            } else j++
        }
        
        return buttons
    }
}
