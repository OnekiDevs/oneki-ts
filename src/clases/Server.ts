import { Guild, GuildChannel } from "discord.js";
import { GuildDataBaseModel, Client, LangType, SuggestChannelObject } from "../utils/clases";
import { firestore } from "firebase-admin";

export class Server {
    guild: Guild;
    private _prefixies: Array<string> = [">", "?"];
    db;
    private _lang: LangType = LangType.en; //TODO: utilizar el lenguaje en todos los archivos
    suggest_channels: SuggestChannelObject[] = [];
    constructor(guild: Guild, options?: GuildDataBaseModel) {
        this.guild = guild;
        this.db = (guild.client as Client).db?.collection("guilds").doc(guild.id);

        this.db?.get().then((response) => {
            let obj: GuildDataBaseModel = {};
            if (response.exists) {
                const data: GuildDataBaseModel = response.data() as GuildDataBaseModel;

                if (data.lang) this._lang = options?.lang && options.lang !== data.lang ? ((obj.lang = options.lang), options.lang) : data.lang;
                if (data.prefixies)
                    this._prefixies =
                        options?.prefixies && options.prefixies !== data.prefixies /* TODO: comparar los arrays options.prefixies y data.prefixies */
                            ? ((obj.prefixies = options.prefixies), options.prefixies)
                            : data.prefixies;
                if (data?.suggest_channels)
                    this.suggest_channels =
                        options?.suggest_channels &&
                        options.suggest_channels !== data.suggest_channels /* TODO: comparar los arrays options.suggest_channels y data.suggest_channels */
                            ? ((obj.suggest_channels = options.suggest_channels), options.suggest_channels)
                            : data.suggest_channels;

                if (Object.values(obj).length > 0) this.db?.update(obj);
            } else {
                if (options?.lang) this._lang = ((obj.lang = options.lang), options.lang);
                if (options?.prefixies) this._prefixies = ((obj.prefixies = options.prefixies), options.prefixies);
                if (options?.suggest_channels) this.suggest_channels = ((obj.suggest_channels = options.suggest_channels), options.suggest_channels);

                if (Object.values(obj).length > 0) this.db?.create(obj);
            }
        });
    }

    get prefixies(): string[] {
        return [`<@!${this.guild.me?.id}>`, `<@${this.guild.me?.id}>`, ...this._prefixies];
    }

    getPrefixes(onlyDeclared?: boolean): string[] {
        if (onlyDeclared === undefined || onlyDeclared) return this._prefixies;
        else return this.prefixies;
    }

    setPrefix(prefix: string) {
        this._prefixies = [prefix];
        this.db?.update({ prefix: [prefix] }).catch(() => this.db?.update({ prefix: [prefix] }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_prefix",
                data: {
                    prefix: prefix,
                    from: "module_ts",
                    guild_id: this.guild.id,
                },
            }),
        );
    }

    addPrefix(prefix: string) {
        this._prefixies.push(prefix);
        this.db?.update({ prefixies: this._prefixies }).catch(() => this.db?.set({ prefixies: this._prefixies }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "add_prefix",
                data: {
                    prefix: prefix,
                    prefixies: this._prefixies,
                    from: "module_ts",
                    guild_id: this.guild.id,
                },
            }),
        );
    }

    removePrefix(prefix: string) {
        if (this._prefixies.includes(prefix)) {
            this._prefixies.splice(this._prefixies.indexOf(prefix), 1);
            if (this._prefixies.length < 1) {
                this._prefixies = [">", "?"];
                this.db?.update({ prefixies: firestore.FieldValue.delete() }).catch(() => this.db?.set({ prefixies: firestore.FieldValue.delete() }));
            } else this.db?.update({ prefixies: firestore.FieldValue.arrayRemove(prefix) }).catch(() => this.db?.set({ prefixies: firestore.FieldValue.arrayRemove(prefix) }));
        }
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "remove_prefix",
                data: {
                    prefix: prefix,
                    prefixies: this._prefixies,
                    from: "module_ts",
                    guild_id: this.guild.id,
                },
            }),
        );
    }

    get lang() {
        return this._lang;
    }

    setLang(lang: LangType) {
        this._lang = lang;
        this.db?.update({ lang }).catch(() => this.db?.set({ lang }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_lang",
                data: {
                    lang,
                    from: "module_ts",
                    guild_id: this.guild.id,
                },
            }),
        );
    }

    setSuggestChannel(channel: GuildChannel) {
        this.suggest_channels = [{ channel_id: channel.id, default: true }] as SuggestChannelObject[];
        this.db
            ?.update({ suggest_channels: [{ channel_id: channel.id, default: true }] })
            .catch(() => this.db?.set({ suggest_channels: [{ channel_id: channel.id, default: true }] }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_suggest_channel",
                data: {
                    channel: channel.id,
                    default: true,
                    channels: this.suggest_channels,
                    from: "module_ts",
                    guild_id: this.guild.id,
                },
            }),
        );
    }

    addSuggestChannel(suggestChannelObject: SuggestChannelObject) {
        if (suggestChannelObject.default) this.suggest_channels = this.suggest_channels.map((i) => ({ ...i, default: false }));
        this.suggest_channels.push(suggestChannelObject);
        this.db?.update({ suggest_channels: this.suggest_channels }).catch(() => this.db?.set({ suggest_channels: this.suggest_channels }));
        (this.guild.client as Client).websocket.send(
            JSON.stringify({
                event: "set_suggest_channel",
                data: {
                    channel: suggestChannelObject.channel_id,
                    default: suggestChannelObject.default,
                    alias: suggestChannelObject.alias,
                    channels: this.suggest_channels,
                    from: "module_ts",
                    guild_id: this.guild.id,
                },
            }),
        );
    }

    removeSuggestChannel(toRemove: string) {}
}
