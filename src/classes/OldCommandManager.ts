import fs from 'fs'
import { Collection } from 'discord.js'
import { OldCommand } from '../utils/classes'
import {join} from 'path'

export class OldCommandManager extends Collection<string, OldCommand> {

    constructor(path: string) {
        super()
        console.log('PATH HOLAOHLAHGOASOLOASDOASDOASDOASDOASDOASDOSAODASODASODASODASODAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:',path)
        for (const file of fs.readdirSync(path).filter((f) => f.endsWith('.oldCommand.js'))) {            
            import(join(path, file)).then(command => {
                const cmd: OldCommand = new command.default()
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
