import { Client as BaseClient } from "discord.js";
import admin from "firebase-admin";
import { CommandManager, ServerManager, ClientOptions, ClientConstants, ButtonManager } from "../utils/classes";
import { join } from "path";
import { WebSocket } from "ws";
import {readdirSync} from "fs";

export class Client extends BaseClient {
    db;
    version: string = require("../../package.json")?.version ?? "1.0.0";
    commands: CommandManager = new CommandManager(this, join(__dirname, "../commands"));
    buttons: ButtonManager = new ButtonManager(this, join(__dirname, '../commands'));
    servers: ServerManager = new ServerManager(this);
    websocket: WebSocket = new WebSocket("wss://oneki.herokuapp.com/");
    constants: ClientConstants = {}
    private _wsInterval = setInterval(()=>{},20000000)

    constructor(options: ClientOptions) {
        super(options);

        if (options.firebaseToken) {
            admin.initializeApp({
                credential: admin.credential.cert(options.firebaseToken),
            });
            this.db = admin.firestore();
        }
        if (options.constants) this.constants = options.constants;

        this.once("ready", this._onReady);

        this._initWebSocket()
        
    }

    private _initWebSocket() {
      this.websocket = new WebSocket("wss://oneki.herokuapp.com/");
        this.websocket.on("open", () => {
            console.time('WebSocket Connection')
            console.log("\x1b[33m%s\x1b[0m", "Socket Conectado!!!")
            this._wsInterval = setInterval(() => this.websocket.ping(()=>{}), 20000)
        });
        this.websocket.on("close", () => {
          clearInterval(this._wsInterval)
          console.error('Socket Cerrado!!')
          console.timeEnd('WebSocket Connection')
          console.log('Reconectando Socket ...')
          this._initWebSocket()
        });
        this.websocket.on("message", () => this._onWebSocketMessage);
        this.websocket.on("error", () => console.error);
    }

    private async _onReady() {
        this.servers.initialize().then(() => {
            console.log("\x1b[34m%s\x1b[0m", "Servidores Desplegados!!");
            this.commands.deploy().then(() => {
                console.log("\x1b[32m%s\x1b[0m", "Comandos Desplegados!!");
                this.initializeEventListener().then(() => {
                    console.log("\x1b[35m%s\x1b[0m", `Eventos Cargados!!`);
                    console.log("\x1b[31m%s\x1b[0m", `${this.user?.username} ${this.version} Listo y Atento!!!`);
                })
            });
        });
    }

    private _onWebSocketMessage(message: string): void {
        try {
            const data = JSON.parse(message);
            if (data.event) this.emit(data.event, data.data);
        } catch (error) {
            if ((error as string).startsWith("SyntaxError")) console.error("SyntaxError on socket", message);
        }
    }

    initializeEventListener() {
        return Promise.all(readdirSync(join(__dirname, '../events')).filter((f) => f.endsWith(".event.js")).map(file => {
            const event = require(join(__dirname, '../events', file));
            
            this.on(event.name, (...args) => event.run(this, ...args));
        }))
    }
}
