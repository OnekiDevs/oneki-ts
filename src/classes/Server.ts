import { Collection, Guild, GuildChannel, Invite, Message } from 'discord.js'
import { GuildDataBaseModel, Client, LangType, SuggestChannelObject, ServerInvite } from '../utils/classes.js'
import { FieldValue } from 'firebase-admin/firestore'
import i18n from 'i18n'
export class Server {
    invites: ServerInvite = []
    autoroles: Collection<string, Set<string>> = new Collection()
    rejectSug(id: string) {
        throw new Error('Method not implemented.' + id)
    }
    aceptSug(id: string) {
        throw new Error('Method not implemented.' + id)
    }
    emojiAnalisisEnabled = false
    private _i18n = i18n
    guild: Guild
    private _prefixes: Array<string> = ['>', '?']
    db
    private _lang: LangType = LangType.en
    suggestChannels: SuggestChannelObject[] = []
    private _lastSuggestId = 0
    logsChannels: {
        messageUpdate?: string
        messageDelete?: string
        messageAttachment?: string
    } = {}
    birthday: {
        channel?: string
        message?: string
    } = {}
    premium = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emojiStatistics: any = {}
    emojiTimeout?: NodeJS.Timer
    /**
     * New Server object with information and config for the server
     * @param guild The guild to which the Server object will bind
     * @param options
     */
    constructor(guild: Guild) {
        this.guild = guild
        this.db = (guild.client as Client).db.collection('guilds').doc(guild.id)
        this._i18n.configure((guild.client as Client).i18nConfig)
    }

    init() {
        return Promise.all([this.syncDB()])
    }

    async syncDB(dataPriority?: boolean): Promise<void> {
        const db = await this.db.get()

        if (!db.exists || dataPriority) {
            const obj = this.toDBObject()
            this.db.set(obj)
            return Promise.resolve()
        }

        const data = db.data() as GuildDataBaseModel

        if (data.lang) this.lang = data.lang
        if (data.premium) this.premium = true
        if (data.last_suggest) this.lastSuggestId = data.last_suggest
        if (data.suggest_channels) this.suggestChannels = data.suggest_channels
        if (data.logs_channels) {
            const { message_update, message_delete, message_attachment } = data.logs_channels

            if (message_update) this.logsChannels.messageUpdate = message_update
            if (message_delete) this.logsChannels.messageDelete = message_delete
            if (message_attachment) this.logsChannels.messageAttachment = message_attachment
        }
        if (data.birthday?.channel) this.birthday.channel = data.birthday.channel
        if (data.birthday?.message) this.birthday.message = data.birthday.message
        if (data.emoji_statistics) this.emojiStatistics = data.emoji_statistics
        if (data.emoji_analisis_enabled && data.premium) this.startEmojiAnalisis()

        return Promise.resolve()
    }

    toDBObject(toPublic?: boolean): GuildDataBaseModel {
        const obj: GuildDataBaseModel = {}
        if (JSON.stringify(this.getPrefixes(true)) !== JSON.stringify(['?', '>'])) obj.prefixes = this._prefixes
        if (this.lang !== LangType.en) obj.lang = this.lang
        if (this.lastSuggestId) obj.last_suggest = this.lastSuggestId
        if (this.suggestChannels) obj.suggest_channels = this.suggestChannels
        if (this.logsChannels) {
            const { messageUpdate, messageDelete, messageAttachment } = this.logsChannels
            obj.logs_channels = {}

            if (messageUpdate) obj.logs_channels.message_update = messageUpdate
            if (messageDelete) obj.logs_channels.message_delete = messageDelete
            if (messageAttachment) obj.logs_channels.message_attachment = messageAttachment
        }
        obj.birthday = {}
        if (this.birthday?.channel) obj.birthday.channel = this.birthday.channel
        if (this.birthday?.message) obj.birthday.message = this.birthday.message
        if (this.emojiAnalisisEnabled) obj.emoji_analisis_enabled = true
        if (toPublic && this.emojiStatistics) obj.emoji_statistics = this.emojiStatistics
        if (toPublic) obj.premium = this.premium

        return obj
    }

    /**
     * Returns a number of the last suggest id
     */
    get lastSuggestId() {
        return this._lastSuggestId
    }

    set lastSuggestId(n: number) {
        this._lastSuggestId = n
        this.db.update({ last_suggest: n }).catch(() => this.db.set({ last_suggest: n }))
    }

    /**
     * Return all the prefixes that the bot listens to in the guild
     */
    get prefixes(): string[] {
        return [`<@!${this.guild.me?.id}>`, `<@${this.guild.me?.id}>`, ...this._prefixes]
    }

