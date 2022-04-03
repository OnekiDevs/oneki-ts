import { ButtonInteraction, MessageEmbed, MessageButton, MessageActionRow } from 'discord.js'
import { Button, Client } from '../utils/classes.js'
import Help from '../oldCommands/help.oldCommand.js' 
import { Translator } from '../utils/utils.js'

export default class Activitie extends Button {
    constructor(client: Client) {
        super(client, /help_(es|en)_.+/i)
    }

    async run(interaction: ButtonInteraction<'cached'>) {
        const message = await interaction.channel?.messages.fetch(interaction.message.id)
        if (!message || !message.reference?.messageId) return interaction.deferUpdate()
        const messageRef = await interaction.channel?.messages.fetch(message.reference.messageId)
        if (!messageRef || messageRef.author.id !== interaction.user.id) return interaction.deferUpdate()
        const [lang] = interaction.customId.match(/(es|en)/) as string[]
        const [, , category] = interaction.customId.split(/_/g) as string[]
        const translate = Translator(interaction)
        const server = this.client.getServer(interaction.guild)
        const embed = new MessageEmbed()
        embed.setTitle(translate('help_btn.embed_title', { bot: interaction.client.user?.username }))
        embed.setDescription(translate('help_btn.embed_description', { category }))
        const commands = await Help.getCategory(category)
        await Promise.all(
            commands.map((cmd) => {
                embed.addField(
                    cmd.name,
                    translate('help_btn.command_field', { cmd_description: cmd.description, alias: cmd.alias.length > 0 ? '`' + cmd.alias.join('` `') + '`' : 'none', cmd_prefix: (cmd.type == 'slash' ? '/' : server?.getPrefixes(true)[0] ?? server?.prefixes[0]), cmd_use: cmd.use }),
                    true,
                )
            }),
        )
        embed.setFooter({
            text: translate('footer', { bot: interaction.client.user?.username, version: this.client.version }),
            iconURL: interaction.client.user?.avatarURL() ?? '',
        })
        embed.setThumbnail(interaction.client.user?.avatarURL() ?? '')
        let j = 0,
            k = 0
        const components = []
        const res = await Help.getCategories()
        for (const i of res) {
            const btn = new MessageButton()
                .setStyle(i == category ? 'SUCCESS' : 'PRIMARY')
                .setLabel(i)
                .setCustomId(`help_${lang}_${i}`)
            if (j == 0) components.push(new MessageActionRow().addComponents([btn]))
            else components[k].addComponents([btn])
            if (j == 4) {
                j = 0
                k++
            } else j++
        }
        interaction.deferUpdate()
        return interaction.channel?.messages.cache.get(interaction.message?.id)?.edit({
            embeds: [embed],
            components,
        })
    }
}
