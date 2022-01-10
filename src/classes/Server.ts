import { Guild, GuildChannel } from "discord.js";
import { GuildDataBaseModel, Client, LangType, SuggestChannelObject, LogsChannelsDatabaseModel } from "../utils/classes";
import { firestore } from "firebase-admin";

export class Server {
    guild: Guild;
    private _prefixes: Array<string> = [">", "?"];
    db;
    private _lang: LangType = LangType.en; //TODO: utilizar el lenguaje en todos los archivos
    suggestChannels: SuggestChannelObject[] = [];
    lastSuggestId: number = 0;
    logsChannels: {
        messageUpdate?: string;
        messageDelete?: string;
    } = {};
    premium: boolean = false;
    /**
     * New Server object with information and config for the server
     * @param guild The guild to which the Server object will bind
     * @param options
     */
    constructor(guild: Guild, options?: GuildDataBaseModel) {
        this.guild = guild;
        this.db = (guild.client as Client).db?.collection("guilds").doc(guild.id);

        this.db?.get().then((response) => {
            let obj: GuildDataBaseModel = {};
            if (response.exists) {
                const data: GuildDataBaseModel = response.data() as GuildDataBaseModel;

                if (data.lang) this._lang = options?.lang && options.lang !== data.lang ? ((obj.lang = options.lang), options.lang) : data.lang;
                if (data.prefixes) {
                    if (options?.prefixes) {
                        const optpr = options.prefixes.sort();
                        const dtpr = data.prefixes.sort();
                        if (optpr.length !== dtpr.length || !optpr.every((v, i) => v === dtpr[i])) obj.prefixes = options.prefixes;
                        this._prefixes = options.prefixes;
                    } else this._prefixes = data.prefixes;
                }
                if (data.suggest_channels) {
                    if (options?.suggest_channels) {
                        const optsc = options.suggest_channels.sort();
                        const dtsc = data.suggest_channels.sort();
                        if (optsc.length !== dtsc.length || !optsc.every((v, i) => v.channel === dtsc[i].channel && v.default === dtsc[i].default && v.alias === dtsc[i].alias))
                            obj.suggest_channels = options.suggest_channels;
                        this.suggestChannels = options.suggest_channels;
                    } else this.suggestChannels = data.suggest_channels;
                }
                if (data.last_suggest) this.lastSuggestId = data.last_suggest;
                if (data.logs_channels) {
                    const { message_update, message_delete } = data.logs_channels;
                    if (options?.logs_channels) {
                        let obj2: LogsChannelsDatabaseModel = {};

                        if (message_update && message_update !== options.logs_channels.message_update) {
                            this.logsChannels.messageUpdate = message_update;
                            obj2.message_update = message_update;
                        } else if (message_update) {
                            this.logsChannels.messageUpdate = message_update;
                            obj2.message_update = message_update;
                        }

                        if (message_delete && message_delete !== options.logs_channels.message_delete) {
                            this.logsChannels.messageDelete = message_delete;
                            obj2.message_delete = message_delete;
                        } else if (message_delete) {
                            this.logsChannels.messageDelete = message_delete;
                            obj2.message_delete = message_delete;
                        }

                        if (Object.values(obj2).length > 0) obj.logs_channels = obj2;
                    } else {
                        if (message_update) this.logsChannels.messageUpdate = message_update;
                        if (message_delete) this.logsChannels.messageDelete = message_delete;
                    }
                }
                if (data.premium) this.premium = options?.premium && options.premium !== data.premium ? ((obj.premium = options.premium), options.premium) : data.premium;

                if (Object.values(obj).length > 0) this.db?.update(obj);
            } else {
                if (options?.lang) this._lang = ((obj.lang = options.lang), options.lang);
                if (options?.prefixes) this._prefixes = ((obj.prefixes = options.prefixes), options.prefixes);
                if (options?.suggest_channels) this.suggestChannels = ((obj.suggest_channels = options.suggest_channels), options.suggest_channels);
                if (options?.premium) this.premium = ((obj.premium = options.premium), options.premium);

                let obj2: LogsChannelsDatabaseModel = {};
                if (options?.logs_channels?.message_update) this.logsChannels.messageUpdate = ((obj2.message_update = options.logs_channels.message_update), options.logs_channels.message_update);
                if (options?.logs_channels?.message_delete) this.logsChannels.messageDelete = ((obj2.message_delete = options.logs_channels.message_delete), options.logs_channels.message_delete);

                if (Object.values(obj2).length > 0) obj.logs_channels = obj2;
                if (Object.values(obj).length > 0) this.db?.create(obj);
            }
        });
    }

    /**
     * Return all the prefixes that the bot listens to in the guild
     */
    get prefixies(): string[] {
        return [`<@!${this.guild.me?.id}>`, `<@${this.guild.me?.id}>`, ...this._prefixes];
    }

    /**
     *
     * @param onlyDeclared if return only declared prefixes or all prefixes that the bot listens to in the guild
     * @returns Array of prefixes
     */
    getPrefixes(onlyDeclared?: boolean): string[] {
        if (onlyDeclared === undefined || onlyDeclared) return this._prefixes;
        else return this.prefixies;
    }

