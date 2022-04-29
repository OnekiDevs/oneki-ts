import { Guild, SlashCommandBuilder, ApplicationCommandOption, AutocompleteInteraction, SelectMenuInteraction, PermissionsBitField, ChatInputCommandInteraction, Message, ButtonInteraction } from "discord.js";
import { Client, Local } from "../utils/classes.js";
import { Translator } from "../utils/utils";

export class Command {

    name: Local
    description: Local
    client: Client
    translator = Translator
    global = true
    options: ApplicationCommandOption[] = []
    dm = true
    permissions: PermissionsBitField | null = null
    constructor(client: Client, {name, description, global = true, options = [], dm = true, permissions}: cmdOptions) {
        this.name = name
        this.description = description
        this.client = client
        this.global = global
        this.options = options
        this.dm = dm
        if (permissions) this.permissions = permissions
    }

    /**
     * It creates a command object for the command, and then adds it to the command store
     * @param {Guild} [guild] - The guild to deploy the command to. If this is not provided, the command will be deployed to all guilds.
     * @returns A promise that resolves to an array of commands.
     */
    async deploy(guild?: Guild) {
        if (this.global) {
            await this.createData()
            return this.client.application?.commands.create(this.data)
        }
        if (guild) {
            await this.createData(guild)
            return guild.commands.create(this.data)
        }
        return Promise.all(this.client.guilds.cache.map(async guild => {
            await this.createData(guild)
            return guild.commands.create(this.data)
        }))
    }

    /**
     * It returns the data of the command.
     * @returns {object} The data is being returned as a JSON object.
     */
    get data() {
        let command: any = new SlashCommandBuilder()
            .setName(this.name["en-US"])
            .setDescription(this.description["en-US"])
            .setNameLocalizations(this.name)
            .setDescriptionLocalizations(this.description).toJSON()
        command.options = this.options
        if (this.global) command = { ...command, dm_permission: this.dm}
        if (this.permissions) command = { ...command, default_member_permissions: this.permissions.bitfield }
        return command
    }

    /**
     * It proces and modify the data of the command.
     * @param {Guild} [guild] - The guild to create the data for.
     */
    async createData(guild?: Guild) {
        
    }

    run(interaction: ChatInputCommandInteraction<'cached'>) {
        return interaction.deferReply()
    }

    interacion(interaction: ChatInputCommandInteraction<'cached'>) {
        return interaction.deferReply()
    }

    message(message: Message<true>) {
        return message
    }

    button(interacion: ButtonInteraction<'cached'>) {
        return interacion.deferUpdate()
    }

    select(interacion: SelectMenuInteraction<'cached'>) {
        return interacion.deferUpdate()
    }

    autocomplete(interacion: AutocompleteInteraction<'cached'>) {
        return interacion
    }

    /**
     * It adds an option to the command and returns the Command class.
     * @param {ApplicationCommandOption} option - The option to add to the command.
     * @returns {Client} The ApplicationCommand object
     */
    addOption(option: ApplicationCommandOption) {
        this.options.push(option)
        return this
    }
}

interface cmdOptions {
    name: Local
    description: Local
    global?: boolean
    options?: ApplicationCommandOption[]
    dm?: boolean
    permissions?: PermissionsBitField
}