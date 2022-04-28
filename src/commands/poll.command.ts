/* eslint-disable @typescript-eslint/no-explicit-any */
import { filledBar, pollEmojis as emojis, checkSend, randomId } from '../utils/utils.js'
import { Command, Client, CommandType, PollDatabaseModel, MessageActionRowComponentBuilder } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'
import {
    ApplicationCommandDataResolvable,
    ButtonBuilder,
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Guild,
    EmbedBuilder,
    TextChannel,
    GuildMember,
    ButtonStyle,
} from 'discord.js'

export default class Poll extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'poll',
            description: 'make a poll',
            category: 'Utils',
            defaultPermission: false,
            type: CommandType.guild,
        })
    }

    async getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        const command = this.baseCommand
        const snap = await this.client.db
            .collection('polls')
            .where('guild', '==', (guild as Guild).id)
            .get()
        if (!snap.empty)
            command.addSubcommand((subcommand) => {
                subcommand.setName('finalize').setDescription('Finish a poll')
                subcommand.addStringOption((option) => {
                    option.setName('id').setDescription('Id of de poll').setRequired(true)
                    snap.forEach((doc) => option.addChoices({ name: doc.id, value: doc.id }))
                    return option
                })
                return subcommand
            })
        command.addSubcommand((subcommand) => {
            subcommand
                .setName('make')
                .setDescription('Make a poll')
                .addStringOption((option) =>
                    option.setName('context').setDescription('add a description of context').setRequired(true),
                )
                .addStringOption((option) => option.setName('title').setDescription('title to show in the poll'))
                .addBooleanOption((option) =>
                    option.setName('block_choice').setDescription('blocks the response so as not to be modified'),
                )
                .addBooleanOption((option) =>
                    option.setName('multiple_choices').setDescription('if they can choose several answers'),
                )
                .addBooleanOption((option) =>
                    option.setName('show_results').setDescription('show results at the moment'),
                )
            for (let i = 1; i <= 20; i++)
                subcommand.addStringOption((option) =>
                    option.setName(`option_${i}`).setDescription(`option ${i} to choice`),
                )
            return subcommand
        })
        return command.toJSON() as ApplicationCommandDataResolvable
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
        
        this.client.commands.find((c) => c.name === 'poll')?.deploy(interaction.guild as Guild)
    }
}
