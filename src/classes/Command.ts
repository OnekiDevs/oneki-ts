import { Guild, CommandInteraction, ApplicationCommandDataResolvable, ApplicationCommand, Permissions, PermissionResolvable } from "discord.js";
import { Client, CommandType, CommandPermissions, CommandOptions } from "../utils/classes";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";

export class Command {
    name: string = "ping";
    description: string = "pong";
    defaultPermission: boolean = true;
    client: Client;
    options?: {};
    type: CommandType = CommandType.global;
    guilds: Array<string> = [];
    public: boolean = true;
    permissions: PermissionResolvable[] = []

    constructor(client: Client, options: CommandOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        if (options.type) this.type = options.type;
        if (options.public) this.public = options.public;
        if (options.guilds) this.guilds = options.guilds;
        if (options.defaultPermission) this.defaultPermission = options.defaultPermission
        if (options.permissions) this.permissions.push(...options.permissions)

        if (!this.defaultPermission) this.permissions.push(Permissions.FLAGS.ADMINISTRATOR)
    }

    getData(guild?: Guild): ApplicationCommandDataResolvable {
        return this.baseCommand.toJSON() as ApplicationCommandDataResolvable;
    }

    run(interaction: CommandInteraction) {
        interaction.reply("pong");
    }

    get baseCommand(): SlashCommandBuilder {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDefaultPermission(this.defaultPermission);
    }

    private _deployPermission(command: ApplicationCommand): Promise<ApplicationCommand> {
        return new Promise<ApplicationCommand>((resolve, reject) => {
            if (this.public || this.defaultPermission) resolve(command);
            let permissions: Array<CommandPermissions> = [
                {
                    id: command.guild?.ownerId as string,
                    type: ApplicationCommandPermissionTypes.USER,
                    permission: true,
                },
            ];
            command.guild?.roles.cache
                .filter((f) => f.permissions.has(this.permissions))
                .map((r) =>
                    permissions.push({
                        id: r.id,
                        type: ApplicationCommandPermissionTypes.ROLE,
                        permission: true,
                    }),
                );
            command.permissions.add({ permissions });
            resolve(command);
        });
    }

    /**
     * Despliega el comando
     * @param guild
     * @returns
     */
    deploy(guild?: Guild) {
        return new Promise<ApplicationCommand | boolean>(async (resolve, reject) => {
            const needDeploy = await this.checkDeploy(guild);
            if(!needDeploy) resolve(false)
            if (guild && this.type === CommandType.guild && (this.guilds.length === 0 || this.guilds.includes(guild.id))) {
                guild.commands
                    .create(this.getData(guild))
                    .then(this._deployPermission)
                    .then((command: ApplicationCommand) => resolve(command))
                    .catch((err) => console.error(err.toString(), "/" + this.name, "in", guild.name));
            } else if (this.type === CommandType.global) {
                try {
                    const c = await this.client.application?.commands.create(this.getData());
                    resolve(c as ApplicationCommand);
                } catch (error) {
                    reject(error);
                }
            } else {
                this.client.guilds.cache
                    .filter((f) => this.public || this.guilds.includes(f.id))
                    .map((guild: Guild) => {
                        guild.commands
                            .create(this.getData(guild))
                            .then(this._deployPermission)
                            .then((command: ApplicationCommand) => resolve(command))
                            .catch((err) => console.error(err.toString(), "/" + this.name, "in", guild.name));
                    });
            }
        });
    }

    checkDeploy(guild?: Guild):Promise<boolean> {
        return new Promise<boolean>((resolve) => resolve(true))
    }
}
