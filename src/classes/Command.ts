/* eslint-disable @typescript-eslint/no-unused-vars */
import { Guild, ChatInputCommandInteraction, ApplicationCommandDataResolvable, ApplicationCommand, PermissionsBitField, PermissionResolvable } from 'discord.js'
import { Client, CommandType } from '../utils/classes.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export class Command {
    name = 'ping'
    description = 'pong'
    defaultPermission = true
    client: Client
    options = {}
    type: CommandType = CommandType.global
    guilds: Array<string> = []
    public = true
    permissions: PermissionResolvable[] = []
    category: string

    constructor(
        client: Client,
        options: {
            name: string;
            description: string;
            defaultPermission?: boolean;
            options?: Record<string, unknown>;
            type?: CommandType;
            public?: boolean;
            guilds?: string[];
            permissions?: PermissionResolvable[];
            category: string;
        },
    ) {
        this.category = options.category
        this.client = client
        this.name = options.name
        this.description = options.description
        if (options.type) this.type = options.type
        if (typeof options.public === 'boolean') this.public = options.public
        if (options.guilds) this.guilds = options.guilds
        if (typeof options.defaultPermission === 'boolean') this.defaultPermission = options.defaultPermission
        if (options.permissions) this.permissions.push(...options.permissions)

        if (!this.defaultPermission) this.permissions.push(PermissionsBitField.Flags.Administrator)
    }

    getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        return new Promise((resolve) => resolve(this.baseCommand.toJSON() as ApplicationCommandDataResolvable))
    }

    run(interaction: ChatInputCommandInteraction) {
        interaction.reply('pong')
    }

    get baseCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDefaultPermission(this.defaultPermission)
    }

    /**
     * Despliega el comando
     * @param guild
     * @returns
     */
    async deploy(guild?: Guild): Promise<ApplicationCommand | boolean | void> {
        const needDeploy = await this.checkDeploy(guild)
        if (!needDeploy) return Promise.resolve(false)
        if (guild && this.type === CommandType.guild && (this.guilds.length === 0 || this.guilds.includes(guild.id))) {
            const cmd = await guild.commands
                .create(await this.getData(guild))
                .then((command: ApplicationCommand) => command)
                .catch((err) => console.error(err.toString(), '/' + this.name, 'in', guild.name))
            return Promise.resolve(cmd)
        } else if (this.type === CommandType.global) {
            try {
                const c = await this.client.application?.commands.create(await this.getData())
                return Promise.resolve(c as ApplicationCommand)
            } catch (error) {
                return Promise.reject(error)
            }
        } else {
            this.client.guilds.cache
                .filter((f) => this.public || this.guilds.includes(f.id))
                .map(async (guild: Guild) => {
                    const cmd = await guild.commands
                        .create(await this.getData(guild))
                        .then((command: ApplicationCommand) => command)
                        .catch((err) => console.error(err.toString(), '/' + this.name, 'in', guild.name, err.stack))
                    return Promise.resolve(cmd)
                })
        }
    }

    checkDeploy(guild?: Guild): Promise<boolean> {
        return new Promise<boolean>((resolve) => resolve(true))
    }
}
