import { Component } from '../utils/classes.js'
import { randomId } from '../utils/utils.js'
import { Collection } from 'discord.js'
import { join } from 'path'
import fs from 'fs'
import client from '../client.js'

export class ComponentManager extends Collection<string, Component> {
    constructor(path: string) {
        super()

        try {
            for (const file of fs.readdirSync(path).filter(f => f.includes('.component.'))) {
                import('file:///' + join(path, file)).then(componentClass => {
                    const component: Component = new componentClass.default(client)
                    this.set(randomId(), component)
                })
            }
        } catch (error) {
            console.log(`${error}`)
        }
    }
}