    /**
     * Set a unique prefix in the Server.prefixes
     * @param prefix
     */
    setPrefix(prefix: string) {
        this._prefixes = [prefix];
        this.db?.update({ prefix: [prefix] }).catch(() => this.db?.update({ prefix: [prefix] }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_prefix",
                from: "mts",
                data: {
                    prefix: prefix,
                    guild: this.guild.id,
                },
            }),
        );
    }

    /**
     * Add a new prefix to the list of Server.prefixes
     * @param prefix
     */
    addPrefix(prefix: string) {
        this._prefixes.push(prefix);
        this.db?.update({ prefixies: this._prefixes }).catch(() => this.db?.set({ prefixies: this._prefixes }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "add_prefix",
                from: "mts",
                data: {
                    prefix: prefix,
                    guild: this.guild.id,
                },
            }),
        );
    }

    /**
     * Remove a prefix from the Server.prefixes
     * @param prefix
     */
    removePrefix(prefix: string) {
        if (this._prefixes.includes(prefix)) {
            this._prefixes.splice(this._prefixes.indexOf(prefix), 1);
            if (this._prefixes.length < 1) {
                this._prefixes = [">", "?"];
                this.db?.update({ prefixies: firestore.FieldValue.delete() }).catch(() => this.db?.set({ prefixies: firestore.FieldValue.delete() }));
            } else this.db?.update({ prefixies: firestore.FieldValue.arrayRemove(prefix) }).catch(() => this.db?.set({ prefixies: firestore.FieldValue.arrayRemove(prefix) }));
        }
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "remove_prefix",
                from: "mts",
                data: {
                    prefix: prefix,
                    guild: this.guild.id,
                },
            }),
        );
    }

    /**
     * Return a lang of the guild for the Server.lang
     */
    get lang(): string {
        return this._lang;
    }

    /**
     * Set a new language for the guild in the Server.lang
     * @param lang
     */
    setLang(lang: LangType) {
        this._lang = lang;
        this.db?.update({ lang }).catch(() => this.db?.set({ lang }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_guild_lang",
                from: "mts",
                data: {
                    lang,
                    guild: this.guild.id,
                },
            }),
        );
    }

    /**
     * Set a unique channel in the Server.suggestChannels
     * @param channel
     */
    setSuggestChannel(channel: GuildChannel) {
        this.suggestChannels = [{ channel: channel.id, default: true }] as SuggestChannelObject[];
        this.db?.update({ suggest_channels: [{ channel_id: channel.id, default: true }] }).catch(() => this.db?.set({ suggest_channels: [{ channel_id: channel.id, default: true }] }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_suggest_channel",
                from: "mts",
                data: {
                    channel: channel.id,
                    guild: this.guild.id,
                },
            }),
        );
    }

    /**
     * Add a channel to the Server.suggestChannels
     * @param suggestChannelObject
     */
    addSuggestChannel(suggestChannelObject: SuggestChannelObject) {
        if (suggestChannelObject.default) this.suggestChannels = this.suggestChannels.map((i) => ({ ...i, default: false }));
        this.suggestChannels.push(suggestChannelObject);
        this.db?.update({ suggest_channels: this.suggestChannels }).catch(() => this.db?.set({ suggest_channels: this.suggestChannels }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "add_suggest_channel",
                from: "mts",
                data: {
                    channel: suggestChannelObject.channel,
                    default: suggestChannelObject.default,
                    alias: suggestChannelObject.alias,
                    guild: this.guild.id,
                },
            }),
        );
    }

    /**
     * Remove a channel from the Server.suggestChannels
     * @param idToRemove id of channel to remove
     */
    removeSuggestChannel(idToRemove: string) {
        if (!this.suggestChannels.find((c) => c.channel == idToRemove)) return;
        const newChannels = this.suggestChannels
            .map((c) => {
                if (c.channel == idToRemove) return false;
                return c;
            })
            .filter((c) => c);
        this.suggestChannels = newChannels as SuggestChannelObject[];
        this.db?.update({ suggest_channels: this.suggestChannels }).catch(() => this.db?.set({ suggest_channels: this.suggestChannels }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "remove_suggest_channel",
                from: "mts",
                data: {
                    channel: idToRemove,
                    guild: this.guild.id,
                },
            }),
        );
    }

    private updateChannelsLogsInDB() {
        let data: any = {};
        if (this.logsChannels.messageDelete) data["logs_channels.message_delete"] = this.logsChannels.messageDelete;
        if (this.logsChannels.messageUpdate) data["logs_channels.message_update"] = this.logsChannels.messageUpdate;
        this.db?.update(data).catch(() => this.db?.set(data));
    }

    setMessageUpdateLog(channel: string) {
        this.logsChannels.messageUpdate = channel;
        this.updateChannelsLogsInDB();
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_log",
                from: "mts",
                data: {
                    log: "MESSAGE_UPDATE",
                    channel: channel,
                    guild: this.guild.id,
                },
            }),
        );
    }

    removeMessageUpdateLog() {
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "remove_log",
                from: "mts",
                data: {
                    log: "MESSAGE_UPDATE",
                    channel: this.logsChannels.messageUpdate,
                    guild: this.guild.id,
                },
            }),
        );
        delete this.logsChannels.messageUpdate;
        this.updateChannelsLogsInDB();
    }

    setMessageDeleteLog(channel: string) {
        this.logsChannels.messageDelete = channel;
        this.updateChannelsLogsInDB();
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_log",
                from: "mts",
                data: {
                    log: "MESSAGE_DELETE",
                    channel: channel,
                    guild: this.guild.id,
                },
            }),
        );
    }

    removeMessageDeleteLog() {
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "remove_log",
                from: "mts",
                data: {
                    log: "MESSAGE_DELETE",
                    channel: this.logsChannels.messageUpdate,
                    guild: this.guild.id,
                },
            }),
        );
        delete this.logsChannels.messageUpdate;
        this.updateChannelsLogsInDB();
    }
}
