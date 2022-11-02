import { Client } from 'offdjs'

export default function (client: Client) {
    console.log(`Logged in as ${client.user.tag}!`)
}
