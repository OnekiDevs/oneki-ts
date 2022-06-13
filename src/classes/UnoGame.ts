import {
    Client,
    Player,
    Players,
    UnoCard,
    randomCard,
    Server,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    Message
} from '../utils/classes.js'
import { randomId, imgToLink, Translator } from '../utils/utils.js'
import { ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder } from 'discord.js'
import EventEmitter from 'node:events'

export class UnoGame extends EventEmitter {
    host: Player
    client: Client
    players: Players = new Players(this)
    status = 'waiting'
    id: string = randomId()
    minPlayers = 1
    message!: Message
    actualCard: UnoCard
    direction = true
    winner: Player | undefined
    server: Server

    constructor(msg: Message<true>, client: Client) {
        super()

        this.server = client.getServer(msg.guild)

        this.host = new Player(msg.author.id, client)
        this.client = client

        this.players.add(this.host)
        msg.reply(this.embed).then(message => (this.message = message))
        this.actualCard = randomCard(this.client)

        this.client.uno.set(this.id, this)

        this.on('join', player => {
            this.players.add(player)
            this.message?.edit(this.embed)
        })

        this.on('eat', async (player: Player, interaction: ButtonInteraction) => {
            const translate = Translator(interaction)
            console.time('uno_eat')
            player.addCard(randomCard(this.client))
            const nesesitoAyuda = await player.interaction?.editReply({
                content: translate('uno_cmd.updating'),
                components: []
            })
            if (!nesesitoAyuda) return
            const cards = await player.cardsToImage(),
                components = player.cardsToButtons(this),
                content =
                    translate('uno_cmd.' + player.toString() == this.turn.toString() ? 'your_turn' : 'turn') +
                    '\n' +
                    (await imgToLink(cards, this.client))
            await player.interaction?.editReply({ content, components })
        })

        this.on('start', () => {
            this.status = 'started'
            this.message?.edit(this.embed)
        })

        this.on('new', () => {
            this.message.channel.send(this.embed).then(msg => {
                this.message.delete()
                this.message = msg
            })
        })

        this.on('showCards', async (player: Player, interaction: ButtonInteraction) => {
            const translate = Translator(interaction)
            const cards = await player.cardsToImage()
            const components = player.cardsToButtons(this)
            const content =
                translate('uno_cmd.' + player.toString() == this.turn.toString() ? 'your_turn' : 'turn') +
                '\n' +
                (await imgToLink(cards, this.client))
            player.interaction?.editReply({ content, components })
        })

        this.on('play', async (player: Player, card: UnoCard, interaction: ButtonInteraction) => {
            const translate = Translator(interaction)
            if (player.id !== this.turn.id) return interaction.deferUpdate()
            await interaction.deferUpdate()

            const ioctd = player.cards.map(c => c.id).indexOf(card.id)
            player.cards.splice(ioctd, 1)

            // check winer
            if (player.cards.length === 0) {
                player.interaction?.editReply({
                    content: translate('uno_cmd.gg'),
                    components: []
                })
                this.winner = player
                this.status = 'end'
                this.message.edit(this.embed)
                return
            }

            await player.interaction?.editReply({
                content: translate('uno_cmd.updating'),
                components: []
            })

            this.actualCard = card
            let cards, components, content

            if (card.symbol == '+2') {
                await this.players.rotate(this.direction)
                await this.turn.interaction?.editReply({
                    content: translate('uno_cmd.updating'),
                    components: []
                })
                this.turn.addCard(randomCard(this.client))
                this.turn.addCard(randomCard(this.client))
                cards = await this.turn.cardsToImage()
                content = translate('uno_cmd.your_turn') + '\n' + (await imgToLink(cards, this.client))
                components = this.turn.cardsToButtons(this)
                this.turn.interaction?.editReply({ content, components })
            } else if (card.symbol == 'reverse') {
                this.direction = !this.direction
                await this.players.rotate(this.direction)
                components = this.turn.cardsToButtons(this)
                content = translate('uno_cmd.your_turn') + '\n' + this.turn.interaction?.message.content
                this.turn.interaction?.editReply({ content, components })
            } else if (card.symbol == 'cancell') {
                await this.players.rotate(this.direction)
                await this.players.rotate(this.direction)
                components = this.turn.cardsToButtons(this)
                content = translate('uno_cmd.your_turn') + '\n' + this.turn.interaction?.message.content
                this.turn.interaction?.editReply({ content, components })
            } else if (card.id == 'p4') {
                await this.players.rotate(this.direction)
                await this.turn.interaction?.editReply({
                    content: translate('uno_cmd.your_turn') + '\n' + translate('uno_cmd.updating'),
                    components: []
                })
                this.turn.addCard(randomCard(this.client))
                this.turn.addCard(randomCard(this.client))
                this.turn.addCard(randomCard(this.client))
                this.turn.addCard(randomCard(this.client))
                cards = await this.turn.cardsToImage()
                content = translate('uno_cmd.your_turn') + '\n' + (await imgToLink(cards, this.client))
                components = this.turn.cardsToButtons(this)
                this.turn.interaction?.editReply({ content, components })
                //pedir color
            } else await this.players.rotate(this.direction)

            cards = await player.cardsToImage()
            components = player.cardsToButtons(this)
            content =
                translate('uno_cmd.turn', { user: this.turn.toString() }) + '\n' + (await imgToLink(cards, this.client))
            if (this.turn.id !== player.id) player.interaction?.editReply({ content, components })
            this.message.edit(this.embed)
            return
        })
    }

    get turn(): Player {
        return this.players.first()
    }

    get embed(): {
        embeds: EmbedBuilder[]
        components?: ActionRowBuilder<MessageActionRowComponentBuilder>[]
    } {
        const embed = new EmbedBuilder()
            .setTitle('Uno Game v1.1')
            .setDescription(
                this.status == 'waiting'
                    ? this.server.translate('uno_cmd.waiting')
                    : this.status === 'end'
                    ? this.server.translate('uno_cmd.end', { user: this.winner })
                    : this.server.translate('uno_cmd.turn', { user: this.turn })
            )
            .addFields([
                {
                    name: 'Host',
                    value: String(this.host),
                    inline: true
                },
                {
                    name: 'Jugadores',
                    value: String(this.players),
                    inline: true
                }
            ])
            .setFooter({
                text: this.server.translate('footer', { bot: this.client.user?.username, version: this.client.version })
            })
        const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        if (this.status == 'waiting')
            buttons.addComponents([
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_cmd.join'))
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`uno_${this.id}_jn`),
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_cmd.start'))
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`uno_${this.id}_st`)
                    .setDisabled(this.players.size < this.minPlayers)
            ])
        else {
            embed.setImage(this.actualCard.url)
            buttons.addComponents([
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_cmd.show'))
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`uno_${this.id}_mc`),
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_cmd.eat'))
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`uno_${this.id}_ea`),
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_cmd.new'))
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`uno_${this.id}_nw`)
            ])
        }
        return {
            embeds: [embed],
            components: this.status === 'end' ? undefined : [buttons]
        }
    }
}
