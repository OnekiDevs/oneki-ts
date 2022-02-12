import { config } from "dotenv";
config();

import { Client } from "./utils/classes";
import { join } from "path"

const client: Client = new Client({
    intents: [
        "DIRECT_MESSAGES",
        "GUILD_MESSAGES",
        "GUILDS",
        "GUILD_WEBHOOKS",
        "GUILD_BANS",
        "GUILD_MESSAGE_REACTIONS",
        "GUILD_VOICE_STATES",
    ],
    partials: ["CHANNEL"],
    firebaseToken: JSON.parse(process.env.FIREBASE_TOKEN as string),
    constants: {
        newServerLogChannel: '885674115946643458',
        imgChannel: '885674115946643456'
    },
    routes: {
        commands: join(__dirname, "commands"),
        oldCommands: join(__dirname, "oldCommands"),
        events: join(__dirname, "events"),
        buttons: join(__dirname, "buttons"),
    }
});

client.login(process.env.DISCORD_TOKEN);