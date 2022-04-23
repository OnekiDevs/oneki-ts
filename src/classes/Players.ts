/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Player } from './Player.js'

export class Players extends Array<Player> {

    constructor() {
        super()
    }
    
    add(player: Player) {
        this.push(player)
    }
    get(id: string){
        return this.find(p=>p.id==id)
    }
    has(id: string){
        return !!this.find(p=>p.id==id)
    }
    toString() {
        return this.map(p => `${p}`).join(', ')
    }
    get size(){
        return this.length
    }
    first() {
        return this[0]
    }
    async rotate(rigth: boolean){
        console.log(this.keys())
        if(rigth) this.push(this.shift()!)
        else this.unshift(this.pop()!)
        console.log(this.keys())
        return this
    }
} 