import { config } from "dotenv";
config();

import { Client } from "./utils/clases";

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
    firebaseToken: JSON.parse(process.env.TOKEN_FIREBASE as string),
});

client.login(process.env.TOKEN_DISCORD);