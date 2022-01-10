import { ClientOptions as BaseClientOptions, PermissionResolvable } from "discord.js";
// import { ApplicationCommandPermissionType } from "discord-api-types";

import { Client } from "../classes/Client";
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
export default Client;

export * from "../classes/Client";
export * from "../classes/Command";
export * from "../classes/Button";
export * from "../classes/CommandManager";
export * from "../classes/ButtonManager";
export * from "../classes/ServerManager";
export * from "../classes/Server";

export enum CommandType {
    guild = 1,
    global,
}

export enum LangType {
    en = "en",
    es = "es",
}

export interface PollDatabaseModel {
    guild: string;
    options: {
        name: string;
        value: string;
        votes: string[];
    }[];
    show_results: boolean;
    title: string;
    context: string;
    multiple_choices: boolean;
    author: string;
    block_choices: boolean;
    message: string;
    channel: string;
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
    channel: string;
    default: boolean;
    alias?: string;
}

export interface LogsChannelsDatabaseModel {
    message_update?: string
    message_delete?: string
}

export interface GuildDataBaseModel {
    prefixes?: string[];
    lang?: LangType;
    suggest_channels?: SuggestChannelObject[];
    last_suggest?: number;
    logs_channels?: LogsChannelsDatabaseModel
    premium?: boolean
}

export interface ClientConstants {
    newServerLogChannel?: string;
}

export interface ClientOptions extends BaseClientOptions {
    firebaseToken?: {};
    constants?: ClientConstants;
}

export interface ButtonOptions {
    regex: RegExp;
    name: string;
}