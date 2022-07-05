import { readdirSync } from 'fs'
import { Collection } from 'discord.js'
import { OldCommand } from '../utils/classes.js'
import { join } from 'path'
import client from '../client.js'

export class OldCommandManager extends Collection<string, OldCommand> {
    constructor(path: string) {
        super()
        for (const file of readdirSync(path).filter(f => f.includes('.oldCommand.'))) {
            import('file:///' + join(path, file)).then(command => {
                const cmd: OldCommand = new command.default(client)
                this.set(cmd.name, cmd)
            })
        }
    }

    getCommand(name: string) {
        return this.find(c => {
            return c.name === name.toLowerCase() || c.alias.includes(name.toLowerCase())
        })
    }
}
