/* eslint-disable @typescript-eslint/no-explicit-any */
import { filledBar, pollEmojis as emojis, checkSend, randomId } from '../utils/utils.js'
import { Command, Client, PollDatabaseModel, MessageActionRowComponentBuilder } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'
import {
    ButtonBuilder,
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Guild,
    EmbedBuilder,
    TextChannel,
    GuildMember,
    ButtonStyle,
    ApplicationCommandOptionType
} from 'discord.js'

export default class Poll extends Command {
    constructor(client: Client) {
        super(client, {
            name: {
                'en-US': 'poll',
                'es-ES': 'encuesta'
            },
            description: {
                'en-US': 'Make a poll',
                'es-ES': 'Hacer una encuesta'
            },
            global: false,
        })
    }

    async createData(guild: Guild): Promise<void> {

        const server = this.client.getServer(guild)
        this.clearOptions()

        const snap = await this.client.db
            .collection('polls')
            .where('guild', '==', (guild as Guild).id)
            .get()

        if (server.premium || snap.empty) {
            this.addOption({
                name: 'make',
                description: 'Make a new poll',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'context',
                    description: 'Add a description of context of the poll',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }, {
                    name: 'title',
                    description: 'Add a title for the poll',
                    type: ApplicationCommandOptionType.String,
                }, {
                    name: 'block_choice',
                    description: 'Blocks the response so as not to be modified',
                    type: ApplicationCommandOptionType.Boolean,
                }, {
                    name: 'show_results',
                    description: 'Show the results of the poll in the moment',
                    type: ApplicationCommandOptionType.Boolean,
                }, {
                    name: 'multiple_choices',
                    description: 'Allow multiple choices',
                    type: ApplicationCommandOptionType.Boolean,
                }].concat(new Array(20).fill(0).map((_, i) => ({
                    name: `option${i + 1}`,
                    description: `Add an option for the poll`,
                    type: ApplicationCommandOptionType.String,
                })))
            })
        } 

        if (!snap.empty) {
            const choices: { name: string; value: string }[] = []
            snap.forEach((doc) => choices.push({ name: doc.id, value: doc.id }))
            this.addOption({
                name: 'finalize',
                description: 'Finalize the poll',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'id',
                    description: 'Select the poll to finalize',
                    type: ApplicationCommandOptionType.String,
                    choices,
                }]
            })
        }
    }

    async run(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        if (interaction.options.getSubcommand() === 'make') this.make(interaction)
        else if (interaction.options.getSubcommand() === 'finalize') this.finalize(interaction)
    }

    async make(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        await interaction.deferReply({ ephemeral: true })
        const translate = Translator(interaction)

        const server = this.client.getServer(interaction.guild)
        const snap = await this.client.db.collection('polls').where('guild', '==', interaction.guildId).get()
        if (!server?.premium && !snap.empty)
            return interaction.editReply(translate('poll_cmd.make.dont_premium'))
        if (!checkSend(interaction.channel as TextChannel, interaction.guild.me as GuildMember)) return interaction.editReply(translate('poll_cmd.make.havent_permissions'))
        this.deploy(interaction.guild as Guild)

        const title = interaction.options.getString('title') ?? translate('poll_cmd.make.new_poll')
        const context = interaction.options.getString('context') as string
        const block = interaction.options.getBoolean('block_choice') ?? false
        const show = interaction.options.getBoolean('show_results') ?? true
        const multiple = interaction.options.getBoolean('multiple_choices') ?? false
        const idPoll = randomId()
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(context)
            .setURL(`https://oneki.herokuapp.com/poll/${idPoll}`)
            .setFooter({
                text: translate('poll_cmd.make.footer', { id: idPoll, bot: this.client.user?.username, version: this.client.version }),
                iconURL: this.client.user?.avatarURL() ?? '',
            })

        const options =
            interaction.options.data[0].options
                ?.filter((o) => o.name.startsWith('option_'))
                .sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
                .map((o, i) => ({ name: `option_${i + 1}`, value: o.value, votes: [] })) ?? []

        if (options.length === 1) options.push({ name: 'option_2', value: 'Other', votes: [] })
        else if (options.length === 0)
            options.push({ name: 'option_1', value: 'yes', votes: [] }, { name: 'option_2', value: 'no', votes: [] })

        embed.addFields(
            options.map((o, i) => ({
                name: `${emojis[i]} Opcion ${i + 1}${show ? `: ${o.value}` : ''}`,
                value: `${show ? '`                         ` 0%' : o.value}`,
                inline: false,
            })),
        )

        const buttons = [new ActionRowBuilder<MessageActionRowComponentBuilder>()]
        let i = 1, j = 0

        for (const option of options) {
            if (i % 5 === 0) buttons.push(new ActionRowBuilder<MessageActionRowComponentBuilder>())

            buttons[i % 5 === 0 ? j++ : j].addComponents([
                new ButtonBuilder()
                    .setCustomId(`poll_${idPoll}_${option.name}`)
                    .setLabel(`${option.name.replace('_', ' ')}`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(emojis[i - 1]),
            ])
            i++
        }

        const msg = await interaction.channel?.send({
            embeds: [embed],
            components: buttons,
        })

        await this.client.db.collection('polls').doc(idPoll).set({
            guild: interaction.guildId,
            options,
            show_results: show,
            title,
            context,
            multiple_choices: multiple,
            author: interaction.user.id,
            block_choices: block,
            channel: msg?.channel.id,
            message: msg?.id,
        })

        interaction.editReply(translate('poll_cmd.make.reply'))

        this.client.commands.find((c) => c.name === 'poll')?.deploy(interaction.guild as Guild)
    }

    async finalize(interaction: ChatInputCommandInteraction<'cached'>) {
        const translate = Translator(interaction)
        await interaction.deferReply({ ephemeral: true })
        const snap = await this.client.db.collection('polls').doc(interaction.options.getString('id') as string).get()
        if (snap.exists) {
            const data = snap.data() as PollDatabaseModel
            await this.client.db
                .collection('finalized-polls')
                .doc(interaction.options.getString('id') as string)
                .set(snap.data() as any)
                .catch(() => '')
            await this.client.db
                .collection('polls')
                .doc(interaction.options.getString('id') as string)
                .delete()
            await this.deploy(interaction.guild as Guild);
            (interaction.client.channels.cache.get(data.channel) as TextChannel)?.messages
                .fetch(data.message)
                .then(async (msg) => {
                    await msg.edit({
                        components: [],
                    })
                    if (!data.show_results) {
                        const embed = new EmbedBuilder(msg.embeds[0]?.data)
                        let votesCount = 0
                        await Promise.all(data.options.map((o) => (votesCount += o.votes.length)))
                        embed.setFields(
                            await Promise.all(
                                data.options.map((o, i) => ({
                                    name: `${emojis[i]} Opcion ${i + 1} ${o.value}`,
                                    value: `\`${filledBar((o.votes.length / votesCount) * 100)}\` ${Math.round(
                                        (o.votes.length / votesCount) * 100,
                                    )}%`,
                                    inline: false,
                                })),
                            ),
                        )
                        msg.edit({
                            embeds: [embed],
                        })
                    }
                })
        }
        interaction.editReply(translate('poll_cmd.finalize'))
        
        this.client.commands.find((c) => c.name === 'poll')?.deploy(interaction.guild)
    }
}
