import {
    ChatInputCommandInteraction,
    VoiceChannel,
    MessageActionRowComponentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ApplicationCommandOptionType,
    ButtonInteraction
} from 'discord.js'
import { Command } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'

export default class Activitie extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'activitie',
                'es-ES': 'actividad'
            },
            description: {
                'en-US': 'Play in the voice channel',
                'es-ES': 'Jugar en el canal de voz'
            },
            options: [
                {
                    name: {
                        'en-US': 'game',
                        'es-ES': 'juego'
                    },
                    description: {
                        'en-US': 'select a game',
                        'es-ES': 'selecciona un juego'
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'Watch Together', value: '880218394199220334/Watch Together' },
                        { name: 'Poker Night', value: '755827207812677713/Poker Night' },
                        { name: 'Betrayal.io', value: '773336526917861400/Betrayal.io' },
                        { name: 'Fishington.io', value: '814288819477020702/Fishington.io' },
                        { name: 'Chess In The Park', value: '832012774040141894/Chess In  }he Park' },
                        { name: 'Sketchy Artist', value: '879864070101172255/Sketchy Artist' },
                        { name: 'Awkword', value: '879863881349087252/Awkword' },
                        { name: 'Putts', value: '832012854282158180/Putts' },
                        { name: 'Doodle Crew', value: '878067389634314250/Doodle Crew' },
                        { name: 'Letter Tile', value: '879863686565621790/Letter Tile' },
                        { name: 'Word Snacks', value: '879863976006127627/Word Snacks' },
                        { name: 'SpellCast', value: '852509694341283871/SpellCast' },
                        { name: 'Checkers In The Park', value: '832013003968348200/Checkers In  }he Park' },
                        { name: 'CG4 Prod', value: '832025144389533716/CG4 Prod' },
                        { name: 'Doodle Jump', value: '879863868580107904/Doodle Jump' }
                    ]
                },
                {
                    name: {
                        'en-US': 'channel',
                        'es-ES': 'canal'
                    },
                    description: {
                        'en-US': 'select a voice channel',
                        'es-ES': 'selecciona un canal de voz'
                    },
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [2]
                }
            ]
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async interacion(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        const translate = Translator(interaction)
        const [activitieId, activitie] = (interaction.options.getString('game') as string).split('/')
        const channel =
            interaction.options.getChannel('channel') ??
            interaction.guild?.members.cache.get(interaction.user.id)?.voice.channel
        if (!channel)
            return interaction.reply({
                content: translate('activitie_cmd.whotout_voice'),
                ephemeral: true
            })
        const invite = await (channel as VoiceChannel).createInvite({
            targetApplication: activitieId,
            targetType: 2
        })
        interaction.reply({
            content: translate('activitie_cmd.reply', { activitie, channel }),
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
                    new ButtonBuilder()
                        .setLabel('join')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/invite/${invite.code}`),
                    new ButtonBuilder()
                        .setLabel('show link')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`act_${invite.code}`)
                ])
            ]
        })
    }

    async button(interaction: ButtonInteraction<'cached'>) {
        const [, code] = interaction.customId.split(/_/gi)
        interaction.reply(`https://discord.com/invite/${code}`)
    }
}
