import {PermissionResolvable, CommandInteraction, TextChannel, GuildMember, Permissions} from 'discord.js'

export function capitalize(input: string): string {
    return input.substring(0,1).toUpperCase()+input.substring(1).toLowerCase();
}

export function permissionsError(interaction:CommandInteraction, permissions: PermissionResolvable[] | PermissionResolvable): any{
    return interaction.reply({ content: `No tiienes los permissions suficientes, necesitas \`${Array.isArray(permissions)?permissions.map(p=>p).join('`, `'):permissions.toString()}\``, ephemeral: true });
}

export function checkSend(channel: TextChannel, member: GuildMember): boolean {
    return channel.permissionsFor(member).has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL])
}