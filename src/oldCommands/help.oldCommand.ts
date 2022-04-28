import { OldCommand, Client, oldCommandData, Server, Message, EmbedBuilder, ButtonBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonStyle } from '../utils/classes.js'
import { sendError, Util } from '../utils/utils.js'

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'help',
            description: 'show command help',
            alias: ['commands', 'command', 'comando', 'commandos'],
            client
        })
    }

    async run(msg: Message, server: Server) {
        try {
            const embed = new EmbedBuilder()
            const categories = await Help.getCategories()
            if (categories.length === 0) return msg.reply('parece que no he encontrado ningun comando')
            const commands = await Help.getCategory(categories[0])
            if (commands.length === 0) return msg.reply('parece que no he encontrado ningun comando')
            embed.setTitle(`${msg.client.user?.username} Bot command list`)
            embed.setDescription('Category: ' + categories[0] + '\n`<>` Means mandatory\n`[]` Means optional')
            await Promise.all(
                commands.map(cmd => {
                    embed.addFields([
                        {
                            name: `${cmd.name}`,
                            value: `${cmd.description}\n${Util.escapeBold('Alias')} ${
                                cmd.alias.length > 0 ? '`' + cmd.alias.join('` `') + '`' : 'none'
                            }\n${Util.escapeBold('Use')} ${Util.escapeInlineCode(
                                `${cmd.type == 'command' ? server?.getPrefixes(true)[0] ?? server?.prefixes[0] : '/'}${
                                    cmd.use
                                }`
                            )}`,
                            inline: true
                        }
                    ])
                })
            )
            embed.setFooter({
                text: server.translate('footer', { bot: msg.client.user?.username, version: this.client.version }),
                iconURL: msg.client.user?.avatarURL() ?? ''
            })
            embed.setThumbnail(msg.client.user?.avatarURL() ?? '')
            let j = 0,
                k = 0
            
            const components = []
            for (const i of categories) {
                const btn = new ButtonBuilder()
                    .setStyle(i == categories[0] ? ButtonStyle.Success : ButtonStyle.Primary)
                    .setLabel(i)
                    .setCustomId(`help_${server?.lang}_${i}`)
                if (j == 0) components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([btn]))
                else components[k].addComponents([btn])
                if (j == 4) {
                    j = 0
                    k++
                } else j++
            }
            return msg.reply({
                embeds: [embed],
                components
            })
        } catch (error) {
            msg.reply('Ha ocurrido un error, reporte genrado')
            sendError(this.client, error as Error, import.meta.url)
        }
        return
    }

    static async getCategories(): Promise<string[]> {
        const req = await fetch('https://oneki.herokuapp.com/api/commands/categories/')
        if (!req.ok) return Promise.resolve([])
        return Promise.resolve((await req.json()) as string[])
    }

    static async getCategory(category: string): Promise<oldCommandData[]> {
        const req = await fetch(`https://oneki.herokuapp.com/api/commands?category=${category}`)
        if (!req.ok) return Promise.resolve([])
        return Promise.resolve((await req.json()) as oldCommandData[])
    }
}
