import { GuildMember, Invite, TextChannel } from 'discord.js'
import { Client } from '../classes/Client'

export const name = 'customGuildMemberAdd'

export async function run(member: GuildMember, type: 'normal' | 'vanity' | 'permissions' | 'unknown', invite: Invite) {
    const welcomeChannel = member.guild.channels.cache.find((ch) => ch.name === 'welcome');

    if(type === 'normal'){
        welcomeChannel.send(`Welcome ${member}! You were invited by ${invite.inviter.username}!`);
    }

    else if(type === 'vanity'){
        welcomeChannel.send(`Welcome ${member}! You joined using a custom invite!`);
    }

    else if(type === 'permissions'){
        welcomeChannel.send(`Welcome ${member}! I can't figure out how you joined because I don't have the "Manage Server" permission!`);
    }

    else if(type === 'unknown'){
        welcomeChannel.send(`Welcome ${member}! I can't figure out how you joined the server...`);
    }

}