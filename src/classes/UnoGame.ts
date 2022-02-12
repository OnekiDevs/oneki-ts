import { ButtonInteraction, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { Client, Player, Players, UnoCard, randomCard } from "../utils/classes";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { randomId, imgToLink } from "../utils/utils";
import EventEmitter from "events";

export class UnoGame extends EventEmitter {
    host: Player;
    client: Client;
    players: Players = new Players();
    status: string = "waiting";
    id: string = randomId();
    minPlayers: number = 2;
    message!: Message;
    actualCard: UnoCard;
    direction: boolean = true;

    constructor(msg: Message, client: Client) {
        super();

        this.host = new Player(msg.author.id);
        this.client = client;

        this.players.add(this.host);
        msg.reply(this.embed).then((message) => (this.message = message));
        this.actualCard = randomCard();

        this.client.uno.set(this.id, this);

        this.on("join", (player) => {
            this.players.add(player);
            this.message?.edit(this.embed);
        });

        this.on("eat", async (player: Player) => {
            player.addCard(randomCard());
            const nesesitoAyuda = await player.interaction?.editReply({
                content: "Actualizando cartas",
                components: [],
            });
            if (!nesesitoAyuda) return;
            const 
                cards = await player.cardsToImage(),
                components = player.cardsToButtons(this),
                content = await imgToLink(cards, this.client) 
            console.log({ content, components });
            await player.interaction?.editReply({ content, components });
        });

        this.on("start", () => {
            this.status = "started";
            this.message?.edit(this.embed);
        });

        this.on("showCards", async (player: Player) => {
            const cards = await player.cardsToImage(), components = player.cardsToButtons(this), content = await imgToLink(cards, this.client);            
            player.interaction?.editReply({ content, components });
        });

        this.on("play", async (player: Player, card: UnoCard, interaction: ButtonInteraction) => {
            if (player.id !== this.turn.id) return interaction.deferUpdate();
            await interaction.deferUpdate()
            await player.interaction?.editReply({
                content: "Actualizando cartas",
                components: [],
            });
            //se elimina la carta del jugador
            player.cards.splice(player.cards.map((c) => c.id).indexOf(card.id), 1);
            this.actualCard = card;
            console.log(card.symbol)
            if (card.symbol == "+2") {
                console.log('before', this.turn.id)
                this.players.rotate(this.direction);
                console.log('after', this.turn.id)
                await this.turn.interaction?.editReply({
                    content: "Actualizando cartas",
                    components: [],
                });
                this.turn.addCard(randomCard());
                this.turn.addCard(randomCard());
            } else if (card.symbol == "reverse") {
                console.log('before', this.turn.id)
                this.direction = !this.direction;
                this.players.rotate(this.direction);
                console.log('after', this.turn.id)
                await this.turn.interaction?.editReply({
                    content: "Actualizando cartas",
                    components: [],
                });
            } else if (card.symbol == "cancell") {
                console.log('before', this.turn.id)
                this.players.rotate(this.direction);
                this.players.rotate(this.direction);
                console.log('after', this.turn.id)
                await this.turn.interaction?.editReply({
                    content: "Actualizando cartas",
                    components: [],
                });
            } else if (card.id == "p4") {
                console.log('before', this.turn.id)
                this.players.rotate(this.direction);
                console.log('after', this.turn.id)
                await this.turn.interaction?.editReply({
                    content: "Actualizando cartas",
                    components: [],
                });
                this.turn.addCard(randomCard());
                this.turn.addCard(randomCard());
                this.turn.addCard(randomCard());
                this.turn.addCard(randomCard());
                //pedir color
            }
            await this.turn.interaction?.editReply({
                content: await imgToLink(await this.turn.cardsToImage(), this.client),
                components: this.turn.cardsToButtons(this),
            });
            const 
                cards = await player.cardsToImage(),
                components = player.cardsToButtons(this),
                content = await imgToLink(cards, this.client) 
            await player.interaction?.editReply({ content, components });
            await this.message.edit(this.embed);
        });

    }

    get turn(): Player {
        return this.players.first();
    }

    get embed(): {
        embeds: MessageEmbed[];
        components?: MessageActionRow[];
    } {
        console.log('turn', this.turn.id)
        const embed = new MessageEmbed()
            .setTitle("Uno Game (beta)")
            .setDescription(
                this.status == "waiting" ? "Esperando jugadores, se requieren minimo 2" : `Turno de ${this.turn}`,
            )
            .addField("Host", String(this.host), true)
            .addField("Jugadores", String(this.players), true)
            .setFooter({ text: this.client.user?.username + " Bot v" + this.client.version });
        const buttons = new MessageActionRow();
        if (this.status == "waiting")
            buttons.addComponents([
                new MessageButton()
                    .setLabel("Unirme")
                    .setStyle(MessageButtonStyles.SUCCESS)
                    .setCustomId(`uno_${this.id}_jn`),
                new MessageButton()
                    .setLabel("Iniciar Partida")
                    .setStyle(MessageButtonStyles.PRIMARY)
                    .setCustomId(`uno_${this.id}_st`)
                    .setDisabled(this.players.size < this.minPlayers),
            ]);
        else {
            embed.setImage(this.actualCard.url);
            buttons.addComponents(
                new MessageButton()
                    .setLabel("Mostrar Cartas")
                    .setStyle(MessageButtonStyles.PRIMARY)
                    .setCustomId(`uno_${this.id}_mc`),
                    new MessageButton()
                        .setLabel("Comer Cartas")
                        .setStyle(MessageButtonStyles.PRIMARY)
                        .setCustomId(`uno_${this.id}_ea`),
            );
        }
        return {
            embeds: [embed],
            components: [buttons],
        };
    }
}