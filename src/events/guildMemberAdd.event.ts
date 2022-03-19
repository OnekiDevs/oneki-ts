import { GuildMember, TextBasedChannel } from "discord.js";

export const name = 'guildMemberAdd'

export async function run(member: GuildMember) {
    const guild = member.guild
    const invites = await guild.invites.fetch()
    console.log(invites)
    //const inviteCounter = {}

    invites.map(invite => {
        
    })
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    const channel = guild.channels.cache.get('885674115615301650') as TextBasedChannel
    channel.send('puta madre otro test más')
}