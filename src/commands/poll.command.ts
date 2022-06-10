/* eslint-disable @typescript-eslint/no-explicit-any */
import { filledBar, pollEmojis as emojis, checkSend, randomId, createModalComponent } from '../utils/utils.js'
import { Command, Client } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'
import {
    ChatInputCommandInteraction,
    Guild,
    EmbedBuilder,
    TextChannel,
    ApplicationCommandOptionType,
    GuildMember,
    ModalBuilder,
    TextInputBuilder,
    Util,
    User,
    ButtonBuilder,
    ButtonStyle,
    ModalSubmitInteraction,
    TextInputStyle,
    ButtonInteraction,
    Message
} from 'discord.js'
import { ActionRowBuilder, MessageActionRowComponentBuilder } from '@discordjs/builders'

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
            buttonRegex: /^poll_.{8}_(modal|\d{1,2})$/i
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
                options: [
                    {
                        name: 'title',
                        description: 'Add a title for the poll',
                        type: ApplicationCommandOptionType.String
                    },
                    {
                        name: 'block_choice',
                        description: 'Blocks the response so as not to be modified',
                        type: ApplicationCommandOptionType.Boolean
                    },
                    {
                        name: 'show_results',
                        description: 'Show the results of the poll in the moment',
                        type: ApplicationCommandOptionType.Boolean
                    },
                    {
                        name: 'multiple_choices',
                        description: 'Allow multiple choices',
                        type: ApplicationCommandOptionType.Boolean
                    },
                    {
                        name: 'time',
                        description: 'Set the time of the poll',
                        type: ApplicationCommandOptionType.String
                    }
                ]
            })
        }

        if (!snap.empty) {
            const choices: { name: string; value: string }[] = []
            let i = 0
            snap.forEach(doc => {
                const name = doc.data().title ?? 'New poll ' + ++i
                choices.push({ name: name.length > 100 ? name.substring(0, 96) + '...' : name, value: doc.id })
            })
            this.addOption({
                name: 'finalize',
                description: 'Finalize the poll',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'poll',
                        description: 'Select the poll to finalize',
                        type: ApplicationCommandOptionType.String,
                        choices
                    }
                ]
            })
        }
    }

    async interacion(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        if (interaction.options.getSubcommand() === 'make') this.make(interaction)
        else if (interaction.options.getSubcommand() === 'finalize') this.finalize(interaction)
    }

    async make(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        const translate = Translator(interaction)
        // const server = this.client.getServer(interaction.guild)

        if (!checkSend(interaction.channel as TextChannel, interaction.guild.members.me as GuildMember))
            return interaction.reply({
                content: translate('poll_cmd.make.havent_permissions'),
                ephemeral: true
            })

        const show_results = interaction.options.getBoolean('show_results') ?? true
        const block_choices = interaction.options.getBoolean('block_choice') ?? false
        const multiple_choices = interaction.options.getBoolean('multiple_choices') ?? false
        // const time = interaction.options.getString('time') ?? server.premium ? '1m' : '1w'
        const id = randomId()

        // time
        await this.client.db.collection('polls').doc(id).set({
            guild: interaction.guildId,
            show_results,
            multiple_choices,
            author: interaction.user.id,
            block_choices,
            channel: interaction.channel!.id
        })

        const modal = new ModalBuilder()
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
                        .setMaxLength(256)
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

        interaction.showModal(modal)

        this.client.commands.find(c => c.name === 'poll')?.deploy(interaction.guild as Guild)
    }

    async finalize(interaction: ChatInputCommandInteraction<'cached'>) {
        const translate = Translator(interaction)
        await interaction.deferReply({ ephemeral: true })

        const id = interaction.options.getString('poll') as string

        const snap = await this.client.db.collection('polls').doc(id).get()

        if (snap.exists) {
            const data = snap.data() as PollDatabaseModel

            if (data.options)
                await this.client.db
                    .collection('finalized-polls')
                    .doc(id)
                    .set(data)
                    .catch(() => '')

            await this.client.db.collection('polls').doc(id).delete()

            await this.deploy(interaction.guild as Guild)
            if (data.options)
                (interaction.client.channels.cache.get(data.channel) as TextChannel)?.messages
                    .fetch(data.message!)
                    .then(async msg => {
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
                                        name: `${emojis[i]} Opcion ${i + 1} ${o.value}`,
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
        }

        interaction.editReply(translate('poll_cmd.finalize'))

        this.client.commands.find(c => c.name === 'poll')?.deploy(interaction.guild)
    }

    async modal(interaction: ModalSubmitInteraction<'cached'>): Promise<any> {
        const translate = Translator(interaction)
        // const server = this.client.getServer(interaction.guild)

        const [, id] = interaction.customId.split('_')
        const title = interaction.fields.getTextInputValue('title')
        const context = interaction.fields.getTextInputValue('context')
        const options = interaction.fields
            .getTextInputValue('options')
            .split('\n')
            .map((o, i) => ({
                n: i + 1,
                value: o.trim(),
                votes: []
            }))

        if (options.length < 2)
            return interaction.reply({ content: translate('poll_cmd.edit.more_options'), ephemeral: true })

        const snap = (await this.client.db.collection('polls').doc(id).get()).data() as PollDatabaseModel

        const member =
            (await interaction.guild.members.cache.get(snap.author)) ??
            (await interaction.guild.members.fetch(snap.author)) ??
            (await this.client.users.fetch(snap.author))

        const embed = this.createEmbed({ ...snap, id, member, title, context, options }, translate)
        const buttons = this.createButtons(options, id, translate)
        const channel = (await interaction.guild.channels.cache.get(snap.channel)) as TextChannel

        let msg: Message | undefined
        if (snap.message) msg = await channel.messages.fetch(snap.message!)
        if (!msg) msg = await channel.send({ embeds: [embed], components: buttons })

        const db = this.client.db.collection('polls').doc(id)

        db.set({
            ...snap,
            title,
            context,
            options,
            message: msg.id
        }).then(() => interaction.reply({ content: translate('poll_cmd.edit.success'), ephemeral: true }))

        // TODO: if time add timeout
    }

    // TODO: edit()
    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        await interaction.deferReply({ ephemeral: true })
        const [, id, selected] = interaction.customId.split('_')
        const translate = Translator(interaction)

        const snap = await this.client.db.collection('polls').doc(id).get()
        if (!snap.exists) return interaction.editReply({ content: 'Poll finalized' })

        const data = snap.data() as PollDatabaseModel

        if (data.block_choice && data.options!.find(o => o.votes.includes(interaction.user.id)))
            return interaction.editReply(translate('poll_cmd.buttons.already_voted'))

        data.options = data.options!.map(o => {
            if (!data.multiple_choices && o.votes.includes(interaction.user.id))
                o.votes = o.votes.filter(v => v !== interaction.user.id)
            if (o.n === Number(selected)) o.votes.push(interaction.user.id)
            return o
        })

        const member =
            (await interaction.guild.members.cache.get(data.author)) ??
            (await interaction.guild.members.fetch(data.author)) ??
            (await this.client.users.fetch(data.author))

        const embed = this.createEmbed({ ...data, id, member }, translate)
        const buttons = this.createButtons(data.options!, id, translate)
        const channel = (await interaction.guild.channels.cache.get(data.channel)) as TextChannel

        let msg = await channel.messages.fetch(data.message!)

        msg.edit({
            embeds: [embed],
            components: buttons
        })

        const db = this.client.db.collection('polls').doc(id)
        db.set({ ...data, options: data.options })
        interaction.editReply({
            content: translate('poll_cmd.buttons.success')
        })
    }

    createEmbed(poll: pollInfo, translate: ReturnType<typeof Translator>) {
        let votes = 0
        poll.options.map(o => (votes += o.votes.length))

        const embed = new EmbedBuilder()
            .setTitle(poll.title)
            .setDescription(poll.context)
            .setColor(Util.resolveColor('Random'))
            .setFooter({
                iconURL: this.client.user?.displayAvatarURL(),
                text: translate('poll_cmd.make.footer', {
                    id: poll.id,
                    bot: this.client.user?.username,
                    version: this.client.version
                })
            })
            .setAuthor({
                iconURL: poll.member.displayAvatarURL(),
                name: poll.member instanceof GuildMember ? poll.member.displayName : poll.member.username
            })
            .setFields(
                poll.options?.map((o, i) => ({
                    name: `${emojis[i]} Opcion ${i + 1}${poll.show_results ? `: ${o.value}` : ''}`,
                    value: `${
                        poll.show_results
                            ? `\`${filledBar((o.votes.length / votes) * 100)}\` ${Math.round(
                                  (o.votes.length / votes) * 100
                              )}%`
                            : o.value
                    }`,
                    inline: false
                })) ?? []
            )
        return embed
    }

    createButtons(options: { n: number }[], id: string, translate: ReturnType<typeof Translator>) {
        const buttons = [new ActionRowBuilder<MessageActionRowComponentBuilder>()]
        let i = 1,
            j = 0
        for (const option of options) {
            if (i % 5 === 0) buttons.push(new ActionRowBuilder<MessageActionRowComponentBuilder>())
            buttons[i % 5 === 0 ? j++ : j].addComponents([
                new ButtonBuilder()
                    .setCustomId(`poll_${id}_${option.n}`)
                    .setLabel(`${translate('option')} ${option.n}`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(emojis[i - 1])
            ])
            i++
        }
        return buttons
    }
}

interface PollDatabaseModel {
    title: string
    context: string
    options: { n: number; value: string; votes: string[] }[]
    show_results: boolean
    message?: string
    channel: string
    guild: string
    block_choice: boolean
    multiple_choices: boolean
    time: number
    author: string
}

interface pollInfo extends PollDatabaseModel {
    id: string
    member: GuildMember | User
}
