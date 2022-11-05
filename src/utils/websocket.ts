import { sleep } from 'offdjs'
import { WebSocket } from 'ws'
import client from 'offdjs'

export default function initWebSocket() {
    let wsInterval: NodeJS.Timeout,
        wsintent = 1,
        websocket = new WebSocket('wss://oneki.up.railway.app/'),
        wsw = false,
        reconect = true
    console.log('\x1b[36m%s\x1b[0m', 'Iniciando WebSocket...')

    // websocket = new WebSocket('ws://localhost:3000')

    websocket.on('open', () => {
        console.time('WebSocket Connection')
        websocket.send(process.env.DISCORD_TOKEN as string)
        console.log('\x1b[33m%s\x1b[0m', 'Socket Conectado!!!')
        wsInterval = setInterval(() => websocket.ping(() => ''), 20_000)
        wsintent = 1
    })

    websocket.on('close', () => {
        if (!reconect) return

        console.log('ws closed event')
        console.log(`WebSocket closed, reconnecting in ${5_000 * wsintent++ + 1_000} miliseconds...`)
        clearInterval(wsInterval)
        if (!wsw) setTimeout(() => initWebSocket(), 5_000 * wsintent)
        wsw = true
    })

    websocket.on('message', (message: string) => {
        try {
            const data = JSON.parse(message)
            if (data.event === 'error') {
                reconect = false
                console.error(data.message)
                // sendError(new Error(data.message), import.meta.url)
            } else if (data.event) client.emit(data.event, data.data)
        } catch (error) {
            if ((error as Error).message.startsWith('SyntaxError')) console.error('SyntaxError on socket', message)
        }
    })

    websocket.on('error', async () => {
        if (!reconect) return

        console.log('ws error event')
        await sleep()
        if (!wsw) {
            console.log(`WebSocket closed, reconnecting in ${5_000 * wsintent++ + 2_000} miliseconds...`)
            clearInterval(wsInterval)
            setTimeout(() => initWebSocket(), 5_000 * wsintent)
            wsw = true
        }
    })

    return websocket
}
