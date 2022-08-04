/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    filledBar,
    pollEmojis as emojis,
    checkSend,
    randomId,
    createModalComponent,
    errorCatch
} from '../utils/utils.js'
import { ActionRowBuilder, MessageActionRowComponentBuilder } from '@discordjs/builders'
import { Command } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'
import client from '../client.js'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
    ApplicationCommandOptionType,
    GuildMember,
    ModalBuilder,
    TextInputBuilder,
    User,
    ButtonBuilder,
    ButtonStyle,
    ModalSubmitInteraction,
    TextInputStyle,
    ButtonInteraction,
    Message,
    resolveColor,
    Collection,
    SelectMenuBuilder,
    SelectMenuOptionBuilder,
    SelectMenuInteraction
} from 'discord.js'
export default class Poll extends Command {
    polls = new Collection<string, PollDatabaseModel>()
    constructor() {
        super({
            name: {
                'en-US': 'poll',
                'es-ES': 'encuesta'
            },
            description: {
                'en-US': 'Make a poll',
                'es-ES': 'Hacer una encuesta'
            },
            options: [
                {
                    name: {
                        'en-US': 'make',
                        'es-ES': 'crear'
                    },
                    description: {
                        'en-US': 'Make a new poll',
                        'es-ES': 'Crear una nueva encuesta'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: {
                                'en-US': 'block_choice',
                                'es-ES': 'bloquear_seleccion'
                            },
                            description: {
                                'en-US': 'Block the choice of the user',
                                'es-ES': 'Bloquear la selección del usuario'
                            },
                            type: ApplicationCommandOptionType.Boolean
                        },
                        {
                            name: {
                                'en-US': 'show_results',
                                'es-ES': 'mostrar_resultados'
                            },
                            description: {
                                'en-US': 'Show the results of the poll in real time',
                                'es-ES': 'Mostrar los resultados de la encuesta en tiempo real'
                            },
                            type: ApplicationCommandOptionType.Boolean
                        },
                        {
                            name: {
                                'en-US': 'multiple_choices',
                                'es-ES': 'seleccion_multiple'
                            },
                            description: {
                                'en-US': 'Allow multiple choices',
                                'es-ES': 'Permitir múltiples selecciones'
                            },
                            type: ApplicationCommandOptionType.Boolean
                        },
                        {
                            name: {
                                'en-US': 'time',
                                'es-ES': 'tiempo'
                            },
                            description: {
                                'en-US': 'Set the time of the poll',
                                'es-ES': 'Establecer el tiempo de la encuesta'
                            },
                            type: ApplicationCommandOptionType.String
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'finalize',
                        'es-ES': 'finalizar'
                    },
                    description: {
                        'en-US': 'Finalize a poll',
                        'es-ES': 'Finalizar una encuesta'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: {
                                'en-US': 'id',
                                'es-ES': 'id'
                            },
                            description: {
                                'en-US': 'Select the poll to finalize',
                                'es-ES': 'Seleccionar la encuesta a finalizar'
                            },
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            max_length: 100,
                            min_length: 1,
                            required: true
                        }
                    ]
                }
            ]
        })
    }

    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        if (interaction.options.getSubcommand() === 'make') this.make(interaction)
        else if (interaction.options.getSubcommand() === 'finalize') this.finalize(interaction)
    }

    @errorCatch(import.meta.url)
    async make(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        const translate = Translator(interaction)
        // const server = client.getServer(interaction.guild)
        //TODO: Check if the guild has the permission to make a poll (premium)

        if (!checkSend(interaction.channel as TextChannel, interaction.guild.members.me as GuildMember))
            return interaction.reply({
                content: translate('poll_cmd.make.havent_permissions'),
                ephemeral: true
            })

        const show_results = interaction.options.getBoolean('show_results') ?? true
        const block_choice = interaction.options.getBoolean('block_choice') ?? false
        const multiple_choice = interaction.options.getBoolean('multiple_choices') ?? false
        // const time = interaction.options.getString('time') ?? server.premium ? '1m' : '1w'
        const id = randomId()

        // time
        this.polls.set(id, {
            guild: interaction.guildId,
            show_results,
            multiple_choice,
            author: interaction.user.id,
            block_choice,
            channel: interaction.channel!.id,
            title: 'New poll',
            context: '',
            options: [],
            message: ''
        })

        const modal = this.getModal(id, translate)
        interaction.showModal(modal)
    }

    @errorCatch(import.meta.url)
    getModal(id: string, translate: ReturnType<typeof Translator>) {
        return new ModalBuilder()
            .setTitle(translate('poll_cmd.make.modal_title'))
            .setCustomId(`poll_${id}_modal`)
            .addComponents([
                createModalComponent(
                    new TextInputBuilder()
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setLabel(translate('title'))
                        .setCustomId('title')
                        .setPlaceholder(translate('poll_cmd.make.modal_title_placeholder'))
                        .setValue(translate('poll_cmd.make.modal_title_value'))
                        .setMaxLength(100)
                ),
                createModalComponent(
                    new TextInputBuilder()
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setLabel(translate('context'))
                        .setCustomId('context')
                        .setPlaceholder(translate('poll_cmd.make.modal_context_placeholder'))
                ),
                createModalComponent(
                    new TextInputBuilder()
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setLabel(translate('poll_cmd.make.modal_options_label'))
                        .setPlaceholder(translate('poll_cmd.make.modal_options_placeholder'))
                        .setCustomId('options')
                )
            ])
    }

    @errorCatch(import.meta.url)
    async finalize(interaction: ChatInputCommandInteraction<'cached'>) {
        const translate = Translator(interaction)
        await interaction.deferReply({ ephemeral: true })

        const id = interaction.options.getString('id') as string

        const snap = await client.db.collection('polls').doc(id).get()

        if (snap.exists) {
            const data = snap.data() as PollDatabaseModel

            await client.db
                .collection('finalized-polls')
                .doc(id)
                .set(data)
                .catch(() => '')

            snap.ref.delete()

            const chennel = client.channels.cache.get(data.channel) as TextChannel
            chennel?.messages.fetch(data.message).then(async msg => {
                await msg.edit({
                    components: []
                })
                if (!data.show_results) {
                    const embed = new EmbedBuilder(msg.embeds[0]?.data)
                    let votesCount = 0
                    await Promise.all(data.options!.map(o => (votesCount += o.votes.length)))
                    embed.setFields(
                        await Promise.all(
                            data.options!.map((o, i) => ({
                                name: `${emojis[i]} Opcion ${i + 1} ${o.title}`,
                                value: `\`${filledBar((o.votes.length / votesCount) * 100)}\` ${Math.round(
                                    (o.votes.length / votesCount) * 100
                                )}%`,
                                inline: false
                            }))
                        )
                    )
                    msg.edit({
                        embeds: [embed]
                    })
                }
            })
            interaction.editReply(translate('poll_cmd.finalize'))
        } else {
            await interaction.reply({
                content: translate('poll_cmd.not_found'),
                ephemeral: true
            })
        }
    }

    @errorCatch(import.meta.url)
    async modal(interaction: ModalSubmitInteraction<'cached'>): Promise<any> {
        const translate = Translator(interaction)
        // const server = client.getServer(interaction.guild)

        const [, id] = interaction.customId.split('_')
        const title = interaction.fields.getTextInputValue('title')
        const context = interaction.fields.getTextInputValue('context')
        const options = interaction.fields
            .getTextInputValue('options')
            .split('\n')
            .map((o, i) => ({
                id: i + 1,
                title: o.trim(),
                votes: []
            }))

        if (options.length < 2)
            return interaction.reply({ content: translate('poll_cmd.edit.more_options'), ephemeral: true })
        if (options.find(o => o.title.trim().length > 100))
            return interaction.reply({ content: translate('poll_cmd.edit.option_too_long'), ephemeral: true })

        if (!this.polls.has(id))
            this.polls.set(id, {
                guild: interaction.guildId,
                show_results: true,
                multiple_choice: false,
                author: interaction.user.id,
                block_choice: false,
                channel: interaction.channel!.id,
                title,
                context,
                options,
                message: ''
            })

        let snap = this.polls.get(id) as PollDatabaseModel
        const snapshot = await client.db.collection('polls').doc(id).get()
        if (snapshot.exists) snap = { ...snap, ...snapshot.data() }

        const member = interaction.member

        const embed = this.createEmbed({ ...snap, id, member, title, context, options }, translate)
        const buttons = this.createButtons(snap, id, translate)
        const channel = (await interaction.guild.channels.cache.get(snap.channel)) as TextChannel

        let msg: Message | undefined
        if (snap.message) msg = await channel.messages.fetch(snap.message!)
        if (!msg) msg = await channel.send({ embeds: [embed], components: buttons })

        if (snap.message) msg.edit({ embeds: [embed], components: buttons })

        this.polls.set(id, {
            ...snap,
            message: msg.id
        })
        snapshot.ref
            .set({
                ...snap,
                message: msg.id
            })
            .then(() => interaction.reply({ content: translate('poll_cmd.edit.success'), ephemeral: true }))

        // TODO: if time add timeout
    }

    // TODO: edit()
    @errorCatch(import.meta.url)
    async button(interaction: ButtonInteraction<'cached'>) {
        await interaction.deferReply({ ephemeral: true })
        const [, , id] = interaction.customId.split('_')
        const translate = Translator(interaction)

        const snap = await client.db.collection('polls').doc(id).get()
        if (!snap.exists) return interaction.editReply({ content: 'Poll finalized' })

        const modal = this.getModal(id, translate)
        return interaction.showModal(modal)
        // if (data.block_choice && data.options!.find(o => o.votes.includes(interaction.user.id)))
        //     return interaction.editReply(translate('poll_cmd.buttons.already_voted'))

        // data.options = data.options!.map(o => {
        //     if (!data.multiple_choice && o.votes.includes(interaction.user.id))
        //         o.votes = o.votes.filter(v => v !== interaction.user.id)
        //     if (o.id === Number(selected)) o.votes.push(interaction.user.id)
        //     return o
        // })

        // const member =
        //     (await interaction.guild.members.cache.get(data.author)) ??
        //     (await interaction.guild.members.fetch(data.author)) ??
        //     (await client.users.fetch(data.author))

        // const embed = this.createEmbed({ ...data, id, member }, translate)
        // const buttons = this.createButtons(data, id, translate)
        // const channel = (await interaction.guild.channels.cache.get(data.channel)) as TextChannel

        // let msg = await channel.messages.fetch(data.message!)

        // msg.edit({
        //     embeds: [embed],
        //     components: buttons
        // })

        // const db = client.db.collection('polls').doc(id)
        // db.set({ ...data, options: data.options })
        // interaction.editReply({
        //     content: translate('poll_cmd.buttons.success')
        // })
    }

    @errorCatch(import.meta.url)
    async select(interaction: SelectMenuInteraction<'cached'>) {
        await interaction.deferReply()

        const [, , id] = interaction.customId.split('_')
        const translate = Translator(interaction)

        const snap = await client.db.collection('polls').doc(id).get()
        if (!snap.exists) return interaction.editReply({ content: 'Poll finalized' })
        let data = snap.data() as PollDatabaseModel

        data.options = data.options!.map(o => {
            if (!data.multiple_choice && o.votes.includes(interaction.user.id))
                o.votes = o.votes.filter(v => v !== interaction.user.id)
            if (interaction.values.includes(String(o.id))) o.votes.push(interaction.user.id)
            return o
        })

        const embeds = [this.createEmbed({ ...data, id, member: interaction.member }, translate)]
        const components = this.createButtons(data, id, translate)
        return interaction.message.edit({ embeds, components })
    }

    @errorCatch(import.meta.url)
    createEmbed(poll: pollInfo, translate: ReturnType<typeof Translator>) {
        let votes = 0
        poll.options.map(o => (votes += o.votes.length))

        const embed = new EmbedBuilder()
            .setTitle(poll.title)
            .setDescription(poll.context)
            .setColor(resolveColor('Random'))
            .setFooter({
                iconURL: client.user?.displayAvatarURL(),
                text: translate('poll_cmd.make.footer', {
                    id: poll.id,
                    bot: client.user?.username,
                    version: client.version
                })
            })
            .setAuthor({
                iconURL: poll.member.displayAvatarURL(),
                name: poll.member instanceof GuildMember ? poll.member.displayName : poll.member.username
            })
            .setFields(
                poll.options?.map((o, i) => ({
                    name: `${emojis[i]} Opcion ${i + 1}${poll.show_results ? `: ${o.title}` : ''}`,
                    value: `${
                        poll.show_results
                            ? `\`${filledBar((o.votes.length / votes) * 100)}\` ${Math.round(
                                  (o.votes.length / votes) * 100
                              )}%`
                            : o.title
                    }`,
                    inline: false
                })) ?? []
            )
        return embed
    }

    @errorCatch(import.meta.url)
    createButtons(poll: PollDatabaseModel, id: string, _translate: ReturnType<typeof Translator>) {
        return [
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
                new SelectMenuBuilder()
                    .setCustomId(`poll_vote_${id}`)
                    .setPlaceholder('vote')
                    .setMaxValues(poll.multiple_choice ? poll.options.length : 1)
                    .setMinValues(1)
                    .setOptions(
                        ...poll.options.map(o => new SelectMenuOptionBuilder().setLabel(o.title).setValue(String(o.id)))
                    )
            ]),
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
                new ButtonBuilder().setCustomId(`poll_edit_${id}`).setLabel('Edit Poll').setStyle(ButtonStyle.Primary)
            ])
        ]
    }
}

interface PollDatabaseModel {
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

interface pollInfo extends PollDatabaseModel {
    id: string
    member: GuildMember | User
}
