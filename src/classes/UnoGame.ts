import { Client, Player, Players, UnoCard, randomCard, Server, ActionRowBuilder, EmbedBuilder, ButtonBuilder, Message, MessageActionRowComponentBuilder } from '../utils/classes.js'
import { randomId, imgToLink } from '../utils/utils.js'
import { ButtonInteraction, ButtonStyle } from 'discord.js'
import EventEmitter from 'node:events'

export class UnoGame extends EventEmitter {
    host: Player
    client: Client
    players: Players = new Players()
    status = 'waiting'
    id: string = randomId()
    minPlayers = 2
    message!: Message
    actualCard: UnoCard
    direction = true
    winner: Player | undefined
    server: Server

    constructor(msg: Message<true>, client: Client) {
        super()

        this.server = client.getServer(msg.guild)

        this.host = new Player(msg.author.id)
        this.client = client

        this.players.add(this.host)
        msg.reply(this.embed).then((message) => (this.message = message))
        this.actualCard = randomCard()

        this.client.uno.set(this.id, this)

        this.on('join', (player) => {
            this.players.add(player)
            this.message?.edit(this.embed)
        })

        this.on('eat', async (player: Player) => {
            player.addCard(randomCard())
            const nesesitoAyuda = await player.interaction?.editReply({
                content: this.server.translate('uno_old.updating'),
                components: [],
            })
            if (!nesesitoAyuda) return
            const cards = await player.cardsToImage(),
                components = player.cardsToButtons(this),
                content = await imgToLink(cards, this.client)
            console.log(components[0]?.components)
            await player.interaction?.editReply({ content, components })
        })

        this.on('start', () => {
            this.status = 'started'
            this.message?.edit(this.embed)
        })

        this.on('showCards', async (player: Player) => {
            const cards = await player.cardsToImage(),
                components = player.cardsToButtons(this),
                content = await imgToLink(cards, this.client)
            console.log(components[0]?.components)
            player.interaction?.editReply({ content, components })
        })

        this.on(
            'play',
            async (
                player: Player,
                card: UnoCard,
                interaction: ButtonInteraction
            ) => {
                if (player.id !== this.turn.id) return interaction.deferUpdate()
                await interaction.deferUpdate()

                const ioctd = player.cards.map((c) => c.id).indexOf(card.id)
                player.cards.splice(ioctd, 1)

                if (player.cards.length === 0) {
                    player.interaction?.editReply({
                        content: this.server.translate('uno_old.gg'),
                        components: [],
                    })
                    this.winner = player
                    this.status = 'end'
                    this.message.edit(this.embed)
                    return
                }

                await player.interaction?.editReply({
                    content: this.server.translate('uno_old.updating'),
                    components: [],
                })

                this.actualCard = card
                let cards, components, content
                if (card.symbol == '+2') {
                    await this.players.rotate(this.direction)
                    await this.turn.interaction?.editReply({
                        content: this.server.translate('uno_old.updating'),
                        components: [],
                    })
                    this.turn.addCard(randomCard())
                    this.turn.addCard(randomCard())
                    cards = await this.turn.cardsToImage()
                    content = await imgToLink(cards, this.client)
                    components = this.turn.cardsToButtons(this)
                    this.turn.interaction?.editReply({ content, components })
                } else if (card.symbol == 'reverse') {
                    this.direction = !this.direction
                    await this.players.rotate(this.direction)
                    components = this.turn.cardsToButtons(this)
                    this.turn.interaction?.editReply({ components })
                } else if (card.symbol == 'cancell') {
                    await this.players.rotate(this.direction)
                    await this.players.rotate(this.direction)
                    components = this.turn.cardsToButtons(this)
                    this.turn.interaction?.editReply({ components })
                } else if (card.id == 'p4') {
                    await this.players.rotate(this.direction)
                    await this.turn.interaction?.editReply({
                        content: this.server.translate('uno_old.updating'),
                        components: [],
                    })
                    this.turn.addCard(randomCard())
                    this.turn.addCard(randomCard())
                    this.turn.addCard(randomCard())
                    this.turn.addCard(randomCard())
                    cards = await this.turn.cardsToImage()
                    content = await imgToLink(cards, this.client)
                    components = this.turn.cardsToButtons(this)
                    this.turn.interaction?.editReply({ content, components })
                    //pedir color
                } else await this.players.rotate(this.direction)
                cards = await player.cardsToImage()
                components = player.cardsToButtons(this)
                content = await imgToLink(cards, this.client)
                if (this.turn.id !== player.id)
                    player.interaction?.editReply({ content, components })
                this.message.edit(this.embed)
                return
            }
        )
    }

    get turn(): Player {
        return this.players.first()
    }

    get embed(): {
        embeds: EmbedBuilder[]
        components?: ActionRowBuilder<MessageActionRowComponentBuilder>[]
    } {
        const embed = new EmbedBuilder()
            .setTitle('Uno Game v1')
            .setDescription(
                this.status == 'waiting'
                    ? this.server.translate('uno_old.waiting')
                    : (this.status === 'end'
                        ? this.server.translate('uno_old.end', { user: this.winner })
                        : this.server.translate('uno_old.turn', { user: this.turn }))
            )
            .addFields([
                {
                    name: 'Host',
                    value: String(this.host),
                    inline: true,
                },
                {
                    name: 'Jugadores',
                    value: String(this.players),
                    inline: true,
                }
            ])
            .setFooter({ text: this.server.translate('footer', { bot: this.client.user?.username, version: this.client.version }) })
        const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        if (this.status == 'waiting')
            buttons.addComponents([
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_old.join'))
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`uno_${this.id}_jn`),
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_old.start'))
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`uno_${this.id}_st`)
                    .setDisabled(this.players.size < this.minPlayers),
            ])
        else {
            embed.setImage(this.actualCard.url)
            buttons.addComponents([
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_old.show'))
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`uno_${this.id}_mc`),
                new ButtonBuilder()
                    .setLabel(this.server.translate('uno_old.eat'))
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`uno_${this.id}_ea`)
            ])
        }
        return {
            embeds: [embed],
            components: this.status === 'end' ? undefined : [buttons],
        }
    }
}