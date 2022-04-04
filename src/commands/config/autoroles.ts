import { Embed } from '@discordjs/builders'
import { CommandInteraction, MessageActionRow, MessageButton, Role, TextChannel } from 'discord.js'
import { Client } from '../../classes/Client.js'
import { Translator } from '../../utils/utils.js'

export async function create(interaction: CommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const name = (interaction.options.getString('name') as string).split(/ +/gi).join('_')
    const server = (interaction.client as Client).getServer(interaction.guild)
    server.newAutorol(name)
    await (interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
    interaction.editReply(translate('config_cmd.autoroles.create', { name }))
}

export async function add(interaction: CommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const name = (interaction.options.getString('group') as string).split(/ +/gi).join('_')
    const rol = interaction.options.getRole('rol') as Role
    const server = (interaction.client as Client).getServer(interaction.guild)
    server.addAutorol(name, rol.id)
    await (interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
    interaction.editReply(translate('config_cmd.autoroles.added', { group:name, roll:rol }))
}

export async function remove(interaction: CommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const name = (interaction.options.getString('group') as string).split(/ +/gi).join('_')
    const rol = interaction.options.getRole('rol') as Role
    const server = (interaction.client as Client).getServer(interaction.guild)
    server.removeAutorolRol(name, rol.id)
    await (interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
    interaction.editReply(translate('config_cmd.autoroles.remove', { roll:rol.toString(), group:name }))
}

export async function remove_group(interaction: CommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const name = (interaction.options.getString('group') as string).split(/ +/gi).join('_')
    const server = (interaction.client as Client).getServer(interaction.guild)
    server.removeAutorol(name)
    await (interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
    interaction.editReply(translate('config_cmd.autoroles.remove_group'))
}

export async function display(interaction: CommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const name = (interaction.options.getString('group') as string).split(/ +/gi).join('_')
    const message = interaction.options.getString('message')??'Choice yout role'
    const channel = (interaction.options.getChannel('channel')??interaction.channel) as TextChannel
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (server.autoroles.has(name)) await interaction.reply({
        content: translate('config_cmd.autoroles.displaying'),
        ephemeral: true
    })
    else {
        (interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
        return interaction.reply(translate('config_cmd.autoroles.displaying_error'))
    }
    
    const autoroles = server.autoroles.get(name) as Set<string>

    let row = 0, button = 0
    const components: MessageActionRow[] = [new MessageActionRow()]

    for (const rollId of autoroles) {
        const roll = await interaction.guild.roles.fetch(rollId)
        if (!roll) continue
        if (button++ >= 5) {
            button = 0
            components[++row] = new MessageActionRow()
        }
        components[row].addComponents(
            new MessageButton()
                .setLabel(roll.name)
                .setStyle('PRIMARY')
                .setCustomId(`autoroll_${rollId}`)
        )
    }

    channel.send({
        embeds: [ new Embed().setDescription(message) ],
        components
    })
}