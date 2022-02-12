import { CommandInteraction } from "discord.js";
import { Command, Client, CommandType } from "../utils/classes";

export default class Minesweeper extends Command {
    constructor(client: Client) {
        super(client, {
            name: "minesweeper",
            description: "display a minesweeper game",
            defaultPermission: true,
            type: CommandType.global,
        });
    }

    async run(interaction: CommandInteraction): Promise<any> {
        //se definen las filas, columnas y bombas
        let filas = 9,
            columnas = 9,
            bombas = 15;
        //se crea una matriz de 9x9
        var matriz = Array.from({length: filas}, () => new Array(columnas).fill(0))
        //se colocan bombas aleatoriamente
        while (bombas != 0) {
            let filaRandom = Math.floor(Math.random() * filas);
            let columnaRandom = Math.floor(Math.random() * columnas);
            //si la posicion ya tiene bomba se genera otra
            while (matriz[filaRandom][columnaRandom] == 9) {
                filaRandom = Math.floor(Math.random() * filas);
                columnaRandom = Math.floor(Math.random() * columnas);
            }
            //se añade la bomba = 9
            matriz[filaRandom][columnaRandom] = 9;
            bombas--;
        }
        //recorremos todas las casillas para colocar los mumeros
        for (let x = 0; x < filas; x++) for (let y = 0, c = 0; y < columnas; matriz[x][y] = c || 9,c=0,y++) if (matriz[x][y] != 9) for (let i = -1; i < 2;i++) for (let j = -1; j < 2; j++) if (matriz[x+i]?.[y+j] == 9) c++;
        //creamos los emojis que remplazarán los muneros
        const choices = [
            "||:zero:||",
            "||:one:||",
            "||:two:||",
            "||:three:||",
            "||:four:||",
            "||:five:||",
            "||:six:||",
            "||:seven:||",
            "||:eight:||",
            "||:bomb:||",
        ];
        //inicializamos el mensaje
        let buscaminas = "";
        //recorremos x
        for (let x = 0; x < matriz.length; buscaminas += "\n", x++) for (let y = 0; y < matriz[0].length; y++) buscaminas += `${choices[matriz[x][y]]} `
        
        //terminando el ciclo entero se envia el mensaje
        interaction.reply(buscaminas);
    }
}
