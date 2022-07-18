import { Component, Client } from '../utils/classes.js'
import { randomId } from '../utils/utils.js'
import { Collection } from 'discord.js'
import { join } from 'path'
import fs from 'fs'

export class ComponentManager extends Collection<string, Component> {
    client: Client
    constructor(client: Client, path: string) {
        super()
        this.client = client
        try {
            for (const file of fs.readdirSync(path).filter(f => f.includes('.component.'))) {
                import('file:///' + join(path, file)).then(componentClass => {
                    const component: Component = new componentClass.default(client)
                    this.set(randomId(), component)
                })
            }
        } catch (error) {
            console.log('WARNING:', `${error}`)
        }
    }
}
