
import { ApplicationCommandDataResolvable, CommandInteraction, VoiceChannel, MessageActionRow, MessageButton } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'

export default class Activitie extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'activitie',
            description: 'Play in the voice channel',
            category: 'Entertainment',
            defaultPermission: true,
            type: CommandType.global,
        })
    }

    async getData(): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addStringOption((option) =>
                option
                    .setName('game')
                    .setDescription('select a game')
                    .setRequired(true)
                    .addChoices([
                        ['Watch Together', '880218394199220334/Watch Together'],
                        ['Poker Night', '755827207812677713/Poker Night'],
                        ['Betrayal.io', '773336526917861400/Betrayal.io'],
                        ['Fishington.io', '814288819477020702/Fishington.io'],
                        ['Chess In The Park', '832012774040141894/Chess In The Park'],
                        ['Sketchy Artist', '879864070101172255/Sketchy Artist'],
                        ['Awkword', '879863881349087252/Awkword'],
                        ['Putts', '832012854282158180/Putts'],
                        ['Doodle Crew', '878067389634314250/Doodle Crew'],
                        ['Letter Tile', '879863686565621790/Letter Tile'],
                        ['Word Snacks', '879863976006127627/Word Snacks'],
                        ['SpellCast', '852509694341283871/SpellCast'],
                        ['Checkers In The Park', '832013003968348200/Checkers In The Park'],
                        ['CG4 Prod', '832025144389533716/CG4 Prod'],
                    ]),
            )
            .addChannelOption(option => option.setName('channel').setDescription('voice channel').addChannelType(2))
            .toJSON() as ApplicationCommandDataResolvable
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async run(interaction: CommandInteraction<'cached'>): Promise<any> {
        const translate = Translator(interaction)
        const [activitieId, activitie] = (interaction.options.getString('game') as string).split('/')
        const channel = interaction.options.getChannel('channel') ?? interaction.guild?.members.cache.get(interaction.user.id)?.voice.channel
        if (!channel) return interaction.reply({
            content: translate('activitie_cmd.whotout_voice'),
            ephemeral: true,
        })
        const invite = await (channel as VoiceChannel).createInvite({
            targetApplication: activitieId,
            targetType: 2,
        })
        interaction.reply({
            content: translate('activitie_cmd.reply', {activitie, channel}),
            components: [
                new MessageActionRow().addComponents([
                    new MessageButton().setLabel('join').setStyle('LINK').setURL(`https://discord.com/invite/${invite.code}`),
                    new MessageButton()
                        .setLabel('show link')
                        .setStyle('SECONDARY')
                        .setCustomId(`act_sl_${invite.code}`)
                ]),
            ]
        })
    }
}