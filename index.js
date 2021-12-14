const admin = require("firebase-admin");
const {Bot} = require("./util/classes");

require('dotenv').config()

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.TOKEN_FIREBASE))
});

db = admin.firestore()

bot = new Bot({
    intents: [
        'DIRECT_MESSAGES',
        'GUILD_MESSAGES',
        'GUILDS',
        'GUILD_WEBHOOKS',
        'GUILD_BANS',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_VOICE_STATES'
    ],
    partials: [
        'CHANNEL'
    ]
})

bot.login(process.env.TOKEN_DISCORD)