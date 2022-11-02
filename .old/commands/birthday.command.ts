/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js'
import { FieldValue } from '@google-cloud/firestore'
import client from '../client.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'

export default class Birthday extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'birthday',
                'es-ES': 'cumpleaños'
            },
            description: {
                'en-US': 'Set your birthday reminder',
                'es-ES': 'Añadir un recordatorio de tu cumpleaños'
            },
            options: [
                {
                    name: {
                        'en-US': 'set',
                        'es-ES': 'establecer'
                    },
                    description: {
                        'en-US': "Set your birthday's date",
                        'es-ES': 'Establecer la fecha de tu cumpleaños'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: {
                                'en-US': 'date',
                                'es-ES': 'fecha'
                            },
                            description: {
                                'en-US': "Your birthday's date FORM: MONTH/DAY",
                                'es-ES': 'La fecha de tu cumpleaños EN: MES/DIA'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'remove',
                        'es-ES': 'eliminar'
                    },
                    description: {
                        'en-US': "Remove your birthday's date",
                        'es-ES': 'Eliminar la fecha de tu cumpleaños'
                    },
                    type: ApplicationCommandOptionType.Subcommand
                }
            ]
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        await interaction.deferReply()
        const translate = this.translator(interaction)
        const subCommand = interaction.options.getSubcommand()
        if (subCommand === 'set') {
            const birthday = interaction.options.getString('date')!
            const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])$/i

            //Check if satisfies the required 'MONTH/DAY' type
            if (!regex.test(birthday!)) return interaction.editReply(translate('birthday_cmd.error'))

            const dateToSave = `${birthday}/${new Date().getFullYear() + 1}`
            client.db
                ?.collection('users')
                .doc(interaction.user.id)
                .update({ birthday: dateToSave })
                .catch(() => client.db?.collection('users').doc(interaction.user.id).set({ birthday: dateToSave }))
            return interaction.editReply(translate('birthday_cmd.set', { birthday }))
        } // si la fecha dada es 5/22 añadirle el año actual osea 5/22/2022 y pasarlo a unixtime

        //If it's not the subcommand 'set' it's gotta be the 'remove' one
        client.db.collection('users').doc(interaction.user.id).update({ birthday: FieldValue.delete() })
        interaction.editReply(translate('birthday_cmd.remove'))
    }
}
