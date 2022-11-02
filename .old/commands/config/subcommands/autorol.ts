import {
    ChatInputCommandInteraction,
    GuildMember,
    ActionRowBuilder,
    ButtonBuilder,
    Role,
    TextChannel,
    MessageActionRowComponentBuilder,
    ButtonStyle,
    EmbedBuilder
} from 'discord.js'
import client from '../../../client.js'
import { checkSend, Translator } from '../../../utils/utils.js'

export async function create(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const name = (interaction.options.getString('name') as string).split(/ +/gi).join('_')
    const server = client.getServer(interaction.guild)
    await server.newAutorol(name)
    console.log(client.commands.get('config'))
    interaction.editReply(translate('config_cmd.autoroles.create', { name }))
}

export async function add(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const name = (interaction.options.getString('group') as string).split(/ +/gi).join('_')
    const rol = interaction.options.getRole('role') as Role
    const server = client.getServer(interaction.guild)
    if (!server.autoroles.has(name)) return interaction.editReply(translate('config_cmd.autoroles.not_found'))
    await server.addAutorol(name, rol.id)
    return interaction.editReply(translate('config_cmd.autoroles.added', { group: name, roll: rol.toString() }))
}

export async function remove(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const name = (interaction.options.getString('group') as string).split(/ +/gi).join('_')
    const rol = interaction.options.getRole('rol') as Role
    const server = client.getServer(interaction.guild)
    if (!server.autoroles.has(name)) return interaction.editReply(translate('config_cmd.autoroles.not_found'))
    await server.removeAutorolRol(name, rol.id)
    return interaction.editReply(translate('config_cmd.autoroles.remove', { roll: rol.toString(), group: name }))
}

export async function remove_group(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const name = (interaction.options.getString('group') as string).split(/ +/gi).join('_')
    const server = client.getServer(interaction.guild)
    await server.removeAutorol(name)
    interaction.editReply(translate('config_cmd.autoroles.remove_group'))
}

export async function display(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const name = (interaction.options.getString('group') as string).split(/ +/gi).join('_')
    const message = interaction.options.getString('message') ?? 'Choice yout role'
    const channel = (interaction.options.getChannel('channel') ?? interaction.channel) as TextChannel
    const server = client.getServer(interaction.guild)
    if (server.autoroles.has(name))
        await interaction.reply({
            content: translate('config_cmd.autoroles.displaying'),
            ephemeral: true
        })
    else {
        client.commands.get('config')?.deploy(interaction.guild)
        return interaction.reply(translate('config_cmd.autoroles.displaying_error'))
    }
    if (!checkSend(channel, interaction.guild.members.me as GuildMember)) {
        return interaction.reply(translate('config_cmd.autoroles.sending_error'))
    }

    const autoroles = server.autoroles.get(name) as Set<string>

    let row = 0,
        button = 0
    const components = [new ActionRowBuilder<MessageActionRowComponentBuilder>()]

    for (const rollId of autoroles) {
        const roll = await interaction.guild.roles.fetch(rollId)
        if (!roll) continue
        if (button++ >= 5) {
            button = 0
            components[++row] = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        }
        components[row].addComponents([
            new ButtonBuilder()
                .setLabel(roll.name)
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`config_autoroll_${rollId}`)
        ])
    }

    return channel.send({
        embeds: [new EmbedBuilder().setDescription(message)],
        components
    })
}
