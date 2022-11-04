import {
    ButtonInteraction,
    ModalSubmitInteraction,
    TextInputStyle,
    ModalBuilder,
    TextInputBuilder,
    Message,
    User,
    ActionRowBuilder,
    SelectMenuBuilder,
    ButtonBuilder,
    SelectMenuOptionBuilder,
    SelectMenuInteraction
} from 'discord.js'
import { filledBar, Translator } from 'offdjs'
import polls, { PollDatabaseModel } from '../cache/polls.js'
import client from '../client.js'
import { createModalComponent, pollEmojis as emojis } from '../utils/utils.js'
import {
    GuildMember,
    EmbedBuilder,
    resolveColor,
    MessageActionRowComponentBuilder,
    ButtonStyle,
    TextChannel
} from 'discord.js'

// TODO: edit()
export async function buttonInteraction(interaction: ButtonInteraction<'cached'>) {
    await interaction.deferReply({ ephemeral: true })
    const [, , id] = interaction.customId.split('_')
    const translate = Translator(interaction)

    const snap = await client.db.collection('polls').doc(id).get()
    if (!snap.exists) return interaction.editReply({ content: 'Poll finalized' })

    const modal = _getModal(id, translate)
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

export async function modalSubmitInteraction(interaction: ModalSubmitInteraction<'cached'>): Promise<any> {
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

    if (!polls.has(id))
        polls.set(id, {
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

    let snap = polls.get(id) as PollDatabaseModel
    const snapshot = await client.db.collection('polls').doc(id).get()
    if (snapshot.exists) snap = { ...snap, ...snapshot.data() }

    const member = interaction.member

    const embed = _createEmbed({ ...snap, id, member, title, context, options }, translate)
    const buttons = _createButtons(snap, id, translate)
    const channel = interaction.guild.channels.cache.get(snap.channel) as TextChannel

    let msg: Message | undefined
    if (snap.message) msg = await channel.messages.fetch(snap.message!)
    if (!msg) msg = await channel.send({ embeds: [embed], components: buttons })
    if (!msg) return

    if (snap.message) msg.edit({ embeds: [embed], components: buttons })

    polls.set(id, {
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

export async function selectMenuInteraction(interaction: SelectMenuInteraction<'cached'>) {
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

    const embeds = [_createEmbed({ ...data, id, member: interaction.member }, translate)]
    const components = _createButtons(data, id, translate)
    return interaction.message.edit({ embeds, components })
}

export function _getModal(id: string, translate: ReturnType<typeof Translator>) {
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

export function _createEmbed(poll: pollInfo, translate: ReturnType<typeof Translator>) {
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

interface pollInfo extends PollDatabaseModel {
    id: string
    member: GuildMember | User
}

export function _createButtons(poll: PollDatabaseModel, id: string, _translate: ReturnType<typeof Translator>) {
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
