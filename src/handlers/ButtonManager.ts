import { Button, Client } from '../utils/classes.js'
import { randomId } from '../utils/utils.js'
import { Collection } from 'discord.js'
import { join } from 'path'
import fs from 'fs'

export class ButtonManager extends Collection<string, Button> {
    client: Client
    constructor(client: Client, path: string) {
        super()
        this.client = client
        for (const file of fs.readdirSync(path).filter((f) => f.endsWith('.button.js'))) {
            import('file:///'+join(path, file)).then(button => {

                const btn: Button = new button.default(client)
                this.set(randomId(), btn)
            })
        }
    }
}
