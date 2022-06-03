import { Client } from './classes.js'
import { fileURLToPath } from 'url'
import {
    PermissionResolvable,
    ChatInputCommandInteraction,
    TextChannel,
    GuildMember,
    PermissionsBitField,
    Attachment,
    EmbedBuilder,
    Message,
    Interaction,
    Util,
    Colors
} from 'discord.js'

export { Util }

/**
 * Sleep() returns a Promise that resolves after a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to wait before resolving the promise.
 * @returns A promise that resolves after a certain amount of time.
 */
export function sleep(ms: number = 1_000) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * It takes a string, capitalizes the first letter, and lowercases the rest
 * @param {string} input - The string to capitalize.
 * @returns {string} - A function that takes a string as an argument and returns a string.
 */
export function capitalize(input: string): string {
    return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase()
}

/**
 * Send a error message to the user
 * @param {ChatInputCommandInteraction | Message} interaction - The Message or Interaction to reply
 * @param {PermissionResolvable[] | PermissionResolvable} permissions - Missiings permissions
 */
export function permissionsError(
    interaction: ChatInputCommandInteraction | Message,
    permissions: PermissionResolvable[] | PermissionResolvable
) {
    interaction.reply({
        content: `No tienes los permissions suficientes, necesitas \`${new PermissionsBitField(permissions)
            .toArray()
            .join(', ')}\``,
        ephemeral: true
    })
}

/**
 * It checks if the member has the permission to send messages and view the channel
 * @param {TextChannel} channel - TextChannel - The channel you want to check
 * @param {GuildMember} member - GuildMember - The member you want to check
 * @returns {boolean} A boolean value.
 */
export function checkSend(channel: TextChannel, member: GuildMember): boolean {
    return channel
        .permissionsFor(member)
        .has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel])
}

/**
 * generate a string barr progges
 * @param current the current percentage to show
 * @param length the length of the barr
 * @returns a string bar
 */
export function filledBar(current: number, length = 25): string {
    const progress = Math.round(length * (current / 100))
    const emptyProgress = length - progress
    const progressText = '█'.repeat(progress)
    const emptyProgressText = ' '.repeat(emptyProgress)
    return progressText + emptyProgressText
}

/* It's an array of emojis. */
export const pollEmojis = [
    '🇦',
    '🇧',
    '🇨',
    '🇩',
    '🇪',
    '🇫',
    '🇬',
    '🇭',
    '🇮',
    '🇯',
    '🇰',
    '🇱',
    '🇲',
    '🇳',
    '🇴',
    '🇵',
    '🇶',
    '🇷',
    '🇸',
    '🇹'
]

/**
 * It returns a random string of 8 characters.
 * @returns {string} A random string of 8 characters.
 */
export function randomId() {
    return Math.random().toString().slice(-8)
}

/**
 * It takes a buffer and a discord client, and returns a promise that resolves to a string
 * @param {Buffer} img - Buffer - The image to upload
 * @param {Client} client - Client - The discord.js client
 * @returns {Promise<string>} - A promise that resolves to a string.
 */
export function imgToLink(img: Buffer, client: Client): Promise<string> {
    return new Promise((resolve, reject) => {
        const channel = client.channels.cache.get(client.constants.imgChannel)

        if (channel)
            (channel as TextChannel)
                .send({
                    files: [new Attachment(img)]
                })
                .then(msg => {
                    resolve(msg.attachments.first()?.url ?? '')
                })
                .catch(() => {
                    reject('No message')
                })
        else reject('No channel')
    })
}

/**
 * It sends an error to a discord channel
 * @param {Client} client - Client - The client that the error was thrown from
 * @param {Error} error - Error
 * @param {string} file - The file that the error occurred in.
 */
export async function sendError(client: Client, error: Error, file: string) {
    console.log(
        '\x1b[31m*****************************************************************\x1b[0m',
        error,
        '\n\x1b[31m*****************************************************************\x1b[0m'
    )
    const channel = await client.channels.fetch(client.constants.errorChannel as string)
    if (channel)
        (channel as TextChannel).send({
            content:
                process.env.NODE_ENV !== 'production'
                    ? process.env.DEVELOPER_ID
                        ? `<@${process.env.DEVELOPER_ID}>`
                        : null
                    : `<@&${client.constants.jsDiscordRoll}>`,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle('New Error Detected')
                    .addFields([
                        {
                            name: 'Error Type',
                            value: Util.escapeCodeBlock(`cmd\n${error.name}\n`),
                            inline: true
                        },
                        {
                            name: 'Error Message',
                            value: Util.escapeCodeBlock(`cmd\n${error.message}\n`),
                            inline: true
                        },
                        {
                            name: 'Error In',
                            value: Util.escapeCodeBlock(`cmd\n${fileURLToPath(file)}\n`),
                            inline: true
                        }
                    ]),
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setTitle('Error Stack')
                    .setDescription(Util.escapeCodeBlock(`cmd\n${error.stack}\n`))
            ]
        })
}

/**
 * It takes a phrase and an optional object of parameters, and returns a translated string
 * @typedef {function name(phrase: string, params?:string): string} transalte
 * @param {string} phrase
 * @param {string} [params]
 * @returns {string}
 */

/**
 * It takes an interaction and returns a function that takes a phrase and returns a translation
 * @param {Interaction} interaction - Interaction - The interaction object that contains the locale and client.
 * @returns {transalte} A function that takes a phrase and params and returns a string.
 */
export const Translator = function (interaction: Interaction | Message | { client: Client }) {
    let lang: string
    if (interaction instanceof Interaction) lang = interaction.locale?.slice(0, 2)
    else if (interaction instanceof Message) lang = interaction.guild?.preferredLocale.slice(0, 2) ?? 'en'
    else lang = 'en'
    const i18n = (interaction.client as Client).i18n

    /**
     * It takes a phrase and an optional object of parameters, and returns a translated string
     * @param {string} phrase - The phrase to translate
     * @param {object} [params] - An object whit the parameters to replace
     * @returns {string} - The function translate is being returned.
     */
    return (phrase: string, params?: object): string => {
        return i18n.__mf({ phrase, locale: lang }, params)
    }
}

/* It's an enum. It's a way to define a set of constants. */
export enum PunishmentType {
    WARN,
    KICK,
    MUTE,
    BAN,
    HACKBAN
}

/**
 * @interface PunishUser
 * @param {string} userId The id of the user to punish
 * @param {PunishmentType} type The type of punishment to apply
 * @param {string} reason The reason of the punishment
 * @param {number} [duration] The duration of the punishment in ms. Skip for permanent
 * @param {string} moderatorId The id of the moderator who punished the user
 */

export interface PunishUser {
    userId: string
    type: PunishmentType
    reason: string
    duration?: string
    moderatorId: string
}
