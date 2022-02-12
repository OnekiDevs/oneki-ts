import { ClientOptions as BaseClientOptions, PermissionResolvable } from "discord.js";
// import { ApplicationCommandPermissionType } from "discord-api-types";

import { Client } from "../classes/Client";
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
export default Client;

export * from "../classes/Client";
export * from "../classes/Command";
export * from "../classes/OldCommand";
export * from "../classes/Button";
export * from "../classes/Server";
export * from "../classes/CommandManager";
export * from "../classes/OldCommandManager"
export * from "../classes/ButtonManager";
export * from "../classes/ServerManager";

export * from "../classes/Player";
export * from "../classes/UnoCards";
export * from "../classes/Players";
export * from "../classes/UnoGame"

export enum CommandType {
    guild = 1,
    global,
}

export interface oldCommandData {
    name: string;
    description: string;
    category: string;
    alias: string[];
    user_permisions: PermissionResolvable[];
    bot_permisions: PermissionResolvable[];
    use: string;
    example: string;
    module: "mts" | "mpy" | "mrs";
    type: "slash" | "command";
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

export interface SuggestChannelObject {
    channel: string;
    default: boolean;
    alias?: string;
}

export interface LogsChannelsDatabaseModel {
    message_update?: string
    message_delete?: string
    message_attachment?: string
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
    imgChannel?: string;
}

export interface ClientOptions extends BaseClientOptions {
    firebaseToken?: {};
    constants?: ClientConstants;
    routes?: {
        commands?: string;
        oldCommands?: string;
        events?: string;
        buttons?: string;
    }
}

export interface ButtonOptions {
    regex: RegExp;
    name: string;
}