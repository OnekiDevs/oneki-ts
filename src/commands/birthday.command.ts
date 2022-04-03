/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApplicationCommandDataResolvable, CommandInteraction, Guild } from 'discord.js'
import { FieldValue } from 'firebase-admin/firestore'
import Client, { Command, CommandType } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'

export default class Birthday extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'birthday',
            description: 'Change your birthday reminder',
            type: CommandType.global,
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        return new Promise(resolve => {
            const command = this.baseCommand
            command.addSubcommand(subcommand =>
                subcommand
                    .setName('set')
                    .setDescription('Set your birthday\'s date')
                    .addStringOption(option => 
                        option
                            .setName('date')
                            .setDescription('Your birthday\'s date FORM: MONTH/DAY')
                            .setRequired(true)
                    )
            )
            command.addSubcommand(subcommand =>
                subcommand
                    .setName('remove')
                    .setDescription('Remove your birthday\'s reminder')
            )
            resolve(command.toJSON())
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async run(interaction: CommandInteraction<'cached'>): Promise<any> {
        await interaction.deferReply()
        const translate = Translator(interaction)
        const subCommand = interaction.options.getSubcommand()
        if(subCommand === 'set'){
            const birthday = interaction.options.getString('date')!
            const regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])$/i

            //Check if satisfies the required 'MONTH/DAY' type
            if(!regex.test(birthday!)) return interaction.editReply(translate('birthday_cmd.error'))

            const dateToSave = `${birthday}/${new Date().getFullYear() + 1}`
            this.client.db?.collection('users').doc(interaction.user.id).update({ birthday: dateToSave }).catch(() => this.client.db?.collection('users').doc(interaction.user.id).set({ birthday: dateToSave })) 
            return interaction.editReply(translate('birthday_cmd.set', { birthday }))
        }// si la fecha dada es 5/22 añadirle el año actual osea 5/22/2022 y pasarlo a unixtime

        //If it's not the subcommand 'set' it's gotta be the 'remove' one
        this.client.db.collection('users').doc(interaction.user.id).update({ birthday: FieldValue.delete() })
        interaction.editReply(translate('birthday_cmd.remove'))
    }
}
