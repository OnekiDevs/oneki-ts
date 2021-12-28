import { ClientOptions as BaseClientOptions, PermissionResolvable } from "discord.js";
// import { ApplicationCommandPermissionType } from "discord-api-types";

import { Client } from "../clases/Client";
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
export default Client;

export * from "../clases/Client";
export * from "../clases/Command";
export * from "../clases/CommandManager";
export * from "../clases/ServerManager";
export * from "../clases/Server";

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
    type?: CommandType;
    public?: boolean;
    guilds?: string[];
    permissions?: PermissionResolvable[];
}

export interface SuggestChannelObject {
    channel_id: string;
    default: boolean;
    alias?: string;
}

export interface GuildDataBaseModel {
    prefixies?: string[];
    lang?: LangType;
    suggest_channels?: SuggestChannelObject[];
}

export interface ClientOptions extends BaseClientOptions {
    firebaseToken?: {};
}
