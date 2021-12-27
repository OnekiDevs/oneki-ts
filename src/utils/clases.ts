import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
import { ClientOptions as BaseClientOptions, PermissionResolvable } from "discord.js";

import { Client } from "../clases/Client";
export default Client;

export * from "../clases/Client";
export * from "../clases/Command";
export * from "../clases/CommandManager";
export * from "../clases/ServerManager";
export * from "../clases/Server"
export * from "../clases/Event"

export enum CommandType {
    guild,
    global,
}

export enum LangType {
    en = "en",
    es = "es",
}

export interface CommandPermissions {
    id: string;
    type: ApplicationCommandPermissionTypes;
    permission: boolean;
}

export interface CommandOptions {
    name: string;
    description: string;
    defaultPermission?: boolean;
    options?: {};
    type?: CommandType
    public?: boolean;
    guilds?: Array<string>;
    permissions?: PermissionResolvable[];
}

export interface GuildDataBaseModel {
    prefixies?: Array<string>;
    lang?: LangType;
}

export interface ServerOptions extends GuildDataBaseModel {
    checkDB?: boolean;
}

export interface ClientOptions extends BaseClientOptions {
    firebaseToken?: {};
}