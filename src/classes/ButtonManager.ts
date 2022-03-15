import fs from 'fs'
import { Collection } from 'discord.js'
import { Button, Client } from '../utils/classes'
import { join } from 'path'

export class ButtonManager extends Collection<string, Button> {
    constructor(client: Client, path: string) {
        super()
        for (const file of fs.readdirSync(path).filter((f) => f.endsWith('.button.js'))) {
            import(join(path, file)).then(button => {

                const btn: Button = new button.default()
                this.set(btn.name, btn)
            })
        }
    }

    getName(customId: string): string | null {
        const btn = this.find((b) => b.regex.test(customId))
        return btn?.name ?? null
    }
}
