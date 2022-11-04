import {
    MessageActionRowComponentBuilder,
    ChatInputCommandInteraction,
    SelectMenuOptionBuilder,
    SelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    inlineCode
} from 'discord.js'
import Server from '../classes/Server'
import { GuildMember, ButtonBuilder, ButtonStyle } from 'discord.js'
import client from '../client.js'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
    // create initial embed
    const embed = new EmbedBuilder().setDescription('Settings').setAuthor({
        name: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL()
    })
    // response
    interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(_mainMenu(''))]
    })
}

export function _mainMenu(pag: string) {
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

export const _embeds = {
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
                    value: server.logsChannels.attachment ? `<#${server.logsChannels.attachment}>` : 'Sin configurar',
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

export const _components = {
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
