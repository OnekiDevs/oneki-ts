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

/**
 * generate a string barr progges
 * @param current the current percentage to show
 * @param length the length of the barr
 * @returns a string bar
 */
export function filledBar(current: number, length: number = 25): string{
    const progress = Math.round((length * (current / 100)));
    const emptyProgress = length - progress;
    const progressText = '█'.repeat(progress);
    const emptyProgressText = ' '.repeat(emptyProgress);
    return progressText + emptyProgressText;
};

export const pollEmojis = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹"];
