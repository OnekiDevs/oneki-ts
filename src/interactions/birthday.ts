import { FieldValue } from '@google-cloud/firestore'
import { ChatInputCommandInteraction } from 'discord.js'
import { Translator } from 'offdjs'
import db from '../cache/db.js'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const subCommand = interaction.options.getSubcommand()
    if (subCommand === 'set') {
        const birthday = interaction.options.getString('date')!
        const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])$/i

        //Check if satisfies the required 'MONTH/DAY' type
        if (!regex.test(birthday!)) return interaction.editReply(translate('birthday_cmd.error'))

        const dateToSave = `${birthday}/${new Date().getFullYear() + 1}`
        db.collection('users')
            .doc(interaction.user.id)
            .update({ birthday: dateToSave })
            .catch(() => db?.collection('users').doc(interaction.user.id).set({ birthday: dateToSave }))
        return interaction.editReply(translate('birthday_cmd.set', { birthday }))
    } // si la fecha dada es 5/22 añadirle el año actual osea 5/22/2022 y pasarlo a unixtime

    //If it's not the subcommand 'set' it's gotta be the 'remove' one
    db.collection('users').doc(interaction.user.id).update({ birthday: FieldValue.delete() })
    return interaction.editReply(translate('birthday_cmd.remove'))
}
