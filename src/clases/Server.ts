import { Guild } from "discord.js";
import { ServerOptions, Client, LangType, GuildDataBaseModel } from "../utils/clases";
import { firestore } from "firebase-admin";

export class Server {
    guild: Guild;
    private _prefixies: Array<string> = [">", "?"];
    db;
    private _lang: LangType = LangType.en;
    constructor(guild: Guild, options?: ServerOptions) {
        this.guild = guild;
        this.db = (guild.client as Client).db?.collection("guilds").doc(guild.id);

        this.db?.get().then((response) => {
            let obj: GuildDataBaseModel = {};
            if (response.exists) {
                const data: GuildDataBaseModel = response.data() as GuildDataBaseModel;

                if (data.lang) this._lang = options?.lang && options.lang !== data.lang ? ((obj.lang = options.lang), options.lang) : data.lang;
                if (data.prefixies)
                    this._prefixies = options?.prefixies && options.prefixies !== data.prefixies ? ((obj.prefixies = options.prefixies), options.prefixies) : data.prefixies; // TODO: comparar los arrays

                if (Object.values(obj).length > 0) this.db?.update(obj);
            } else {
                if (options?.lang) (this._lang = obj.lang = options.lang), options.lang;
                if (options?.prefixies) this._prefixies = ((obj.prefixies = options.prefixies), options.prefixies);

                if (Object.values(obj).length > 0) this.db?.create(obj);
            }
        });
    }

    get prefixies(): string[] {
        return [`<@!${this.guild.me?.id}>`, `<@${this.guild.me?.id}>`, ...this._prefixies];
    }

    setPrefix(prefix: string) {
        this._prefixies = [prefix];
        this.db?.update({ prefix: [prefix] });
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
        this.db?.update({ prefixies: this._prefixies });
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
                this.db?.update({ prefixies: firestore.FieldValue.delete() });
            } else this.db?.update({ prefixies: firestore.FieldValue.arrayRemove(prefix) });
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
        this.db?.update({ lang });
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
}
