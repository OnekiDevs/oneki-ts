import {
    MessageActionRowComponentBuilder,
    SelectMenuOptionBuilder,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    SelectMenuBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    ModalBuilder,
    BitField
} from 'discord.js'
import { capitalize, checkSend } from 'offdjs'
import { _components, _embeds } from '../settings.js'
import { ChannelType } from 'discord.js'
import { getServer } from '../../cache/servers.js'

export async function selectMenuInteraction(interaction: SelectMenuInteraction<'cached'>) {
    const server = getServer(interaction.guild)
    const [, , opt] = interaction.customId.split('_') as ['settings', 'logs', 'remove' | 'set']
    // get the original embed
    const mr = await interaction.message.fetchReference()
    // check if is the same user
    if (mr?.embeds[0].author?.name !== interaction.member.displayName) return interaction.deferUpdate()

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

        mr.edit({
            embeds: [_embeds.logs(server, interaction.member)],
            components: _components.logs(server)
        })

        // response
        return interaction.message.delete()
    } // show modal
    else
        return interaction.showModal(
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
                                interaction.guild.channels?.cache.filter(c => c.type === ChannelType.GuildText).random()
                                    ?.id ?? '972563931233148983'
                            )
                    )
                )
        )
}

export async function modalSubmitInteraction(interaction: ModalSubmitInteraction<'cached'>) {
    const [, pag, opt, arg1] = interaction.customId.split('_') as
        | ['settings', 'logs', 'auto']
        | ['settings', 'logs', 'set', string]
    const server = getServer(interaction.guild)

    if (opt === 'auto') {
        // get the original embed
        const mr = await interaction.message?.fetchReference()
        // check if is the same user
        if (mr?.embeds[0].author?.name !== interaction.member.displayName)
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
            embeds: [_embeds[pag](server, interaction.member)],
            components: _components[pag](server)
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
        const channel = interaction.guild.channels.cache.get(interaction.fields.getTextInputValue('channel') as string)
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
            embeds: [_embeds[pag](server, interaction.member)],
            components: _components[pag](server)
        })

        // delete the message
        interaction.message?.delete()
    }

    await interaction.deferReply()
    return interaction.deleteReply()
}

export function _logsMenu(opt: 'set' | 'remove') {
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

export enum logBits {
    messageUpdate = 1 << 0,
    messageDelete = 1 << 1,
    messageAttachment = 1 << 2,
    invites = 1 << 3,
    memberUpdate = 1 << 4,
    sanctions = 1 << 5
}
