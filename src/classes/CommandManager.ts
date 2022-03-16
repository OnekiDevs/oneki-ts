import { readdirSync } from 'fs'
import { Collection, Guild } from 'discord.js'
import { Command, Client } from '../utils/classes'
import { join } from 'path'

export class CommandManager extends Collection<string, Command> {
    client: Client

    constructor(client: Client, path: string) {
        super()
        console.log('PATH DE COMMANDMANAGER:',path)
        this.client = client
        for (const file of readdirSync(path).filter((f) => f.endsWith('.command.js'))) {
            import(join(path, file)).then(command => {
                const cmd: Command = new command.default(client)
                this.set(cmd.name, cmd)
            })
        }
    }

    deploy(guild?: Guild) {
        if (process.env.DEPLOY_COMMANDS == 'true') return Promise.all(this.map((command) => command.deploy(guild)))
        else return Promise.resolve()
    }
}
