import { Client as BaseClient } from "discord.js";
import admin from "firebase-admin";
import { CommandManager, ServerManager, ClientOptions } from "../utils/clases";
import { join } from "path";
import { WebSocket } from "ws";

export class Client extends BaseClient {
    db;
    version: string = require("../../package.json")?.version ?? "1.0.0";
    commands: CommandManager = new CommandManager(this, join(__dirname, "../commands"));
    servers: ServerManager = new ServerManager(this)
    websocket: WebSocket = new WebSocket("wss://oneki.herokuapp.com/");

    constructor(options: ClientOptions) {
        super(options);

        if (options.firebaseToken) {
            admin.initializeApp({
                credential: admin.credential.cert(options.firebaseToken),
            });
            this.db = admin.firestore();
        }

        this.once("ready", this._onReady);

        this.websocket.on("open", () => console.log("\x1b[33m%s\x1b[0m", "Socket Conectado!!!"));
        this.websocket.on("close", () => console.error("Socket Cerrado!!!"));
        this.websocket.on("message", () => this._onWebSocketMessage);
    }

    private async _onReady() {
        await this.servers.initialize();
        this.commands.deploy().then((commands) => console.log("\x1b[32m%s\x1b[0m", "Comandos Desplegados!!"));
        console.log("\x1b[31m%s\x1b[0m", `${this.user?.username} ${this.version} Listo y Atento!!!`);
    }

    private _onWebSocketMessage(message: string): void {
        try {
            const data = JSON.parse(message);
            if (data.event) this.emit(data.event, data.data);
        } catch (error) {
            if ((error as string).startsWith("SyntaxError")) console.error("SyntaxError on socket", message);
        }
    }
}
