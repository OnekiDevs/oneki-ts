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
    inlineCode,
    BitField,
    GuildMember
} from 'discord.js'

import client from '../client.js'
import { Command, Server } from '../utils/classes.js'
import { capitalize, checkSend } from '../utils/utils.js'

export enum logBits {
    messageUpdate = 1 << 0,
    messageDelete = 1 << 1,
    messageAttachment = 1 << 2,
    invites = 1 << 3,
    memberUpdate = 1 << 4,
    sanctions = 1 << 5
}

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
        logs(server: Server, member: GuildMember) {
            return new EmbedBuilder()
                .setAuthor({
                    name: member.displayName,
                    iconURL: member.displayAvatarURL()
                })
                .setTitle('Logs Settings')
                .setDescription('El bot registra logs en canales que usted establezca')
                .setFields(
                    {
                        name: 'message_update log',
                        value: server.logsChannels.messageUpdate
                            ? `<#${server.logsChannels.messageUpdate}>`
                            : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'message_delete log',
                        value: server.logsChannels.messageDelete
                            ? `<#${server.logsChannels.messageDelete}>`
                            : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'message_attachment log',
                        value: server.logsChannels.attachment
                            ? `<#${server.logsChannels.attachment}>`
                            : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'invites log',
                        value: server.logsChannels.invite ? `<#${server.logsChannels.invite}>` : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'member_update log',
                        value: server.logsChannels.memberUpdate
                            ? `<#${server.logsChannels.memberUpdate}>`
                            : 'Sin configurar',
                        inline: true
                    },
                    {
                        name: 'sanctions log',
                        value: server.logsChannels.sanction ? `<#${server.logsChannels.sanction}>` : 'Sin configurar',
                        inline: true
                    }
                )
        },
        prefix(server: Server, member: GuildMember) {
            return new EmbedBuilder()
                .setAuthor({
                    name: member.displayName,
                    iconURL: member.displayAvatarURL()
                })
                .setTitle('Prefix Settings')
                .setDescription(
                    `El bot funciona principalmente con comandos de barra (/), sin embargo, aun mantiene algunos comandos de prefijo funcionando.\nPara esos comandos usted puede configurar el prefijo que el bot escuchara.\nPuede usar la mencion del bot como un prefijo (<@${
                        client.user.id
                    }>)\n\nActualmente los prefijos que escucha el bot son: ${inlineCode(
                        server.getPrefixes().join('`, `')
                    )}\n\nPuede establecer mas de un prefijo añadiendolo con el boton de ${inlineCode(
                        'Add Prefix'
                    )}\nPuede eliminar un prefijo con el boton de ${inlineCode(
                        'Remove Prefix'
                    )}\nPuede establecer un unico prefijo con el boton de ${inlineCode('Set Prefix')}`
                )
        }
    }

    mainMenu(pag: string) {
        return new SelectMenuBuilder()
            .addOptions(
                new SelectMenuOptionBuilder()
                    .setLabel('logs')
                    .setValue('logs')
                    .setDefault(pag === 'logs'),
                new SelectMenuOptionBuilder()
                    .setLabel('prefix')
                    .setValue('prefix')
                    .setDefault(pag === 'prefix')
            )
            .setCustomId('settings_menu')
            .setPlaceholder('Seleccione lo que desea configurar')
    }

    logsMenu(opt: 'set' | 'remove') {
        return new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
            new SelectMenuBuilder()
                .addOptions(
                    new SelectMenuOptionBuilder().setLabel('message_update').setValue(String(logBits.messageUpdate)),
                    new SelectMenuOptionBuilder().setLabel('message_delete').setValue(String(logBits.messageDelete)),
                    new SelectMenuOptionBuilder()
                        .setLabel('message_attachment')
                        .setValue(String(logBits.messageAttachment)),
                    new SelectMenuOptionBuilder().setLabel('invites').setValue(String(logBits.invites)),
                    new SelectMenuOptionBuilder().setLabel('member_update').setValue(String(logBits.memberUpdate)),
                    new SelectMenuOptionBuilder().setLabel('sanctions').setValue(String(logBits.sanctions))
                )
                .setCustomId('settings_logs_' + opt)
                .setPlaceholder('Seleccione los logs que desea configurar')
                .setMaxValues(6)
                .setMinValues(1)
        )
    }

    components = {
        logs: (server: Server) => {
            return [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(this.mainMenu('logs')),
                new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                    new ButtonBuilder()
                        .setCustomId('settings_logs_set')
                        .setLabel('Set Log')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('settings_logs_auto')
                        .setLabel('Autoconfigure Logs')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('settings_logs_remove')
                        .setLabel('Remove Logs')
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        },
        prefix: (server: Server) => {
            return [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(this.mainMenu('prefix')),
                new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                    new ButtonBuilder()
                        .setCustomId('settings_prefix_set')
                        .setLabel('Set Prefix')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('settings_prefix_add')
                        .setLabel('Add Prefix')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('settings_prefix_remove')
                        .setLabel('Remove Prefix')
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        }
    }

    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        // create initial embed
        const embed = new EmbedBuilder().setDescription('Settings').setAuthor({
            name: interaction.member.displayName,
            iconURL: interaction.member.displayAvatarURL()
        })
        // response
        interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(this.mainMenu(''))]
        })
    }

    async select(interaction: SelectMenuInteraction<'cached'>): Promise<any> {
        const [, mn, opt] = interaction.customId.split('_') as
            | ['settings', 'menu']
            | ['settings', 'logs', 'remove' | 'set']
        const server = client.getServer(interaction.guild)

        if (mn === 'menu') {
            // chech if is the same user
            if (interaction.message.embeds[0].author?.name !== interaction.member.displayName)
                return interaction.deferUpdate()
            // get the page and edit the embed
            const [pag] = interaction.values as ['logs' | 'prefix']
            interaction.message.edit({
                embeds: [this.embeds[pag](server, interaction.member)],
                components: this.components[pag](server)
            })
            // response
            interaction.deferUpdate()
        } else if (mn === 'logs') {
            // get the original embed
            const mr = await interaction.message.fetchReference()
            // check if is the same user
            if (mr.embeds[0].author?.name !== interaction.member.displayName) return interaction.deferUpdate()

            if (opt === 'remove') {
                // get the logs selected
                const logs = new BitField(interaction.values.map(Number).reduce((a, b) => a | b))

                // remove the logs selected
                if (logs.has(logBits.messageUpdate)) server.removeMessageUpdateLog()
                if (logs.has(logBits.messageDelete)) server.removeMessageDeleteLog()
                if (logs.has(logBits.messageAttachment)) server.removeAttachmentLog()
                if (logs.has(logBits.invites)) server.removeInviteChannelLog()
                if (logs.has(logBits.memberUpdate)) server.removeMemberUpdateLog()
                if (logs.has(logBits.sanctions)) server.removeSanctionChannel()

                // edit the embed

                mr?.edit({
                    embeds: [this.embeds.logs(server, interaction.member)],
                    components: this.components.logs(server)
                })

                // response
                interaction.message.delete()
            } // show modal
            else
                interaction.showModal(
                    new ModalBuilder()
                        .setCustomId(
                            'settings_logs_' +
                                opt +
                                '_' +
                                new BitField(interaction.values.map(Number).reduce((a, b) => a | b)).bitfield
                        )
                        .setTitle(capitalize(opt) + ' Log')
                        .setComponents(
                            new ActionRowBuilder<TextInputBuilder>().setComponents(
                                new TextInputBuilder()
                                    .setCustomId('channel')
                                    .setLabel('Channel')
                                    .setStyle(TextInputStyle.Short)
                                    .setMaxLength(19)
                                    .setMinLength(18)
                                    .setRequired(true)
                                    .setPlaceholder(
                                        interaction.guild.channels?.cache
                                            .filter(c => c.type === ChannelType.GuildText)
                                            .random()?.id ?? '972563931233148983'
                                    )
                            )
                        )
                )
        }
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const [, pag, opt] = interaction.customId.split('_') as buttonCustomIdSplit

        if (pag === 'prefix') {
            // check if is the same user
            if (interaction.message.embeds[0].author?.name !== interaction.member.displayName)
                return interaction.deferUpdate()
            // show modal
            interaction.showModal(
                new ModalBuilder()
                    .setCustomId('settings_prefix_' + opt)
                    .setTitle(capitalize(opt) + ' Prefix')
                    .setComponents(
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
        } else if (pag === 'logs') {
            if (opt === 'auto') {
                // check if is the same user
                if (interaction.message.embeds[0].author?.name !== interaction.member.displayName)
                    return interaction.deferUpdate()
                // yes and no buttons
                const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                    new ButtonBuilder().setCustomId('settings_autologs_y').setLabel('Si').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('settings_autologs_n').setLabel('No').setStyle(ButtonStyle.Danger)
                )
                // response
                interaction.reply({
                    components: [row],
                    content:
                        'A continuacion se le pedira el ID de una categoria donde creara canales correspondientes para los logs.\n¿Desea continuar?'
                })
                setTimeout(() => interaction.deleteReply().catch(() => null), 60_000) // timeout
            } else if (opt === 'set') {
                // check if is the same user
                if (interaction.message.embeds[0].author?.name !== interaction.member.displayName)
                    return interaction.deferUpdate()
                // menu of logs
                const row = this.logsMenu('set')
                // response
                interaction.reply({
                    components: [row],
                    content:
                        'Seleccione uno o varios logs a establecer y a continuacion se le pedira el ID de una canal de texto donde configurara los correspondientes logs'
                })
                setTimeout(() => interaction.deleteReply().catch(() => null), 60_000) // timeout
            } else if (opt === 'remove') {
                // check if is the same user
                if (interaction.message.embeds[0].author?.name !== interaction.member.displayName)
                    return interaction.deferUpdate()
                // menu of logs
                const row = this.logsMenu('remove')
                // response
                interaction.reply({ components: [row], content: 'Seleccione uno o varios logs a eliminar' })
                setTimeout(() => interaction.deleteReply().catch(() => null), 60_000) // timeout
            }
        } else if (pag === 'autologs') {
            // get the original embed
            const mr = await interaction.message.fetchReference()
            // check if is the same user
            if (mr.embeds[0].author?.name !== interaction.member.displayName) return interaction.deferUpdate()

            if (opt === 'y')
                // si si muetra el modal
                interaction.showModal(
                    new ModalBuilder()
                        .setCustomId('settings_logs_auto')
                        .setTitle('Category')
                        .setComponents(
                            new ActionRowBuilder<TextInputBuilder>().setComponents(
                                new TextInputBuilder()
                                    .setCustomId('category')
                                    .setLabel('Id de la categoria')
                                    .setStyle(TextInputStyle.Short)
                                    .setMaxLength(19)
                                    .setMinLength(18)
                                    .setRequired(true)
                                    .setPlaceholder(
                                        interaction.guild.channels?.cache
                                            .filter(c => c.type === ChannelType.GuildCategory)
                                            .random()?.id ?? '972563931233148983'
                                    )
                            )
                        )
                )
            else interaction.message.delete() // si no solo borra el mensaje
        }
    }

    async modal(interaction: ModalSubmitInteraction<'cached'>): Promise<any> {
        const [, pag, opt, arg1] = interaction.customId.split('_') as modalCustomIdSplit
        const server = client.getServer(interaction.guild)

        if (pag === 'prefix') {
            // check if is the same user
            if (interaction.message?.embeds[0].author?.name !== interaction.member.displayName)
                return interaction.reply({
                    content: 'Este modal no es para ti',
                    ephemeral: true
                })

            const prefix = interaction.fields.getTextInputValue('prefix') as string
            // add, remove or set prefix
            if (opt === 'add') server.addPrefix(prefix)
            else if (opt === 'remove') server.removePrefix(prefix)
            else server.setPrefix(prefix)
            // edit the embed
            interaction.message?.edit({
                embeds: [this.embeds[pag](server, interaction.member)],
                components: this.components[pag](server)
            })
            // response in the final
        } else if (pag === 'logs') {
            if (opt === 'auto') {
                // check if is the same user
                if (interaction.message?.embeds[0].author?.name !== interaction.member.displayName)
                    return interaction.reply({
                        content: 'Este modal no es para ti',
                        ephemeral: true
                    })
                // get category
                const category = interaction.guild.channels.cache.get(
                    interaction.fields.getTextInputValue('category') as string
                )
                // check if is valid
                if (!category || category.type !== ChannelType.GuildCategory)
                    return interaction.reply({ content: 'El ID no es valido', ephemeral: true })

                // create and config channels
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

                // edit the embed
                const rm = await interaction.message?.fetchReference()
                rm?.edit({
                    embeds: [this.embeds[pag](server, interaction.member)],
                    components: this.components[pag](server)
                })

                // delete the message
                interaction.message?.delete()
                // response in the final
            } else {
                // get the original embed
                const mr = await interaction.message?.fetchReference()
                // check if is the same user
                if (mr?.embeds[0].author?.name !== interaction.member.displayName)
                    return interaction.reply({
                        content: 'Este modal no es para ti',
                        ephemeral: true
                    })
                // get channel
                const channel = interaction.guild.channels.cache.get(
                    interaction.fields.getTextInputValue('channel') as string
                )
                // check if is valid
                if (!channel || channel.type !== ChannelType.GuildText)
                    return interaction.reply({ content: 'El ID no es valido', ephemeral: true })
                if (!checkSend(channel, interaction.guild.members.me!))
                    return interaction.reply({ content: 'No tengo permisos en ese canal', ephemeral: true })

                // set the channel configs
                const logs = new BitField(arg1)
                if (logs.has(logBits.messageUpdate)) server.setMessageUpdateLog(channel.id)
                if (logs.has(logBits.messageDelete)) server.setMessageDeleteLog(channel.id)
                if (logs.has(logBits.messageAttachment)) server.setAttachmentLog(channel.id)
                if (logs.has(logBits.invites)) server.setInviteChannel(channel.id)
                if (logs.has(logBits.memberUpdate)) server.setMemberUpdateChannel(channel.id)
                if (logs.has(logBits.sanctions)) server.setSanctionChannel(channel.id)

                // edit the embed
                mr?.edit({
                    embeds: [this.embeds[pag](server, interaction.member)],
                    components: this.components[pag](server)
                })

                // delete the message
                interaction.message?.delete()
            }
        }
        // response
        await interaction.deferReply()
        return interaction.deleteReply()
    }
}

type modalCustomIdSplit =
    | ['settings', 'prefix', 'add' | 'remove' | 'set']
    | ['settings', 'logs', 'auto']
    | ['settings', 'logs', 'set', string]

type buttonCustomIdSplit =
    | ['settings', 'prefix', 'add' | 'remove' | 'set']
    | ['settings', 'logs', 'auto' | 'remove' | 'set']
    | ['settings', 'autologs', 'y' | 'n']
