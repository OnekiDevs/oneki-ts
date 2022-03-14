import { ButtonInteraction, MessageEmbed, MessageButton, MessageActionRow } from 'discord.js'
import { Button, Client, oldCommandData } from '../utils/classes'

export default class Activitie extends Button {
    constructor() {
        super({
            name: 'help_',
            regex: /help_(es|en)_.+/gi,
        })
    }

    async run(interaction: ButtonInteraction) {
        const message = await interaction.channel?.messages.fetch(interaction.message.id)
        if (!message || !message.reference?.messageId) return interaction.deferUpdate()
        const messageRef = await interaction.channel?.messages.fetch(message.reference.messageId)
        if (!messageRef || messageRef.author.id !== interaction.user.id) return interaction.deferUpdate()
        const [lang] = interaction.customId.match(/(es|en)/) as string[]
        const [, , category] = interaction.customId.split(/_/g) as string[]
        fetch(`https://oneki.herokuapp.com/api/lang/${lang}/cmd/${category}`)
            .then((r) => r.json())
            .then(async (cmds) => {
                const server = (interaction.client as Client).servers.get(interaction.guildId ?? '')
                if (!server) return
                const embed = new MessageEmbed()
                embed.setTitle(server.translate('help_btn.embed_title', { bot: interaction.client.user?.username }))
                embed.setDescription(server.translate('help_btn.embed_description', { category }))
                await Promise.all(
                    (cmds as oldCommandData[]).map((cmd) => {
                        embed.addField(
                            cmd.name,
                            server.translate('help_btn.command_field', { cmd_description: cmd.description, alias: cmd.alias.length > 0 ? '`' + cmd.alias.join('` `') + '`' : 'none', cmd_prefix: (cmd.type == 'command' ? server?.getPrefixes(true)[0] ?? server?.prefixies[0] : '/'), cmd_use: cmd.use }),
                            true,
                        )
                    }),
                )
                embed.setFooter({
                    text: `${interaction.client.user?.username} Bot v${(interaction.client as Client).version}`,
                    iconURL: interaction.client.user?.avatarURL() ?? '',
                })
                embed.setThumbnail(interaction.client.user?.avatarURL() ?? '')
                let j = 0,
                    k = 0
                const components = []
                const res = await (await fetch(`https://oneki.herokuapp.com/api/lang/${lang}/cmd/categories`)).json()
                for (const i of res as string[]) {
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
            })
    }
}
