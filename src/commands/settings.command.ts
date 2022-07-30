import { 
    MessageActionRowComponentBuilder, 
    ChatInputCommandInteraction, 
    SelectMenuOptionBuilder, 
    ModalSubmitInteraction, 
    SelectMenuInteraction, 
    ButtonInteraction, 
    SelectMenuBuilder, 
    ActionRowBuilder,
    TextInputBuilder, 
    TextInputStyle, 
    ButtonBuilder, 
    ModalBuilder, 
    EmbedBuilder, 
    ChannelType,
    ButtonStyle, 
    quote
} from 'discord.js'

import client from '../client.js'
import { Command, Server } from '../utils/classes.js'
import { capitalize } from '../utils/utils.js'

export default class Settings extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'settings',
                'es-ES': 'configuraciones'
            },
            description: {
                'en-US': 'Config the bot',
                'es-ES': 'Configura el bot'
            }
        })
    }

    embeds = {
        logs(server: Server) {
            console.log(server.logsChannels);
            
            return new EmbedBuilder()
                .setDescription('El bot registra logs en canales que usted establezca')
                .setFields(
                    {
                        name: 'message_update log',
                        value: server.logsChannels.messageUpdate ?  `<#${server.logsChannels.messageUpdate}>` : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'message_delete log',
                        value: server.logsChannels.messageDelete ?  `<#${server.logsChannels.messageDelete}>` : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'message_attachment log',
                        value: server.logsChannels.attachment ?  `<#${server.logsChannels.attachment}>` : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'invites log',
                        value: server.logsChannels.invite ?  `<#${server.logsChannels.invite}>` : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'member_update log',
                        value: server.logsChannels.memberUpdate ?  `<#${server.logsChannels.memberUpdate}>` : 'Sin configurar',
                        inline: true
                    },
                    {
                        name:'sanctions log',
                        value: server.logsChannels.sanction?  `<#${server.logsChannels.sanction}>` : 'Sin configurar',
                        inline: true
                    }
                )
        },
        prefix(server: Server) {
            return new EmbedBuilder()
                .setTitle('Prefix Settings')
                .setDescription(`El bot funciona principalmente con comandos de barra (/), sin embargo, aun mantiene algunos comandos de prefijo funcionando.\nPara esos comandos usted puede configurar el prefijo que el bot escuchara.\nPuede usar la mencion del bot como un prefijo (<@${client.user.id}>)\nActualmente los prefijos que escucha el bot son: ${quote(server.getPrefixes().join('`, `'))}\n\nPuede establecer mas de un prefijo añadiendolo con el boton de ${quote('Add Prefix')}\nPuede eliminar un prefijo con el boton de ${quote('Remove Prefix')}\nPuede establecer un unico prefijo con el boton de ${quote('Set Prefix')}`)
        }
    }

    mainMenu(pag: string) {
        return new SelectMenuBuilder().addOptions(
            new SelectMenuOptionBuilder().setLabel('logs').setValue('logs').setDefault(pag === 'logs'),
            new SelectMenuOptionBuilder().setLabel('prefix').setValue('prefix').setDefault(pag === 'prefix')
        ).setCustomId('settings_menu').setPlaceholder('Seleccione lo que desea configurar')
    }

    components = {
        logs: (server: Server) => {
            return [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(this.mainMenu('logs')),
                new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                    new ButtonBuilder().setCustomId('settings_logs_set').setLabel('Set Log').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('settings_logs_auto').setLabel('Autoconfigure Logs').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('settings_logs_remove').setLabel('Remove Logs').setStyle(ButtonStyle.Danger)
                )
            ]
        },
        prefix: (server: Server) => {
            return [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(this.mainMenu('prefix')),
                new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                    new ButtonBuilder().setCustomId('settings_prefix_set').setLabel('Set Prefix').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('settings_prefix_add').setLabel('Add Prefix').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('settings_prefix_remove').setLabel('Remove Prefix').setStyle(ButtonStyle.Danger)
                )
            ]
        }
    }

    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        const embed = new EmbedBuilder().setDescription('Settings')
        interaction.reply({ embeds: [embed], components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(this.mainMenu(''))] })
    }

    async select(interaction: SelectMenuInteraction<'cached'>): Promise<any> {
        const [, opt] = interaction.customId.split('_') as [string, 'menu' | 'logs', string]
        const [pag] = interaction.values as ['logs' | 'prefix']
        const server = client.getServer(interaction.guild)

        if (opt === 'menu') {
            interaction.message.edit({ 
                embeds: [this.embeds[pag](server)],
                components: this.components[pag](server)
            })
            interaction.deferUpdate()
        } else if (opt === 'logs') {
            //TODO: terminar logs menu
        }
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const [, pag, opt, id] = interaction.customId.split('_') as [string, 'logs' | 'prefix' | 'autologs', string, string]
        // const server = client.getServer(interaction.guild)

        if (pag === 'prefix') 
            interaction.showModal(
                new ModalBuilder().setCustomId('settings_prefix_'+opt).setTitle(capitalize(opt)+' Prefix').setComponents(
                    new ActionRowBuilder<TextInputBuilder>().setComponents(
                        new TextInputBuilder()
                            .setCustomId('prefix')
                            .setLabel('Prefix')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(15)
                            .setRequired(true)
                            .setPlaceholder('>')
                    )
                )
            )
        else if (pag === 'logs') {
            if (opt === 'auto') {
                const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                    new ButtonBuilder().setCustomId('settings_autologs_y_'+interaction.message.id).setLabel('Si').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('settings_autologs_n_'+interaction.message.id).setLabel('No').setStyle(ButtonStyle.Danger),
                )
                interaction.reply({ components: [row], content: 'A continuacion se le pedira el ID de una categoria donde creara canales correspondientes para los logs.\n¿Desea continuar?' })
                setTimeout(() => interaction.deleteReply(), 60_000)
            } else if (opt === 'set') {
                const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                    new SelectMenuBuilder().addOptions(
                        new SelectMenuOptionBuilder().setLabel('message_update').setValue(String(1 << 0)),
                        new SelectMenuOptionBuilder().setLabel('message_delete').setValue(String(1 << 1)),
                        new SelectMenuOptionBuilder().setLabel('message_attachment').setValue(String(1 << 2)),
                        new SelectMenuOptionBuilder().setLabel('invites').setValue(String(1 << 3)),
                        new SelectMenuOptionBuilder().setLabel('member_update').setValue(String(1 << 4)),
                        new SelectMenuOptionBuilder().setLabel('sanctions').setValue(String(1 << 5))
                    ).setCustomId('settings_logs_set').setPlaceholder('Seleccione los logs que desea configurar').setMaxValues(5).setMinValues(1)
                )
                interaction.reply({ components: [row], content: 'Seleccione uno o varios logs a establecer y a continuacion se le pedira el ID de una canal de texto donde configurara los correspondientes logs' })
                setTimeout(() => interaction.deleteReply(), 60_000)
            } else if (opt === 'remove') {
                const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                    new SelectMenuBuilder().addOptions(
                        new SelectMenuOptionBuilder().setLabel('message_update').setValue(String(1 << 0)),
                        new SelectMenuOptionBuilder().setLabel('message_delete').setValue(String(1 << 1)),
                        new SelectMenuOptionBuilder().setLabel('message_attachment').setValue(String(1 << 2)),
                        new SelectMenuOptionBuilder().setLabel('invites').setValue(String(1 << 3)),
                        new SelectMenuOptionBuilder().setLabel('member_update').setValue(String(1 << 4)),
                        new SelectMenuOptionBuilder().setLabel('sanctions').setValue(String(1 << 5))
                    ).setCustomId('settings_logs_remove').setPlaceholder('Seleccione los logs que desea eliminar').setMaxValues(5).setMinValues(1)
                )
                interaction.reply({ components: [row], content: 'Seleccione uno o varios logs a eliminar' })
                setTimeout(() => interaction.deleteReply(), 60_000)
            }
        } else if (pag === 'autologs') {
            if (opt === 'y') 
                interaction.showModal(
                    new ModalBuilder().setCustomId('settings_logs_auto_'+id).setTitle('Category').setComponents(
                        new ActionRowBuilder<TextInputBuilder>().setComponents(
                            new TextInputBuilder()
                                .setCustomId('category')
                                .setLabel('Id de la categoria')
                                .setStyle(TextInputStyle.Short)
                                .setMaxLength(19)
                                .setMinLength(18)
                                .setRequired(true)
                                .setPlaceholder(interaction.guild.channels?.cache.filter(c => c.type === ChannelType.GuildCategory).random()?.id ?? '972563931233148983')
                        )
                    )
                )
            else interaction.message.delete()
        }
    }

    async modal(interaction: ModalSubmitInteraction<'cached'>): Promise<any> {
        const [, pag, opt, id] = interaction.customId.split('_') as [string, 'logs' | 'prefix', string, string | null]
        const server = client.getServer(interaction.guild)

        console.log(pag, opt);
        if (pag === 'prefix') {
            const prefix = interaction.fields.getTextInputValue('prefix') as string
            if (opt === 'add') server.addPrefix(prefix)
            else if (opt === 'remove') server.removePrefix(prefix)
            else server.setPrefix(prefix)
        } else if (pag === 'logs') {
            if (opt === 'auto') {
                const category = interaction.guild.channels.cache.get(interaction.fields.getTextInputValue('category') as string)
                if (!category || category.type !== ChannelType.GuildCategory) return interaction.reply({ content: 'El ID no es valido', ephemeral:true })
                
                const cm = await category.children.create({
                    name: 'messages',
                    type: 0
                })
                server.setMessageDeleteLog(cm.id)
                server.setMessageUpdateLog(cm.id)
            
                const ca = await category.children.create({
                    name: 'attachments',
                    type: 0,
                    nsfw: true
                })
                server.setAttachmentLog(ca.id)
            
                const cu = await category.children.create({
                    name: 'members',
                    type: 0
                })
                server.setMemberUpdateChannel(cu.id)
            
                const ci = await category.children.create({
                    name: 'invites',
                    type: 0
                })
                server.setInviteChannel(ci.id)

                const cs = await category.children.create({
                    name: 'sanctions',
                    type: 0
                })
                server.setSanctionChannel(cs.id)

                interaction.channel?.messages.fetch(id as string)?.then(m => m.edit({
                    embeds: [this.embeds[pag](server)],
                    components: this.components[pag](server)
                }))

                interaction.message?.delete()
            }
        }
        
        if (!id) interaction.message?.edit({
            embeds: [this.embeds[pag](server)],
            components: this.components[pag](server)
        })

        await interaction.deferReply() 
        return interaction.deleteReply()
    }
}
