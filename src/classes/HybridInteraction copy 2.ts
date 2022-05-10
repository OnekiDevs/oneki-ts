import { Message, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Client } from "./Client";
import { Server } from "./Server";

type IF<T, U> = T extends true ? U : U | null;

interface IHybridInteraction<T extends 'message' | 'interaction'> {
    // client: Client;
    // server: Server;
    // member: GuildMember;
    base: T extends 'message' ? Message<true> 
        : T extends 'interaction' ? ChatInputCommandInteraction<'cached'>
        : Message<true> | ChatInputCommandInteraction<'cached'>
    get message(): T extends 'message' ? Message<true> : Message<true> | null;
    get interaction(): T extends 'interaction' ? ChatInputCommandInteraction<'cached'> : ChatInputCommandInteraction<'cached'> | null;
    isMessage(): this is HybridInteraction<'message'>;
    isInteraction(): this is HybridInteraction<'interaction'>;
}

export class HybridInteraction<T extends 'message' | 'interaction'> implements IHybridInteraction<T> {
    // client: Client;
    // server: Server
    base: T extends 'message' ? Message<true> 
        : T extends 'interaction' ? ChatInputCommandInteraction<'cached'>
        : Message<true> | ChatInputCommandInteraction<'cached'>

    constructor(interaction: ChatInputCommandInteraction<'cached'> | Message<true>) {
        this.base = interaction as T extends 'message' ? Message<true> 
        : T extends 'interaction' ? ChatInputCommandInteraction<'cached'>
        : Message<true> | ChatInputCommandInteraction<'cached'>
    }

    isMessage(): this is HybridInteraction<"message"> {
        return this.base instanceof Message
    }

    isInteraction(): this is HybridInteraction<"interaction"> {
        return this.base instanceof ChatInputCommandInteraction
    }

    get message(): T extends 'message' ? Message<true> : Message<true> | null {
        return this.base as Message<true>
    }

    get interaction(): T extends 'interaction' ? ChatInputCommandInteraction<'cached'> : ChatInputCommandInteraction<'cached'> | null {
        return this.base as ChatInputCommandInteraction<'cached'>
    }

    get member(): GuildMember {
        return this.base.member as GuildMember
    }

    async deferReply() {
        if (this.isMessage()) this.base.channel.sendTyping()
        else if (this.isInteraction()) this.base.deferReply()
        else return Promise.resolve()
    }

}