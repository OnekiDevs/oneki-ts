import { readdirSync } from 'fs'
import { Collection, Guild } from 'discord.js'
import { Command } from '../utils/classes.js'
import { join } from 'path'
import client from '../client.js'

export class CommandManager extends Collection<string, Command> {
    constructor(path: string) {
        super()

        for (const file of readdirSync(path).filter(f => f.endsWith('.command.js'))) {
            import('file:///' + join(path, file)).then(command => {
                const cmd: Command = new command.default(client)
                this.set(cmd.name, cmd)
            })
        }
    }

    deploy(guild?: Guild) {
        if (process.env.DEPLOY_COMMANDS == 'true') return Promise.all(this.map(command => command.deploy(guild)))
        else return Promise.resolve()
    }
}