    set prefixes(value: string[]) {
        this._prefixes = value
    }

    /**
     *  get prefixes of the server
     * @param {boolean} onlyDeclared - if return only declared prefixes or all prefixes that the bot listens to in the guild
     * @returns {string[]} - Array of prefixes
     */
    getPrefixes(onlyDeclared?: boolean): string[] {
        if (onlyDeclared === undefined || onlyDeclared) return this._prefixes
        else return this.prefixes
    }

    /**
     * Set a unique prefix in the Server.prefixes
     * @param {string} prefix - prefix to set
     */
    setPrefix(prefix: string) {
        this._prefixes = [prefix]
        this.db.update({ prefix: [prefix] }).catch(() => this.db.update({ prefix: [prefix] }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'set_prefix',
                from: 'mts',
                data: {
                    prefix: prefix,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Add a new prefix to the list of Server.prefixes
     * @param prefix
     */
    addPrefix(prefix: string) {
        this._prefixes.push(prefix)
        this.db.update({ prefixies: this._prefixes }).catch(() => this.db.set({ prefixies: this._prefixes }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'add_prefix',
                from: 'mts',
                data: {
                    prefix: prefix,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Remove a prefix from the Server.prefixes
     * @param {string} prefix - Prefix to remove
     */
    removePrefix(prefix: string) {
        if (this._prefixes.includes(prefix)) {
            this._prefixes.splice(this._prefixes.indexOf(prefix), 1)
            if (this._prefixes.length < 1) {
                this._prefixes = ['>', '?']
                this.db
                    .update({ prefixies: FieldValue.delete() })
                    .catch(() => this.db.set({ prefixies: FieldValue.delete() }))
            } else
                this.db
                    .update({ prefixies: FieldValue.arrayRemove(prefix) })
                    .catch(() => this.db.set({ prefixies: FieldValue.arrayRemove(prefix) }))
        }
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'remove_prefix',
                from: 'mts',
                data: {
                    prefix: prefix,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Return a lang of the guild for the Server.lang
     */
    get lang(): LangType {
        return this._lang
    }

    set lang(lang: LangType) {
        this._lang = lang
        this.db.update({ lang }).catch(() => this.db.set({ lang }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'set_guild_lang',
                from: 'mts',
                data: {
                    lang,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Set a unique channel in the Server.suggestChannels
     * @param {GuildChannel} channel - channel to set
     */
    setSuggestChannel(channel: GuildChannel) {
        this.suggestChannels = [{ channel: channel.id, default: true }] as SuggestChannelObject[]
        this.db
            .update({ suggest_channels: [{ channel: channel.id, default: true }] })
            .catch(() => this.db.set({ suggest_channels: [{ channel: channel.id, default: true }] }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'set_suggest_channel',
                from: 'mts',
                data: {
                    channel: channel.id,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Add a channel to the Server.suggestChannels
     * @param {SuggestChannelObject} suggestChannelObject - the information to add
     */
    addSuggestChannel(suggestChannelObject: SuggestChannelObject) {
        if (suggestChannelObject.default)
            this.suggestChannels = this.suggestChannels.map(i => ({ ...i, default: false }))
        this.suggestChannels.push(suggestChannelObject)
        this.db
            .update({ suggest_channels: this.suggestChannels })
            .catch(() => this.db.set({ suggest_channels: this.suggestChannels }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'add_suggest_channel',
                from: 'mts',
                data: {
                    channel: suggestChannelObject.channel,
                    default: suggestChannelObject.default,
                    alias: suggestChannelObject.alias,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Remove a channel from the Server.suggestChannels
     * @param {string} idToRemove - id of channel to remove
     */
    removeSuggestChannel(idToRemove: string) {
        if (!this.suggestChannels.find(c => c.channel == idToRemove)) return
        const newChannels = this.suggestChannels
            .map(c => {
                if (c.channel == idToRemove) return false
                return c
            })
            .filter(c => c)
        this.suggestChannels = newChannels as SuggestChannelObject[]
        this.db
            .update({ suggest_channels: this.suggestChannels })
            .catch(() => this.db.set({ suggest_channels: this.suggestChannels }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'remove_suggest_channel',
                from: 'mts',
                data: {
                    channel: idToRemove,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Sync the server config with the data base
     */
    private updateChannelsLogsInDB() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {}
        if (this.logsChannels.messageUpdate) data['logs_channels.message_update'] = this.logsChannels.messageUpdate
        if (this.logsChannels.messageAttachment)
            data['logs_channels.message_attachment'] = this.logsChannels.messageAttachment
        if (this.logsChannels.messageDelete) data['logs_channels.message_delete'] = this.logsChannels.messageDelete
        if (!data.logs_channels) data.logs_channels = FieldValue.delete()
        this.db.update(data).catch(() => this.db.set(data))
    }

    /**
     * Set a Message Update Log
     * @param {string} channel - id of the channel to set
     */
    setMessageUpdateLog(channel: string) {
        this.logsChannels.messageUpdate = channel
        this.db
            .update({ ['logs_channels.message_update']: channel })
            .catch(() => this.db.set({ ['logs_channels.message_update']: channel }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'set_log',
                from: 'mts',
                data: {
                    log: 'MESSAGE_UPDATE',
                    channel: channel,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Remove the Message Update Log
     */
    removeMessageUpdateLog() {
        if (!this.logsChannels.messageUpdate) return
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'remove_log',
                from: 'mts',
                data: {
                    log: 'MESSAGE_UPDATE',
                    channel: this.logsChannels.messageUpdate,
                    guild: this.guild.id
                }
            })
        )
        delete this.logsChannels.messageUpdate
        this.updateChannelsLogsInDB()
    }

    /**
     * Set a Message Delete Log
     * @param {string} channel - id of the channel to set
     */
    setMessageDeleteLog(channel: string) {
        this.logsChannels.messageDelete = channel
        this.db
            .update({ ['logs_channels.message_delete']: channel })
            .catch(() => this.db.set({ ['logs_channels.message_delete']: channel }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'set_log',
                from: 'mts',
                data: {
                    log: 'MESSAGE_DELETE',
                    channel: channel,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Remove the Message Delete Log
     */
    removeMessageDeleteLog() {
        if (!this.logsChannels.messageDelete) return
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'remove_log',
                from: 'mts',
                data: {
                    log: 'MESSAGE_DELETE',
                    channel: this.logsChannels.messageDelete,
                    guild: this.guild.id
                }
            })
        )
        delete this.logsChannels.messageDelete
        this.updateChannelsLogsInDB()
    }

    /**
     * Set a Message Attachments Log
     * @param {string} channel - id of the channel to set
     */
    setMessageAttachmentLog(channel: string) {
        this.logsChannels.messageAttachment = channel
        this.db
            .update({ ['logs_channels.message_attachment']: channel })
            .catch(() => this.db.set({ ['logs_channels.message_attachment']: channel }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'set_log',
                from: 'mts',
                data: {
                    log: 'MESSAGE_ATTACHMENT',
                    channel,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Remove the Message Attachments Log
     */
    removeMessageAttachmentLog() {
        if (!this.logsChannels.messageAttachment) return
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'remove_log',
                from: 'mts',
                data: {
                    log: 'MESSAGE_ATTACHMENT',
                    channel: this.logsChannels.messageAttachment,
                    guild: this.guild.id
                }
            })
        )
        delete this.logsChannels.messageAttachment
        this.updateChannelsLogsInDB()
    }

    /**
     * Get a response in the language set on the server
     * @param {string} phrase - phrase to translate
     * @param {string} params - if is nesesary
     * @returns {string} string
     */
    translate(phrase: string, params?: object): string {
        if (params) return this._i18n.__mf({ phrase, locale: this.lang }, params) ?? ''
        return this._i18n.__({ phrase, locale: this.lang }) ?? ''
    }

    /**
     * Set the server's birthday channel
     * @param {string} birthdayChannel - The channel id to use
     */
    setBirthdayChannel(birthdayChannel: string) {
        this.birthday.channel = birthdayChannel
        this.db
            .update({ ['birthday.channel']: birthdayChannel })
            .catch(() => this.db.set({ ['birthday.channel']: birthdayChannel }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'set_birthdaychannel',
                from: 'mts',
                data: {
                    log: 'BIRTHDAY_CHANNEL',
                    channel: birthdayChannel,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Set the server's birthday message
     * @param {string} birthdayMessage - The message to use
     */
    setBirthdayMessage(birthdayMessage: string) {
        this.birthday.message = birthdayMessage
        this.db
            .update({ ['birthday.message']: birthdayMessage })
            .catch(() => this.db.set({ ['birthday.message']: birthdayMessage }))
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'set_birthdaymessage',
                from: 'mts',
                data: {
                    log: 'BIRTHDAY_MESSAGE',
                    message: birthdayMessage,
                    guild: this.guild.id
                }
            })
        )
    }

    /**
     * Remove server's birthday channel
     */
    removeBirthdayChannel() {
        if (!this.birthday.channel) return
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'remove_birthday',
                from: 'mts',
                data: {
                    log: 'BIRTHDAY_CHANNEL',
                    channel: this.birthday.channel,
                    guild: this.guild.id
                }
            })
        )
        delete this.birthday.channel
        this.updateChannelsLogsInDB()
    }

    /**
     * Remove server's birthday message
     */
    removeBirthdayMessage() {
        if (!this.birthday.message) return
        ;(this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: 'remove_birthday',
                from: 'mts',
                data: {
                    log: 'BIRTHDAY_MESSAGE',
                    message: this.birthday.message,
                    guild: this.guild.id
                }
            })
        )
        delete this.birthday.message
        this.updateChannelsLogsInDB()
    }

    startEmojiAnalisis() {
        if (this.emojiAnalisisEnabled) return
        else this.emojiAnalisisEnabled = true
        this.db.update({ emoji_analisis_enabled: true }).catch(() => this.db.set({ emoji_analisis_enabled: true }))

        this.emojiTimeout = setInterval(() => {
            this.db.update({
                emoji_statistics: this.emojiStatistics
            })
        }, 600_000)

        this.guild.client.on('messageCreate', msg => {
            if (!msg.guild) return
            if (!msg.content) return

            const emojis = msg.content.match(/<a?:[a-z_]+:\d{18}>/gi)
            if (!emojis) return

            const ids = emojis?.map(e => e.replace(/<a?:[a-z_]+:(?<id>\d{18})>/i, '$<id>'))

            for (const id of ids) {
                const emoji = msg.guild.emojis.cache.get(id)
                if (emoji) this.emojiStatistics[id] = this.emojiStatistics[id] ? this.emojiStatistics[id]++ : 1
            }
        })
    }

    stopEmojiAnalisis() {
        this.emojiAnalisisEnabled = false
        this.db.update({ emoji_analisis_enabled: false }).catch(() => this.db.set({ emoji_analisis_enabled: false }))

        if (this.emojiTimeout) clearInterval(this.emojiTimeout)

        this.guild.client.removeListener('messageCreate', this.emojiAnalisis)
    }

    emojiAnalisis(msg: Message) {
        if (!msg.guild) return
        if (!msg.content) return

        const emojis = msg.content.match(/<a?:[a-z_]+:\d{18}>/gi)
        if (!emojis) return

        const ids = emojis?.map(e => e.replace(/<a?:[a-z_]+:(?<id>\d{18})>/i, '$<id>'))

        for (const id of ids) {
            const emoji = msg.guild.emojis.cache.get(id)
            if (emoji) this.emojiStatistics[id] = this.emojiStatistics[id] ? this.emojiStatistics[id]++ : 1
        }
    }

    /**
     * Get the Guild invites and parse it
     * @returns {Promise<ServerInvite>} - Invites parsed
     */
    async getInvites(): Promise<ServerInvite> {
        const invites = await this.guild.invites.fetch()
        this.invites = await Promise.all(
            invites.map((i: Invite) => ({
                user: i.inviterId ?? 'server',
                count: i.memberCount,
                code: i.code
            }))
        )
        return Promise.resolve(this.invites)
    }

    newAutorol(name: string) {
        this.autoroles.set(name, new Set())
        this.db.update({ ['autoroles.' + name]: [] }).catch(() => this.db.set({ ['autoroles.' + name]: [] }))
    }

    addAutorol(name: string, id: string) {
        if (!this.autoroles.has(name)) return
        this.autoroles.get(name)?.add(id)
        this.db.update({ ['autoroles.' + name]: Array.from(this.autoroles.get(name)!.values()) }).catch(() => this.db.set({ ['autoroles.' + name]: Array.from(this.autoroles.get(name)!.values()) }))
    }

    removeAutorolRol(name: string, id: string) {
        if (!this.autoroles.has(name)) return
        this.autoroles.get(name)?.delete(id)
        this.db.update({ ['autoroles.' + name]: Array.from(this.autoroles.get(name)!.values()) }).catch(() => this.db.set({ ['autoroles.' + name]: Array.from(this.autoroles.get(name)!.values()) }))
    }

    removeAutorol(name: string) {
        if (!this.autoroles.has(name)) return
        this.autoroles.delete(name)
        this.db.update({ ['autoroles.' + name]: FieldValue.delete() }).catch(() => this.db.set({ ['autoroles.' + name]: FieldValue.delete() }))
    }
}
