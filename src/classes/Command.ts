import {
    Guild,
    SlashCommandBuilder,
    AutocompleteInteraction,
    SelectMenuInteraction,
    PermissionsBitField,
    ChatInputCommandInteraction,
    Message,
    ButtonInteraction
} from 'discord.js'
import { Client, Local } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'

export class Command {
    hibrid = false
    name: string
    description: string
    local_names: Local
    local_descriptions: Local
    client: Client
    translator = Translator
    global = true
    options: CommandOptions[] = []
    dm = true
    permissions: PermissionsBitField | null = null
    regex: RegExp | null = null
    constructor(
        client: Client,
        { name, description, global = true, options = [], dm = true, permissions, hibrid = false, buttonRegex }: cmdOptions
    ) {
        this.name = name['en-US']
        this.description = description['en-US']
        this.local_names = name
        this.local_descriptions = description
        this.client = client
        this.global = global
        this.options = options
        this.dm = dm
        this.hibrid = hibrid
        if (permissions) this.permissions = permissions
        if (buttonRegex) this.regex = buttonRegex
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
                .catch(console.error)
        }
        if (guild) {
            await this.createData(guild)
            return guild.commands.create(this.data)
                .catch(e => {
                    if (e.message.includes('Missing Access')) console.log('Missing Access on', guild.name, guild.id)
                    else console.error(e)
                })
        }
        return Promise.all(
            this.client.guilds.cache.map(async guild => {
                await this.createData(guild)
                return guild.commands.create(this.data)
                    .catch(e => {
                        if (e.message.includes('Missing Access')) console.log('Missing Access on', guild.name, guild.id)
                        else console.error(e)
                    })
            })
        )
    }

    /**
     * It returns the data of the command.
     * @returns {object} The data is being returned as a JSON object.
     */
    get data() {
        let command: any = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setNameLocalizations(this.local_names)
            .setDescriptionLocalizations(this.local_descriptions)
            .toJSON()
        command.options = this.options
        if (this.global) command = { ...command, dm_permission: this.dm }
        if (this.permissions) command = { ...command, default_member_permissions: this.permissions.bitfield }
        return command
    }

    /**
     * It proces and modify the data of the command.
     * @param {Guild} [guild] - The guild to create the data for.
     */
    async createData(guild?: Guild) {}

    async interacion(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        return interaction.deferReply()
    }

    async message(message: Message<true>): Promise<any> {
        return message
    }

    async button(interacion: ButtonInteraction<'cached'>): Promise<any> {
        return interacion.deferUpdate()
    }

    async select(interacion: SelectMenuInteraction<'cached'>): Promise<any> {
        return interacion.deferUpdate()
    }

    async autocomplete(interacion: AutocompleteInteraction<'cached'>): Promise<any> {
        return interacion
    }

    /**
     * It adds an option to the command and returns the Command class.
     * @param {ApplicationCommandOption} option - The option to add to the command.
     * @returns {Command} The ApplicationCommand object
     */
    //addOption(option: ApplicationCommandOption)
    addOption(option: CommandOptions) {
        if (this.options.find(o => o.name === option.name)) {
            const i = this.options.findIndex(o => o.name === option.name)
            this.options.splice(i, 1, option)
        } else this.options.push(option)
        return this
    }

    /**
     * It clears the options array and returns the object
     * @returns {Command} The object itself.
     */
    clearOptions() {
        this.options = []
        return this
    }
}

// export interface hybrid extends Message<true>

interface cmdOptions {
    name: Local
    description: Local
    global?: boolean
    options?: CommandOptions[]
    dm?: boolean
    permissions?: PermissionsBitField
    hibrid?: boolean
    buttonRegex?: RegExp
}

export interface CommandOptions {
    name: string
    description: string
    type: number
    required?: boolean
    choices?: {
        name: string
        value: string
    }[]
    name_localizations?: Partial<Local>
    description_localizations?: Partial<Local>
    options?: CommandOptions[]
    channel_types?: number[]
    min_value?: number
    max_value?: number
    autocomplete?: boolean
}
