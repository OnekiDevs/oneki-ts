import { ChatInputCommandInteraction, TextChannel, GuildMember } from 'discord.js'
import { checkSend, randomId, Translator } from 'offdjs'
import polls from '../../cache/polls.js'
import { _getModal } from '../poll.js'
export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>) {
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
    polls.set(id, {
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

    const modal = _getModal(id, translate)
    return interaction.showModal(modal)
}
