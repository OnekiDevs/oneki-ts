import { ApplicationCommandDataResolvable, CommandInteraction, Guild, GuildMember, MessageEmbed } from "discord.js";
import { Command, Client, CommandType } from "../utils/classes";

export default class Activitie extends Command {
    constructor(client: Client) {
        super(client, {
            name: "info",
            description: "display info",
            defaultPermission: true,
            type: CommandType.global,
        });
    }

    async getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        return this.baseCommand
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("member")
                    .setDescription("display member info")
                    .addUserOption((option) => option.setName("member").setDescription("member to fetch")),
            )
            .toJSON() as ApplicationCommandDataResolvable;
    }

    async run(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        if (interaction.options.getSubcommand() === "member") {
            let member = (interaction.options.getMember("member") ?? interaction.member) as GuildMember;
            const user = await interaction.client.users.fetch(member.id, { force: true });
            const embed = new MessageEmbed()
                .setTitle(`${(member as GuildMember)?.displayName} info`)
                .setDescription(
                    `${member?.user.bot ? `Es Bot${user.flags?.has("VERIFIED_BOT") ? " verificado" : ""}` : ""}
            ${member?.pending ? "Miembro pendiente de verificación" : ""}
            ${user.flags?.has("HOUSE_BALANCE") ? "House Balance" : ""}
            ${user.flags?.has("HOUSE_BRILLIANCE") ? "House Brilliance" : ""}
            ${user.flags?.has("HOUSE_BRAVERY") ? "House Bravery" : ""}
            ${user.flags?.has("DISCORD_EMPLOYEE") ? "Empleado de Discord" : ""}
            ${user.flags?.has("DISCORD_CERTIFIED_MODERATOR") ? "Moderador Certificado de Discord" : ""}
            ${user.flags?.has("HYPESQUAD_EVENTS") ? "Eventos de HypeSquad" : ""}
            ${user.flags?.has("BUGHUNTER_LEVEL_1") ? "Cazador de Bugs Nivel 1" : ""}
            ${user.flags?.has("BUGHUNTER_LEVEL_2") ? "Cazador de Bugs Nivel 2" : ""}
            ${user.flags?.has("EARLY_VERIFIED_BOT_DEVELOPER") ? "Desarrollador de Bots Verificado" : ""}`,
                )
                .addField("ID", user.id, true)
                .addField("Tag", user.tag, true);
            if (member.nickname) embed.addField("Nickname", member.nickname, true);
            embed.addField("Color de Miembro", `${member.displayColor} / ${member.displayHexColor}`, true);
            if(user.accentColor) embed.addField('Color de Usuario', `${user.accentColor} / ${user.hexAccentColor}`, true)
            embed.addField('Fecha de creación', `<t:${Math.round(user.createdTimestamp/1000)}:d> <t:${Math.round(user.createdTimestamp/1000)}:R>`, true)
            .addField('Entro el', `<t:${Math.round(member.joinedTimestamp??1/1000)}:d> <t:${Math.round(member.joinedTimestamp??1/1000)}:R>`, true)
            .setColor(member.displayColor)
            .setThumbnail(member.displayAvatarURL({size:512}))
            if(user.banner) embed.setImage(user.bannerURL({dynamic:true, size:2048})??'')
            if(member.premiumSinceTimestamp) embed.addField('Boosteando desde', `<t:${Math.round(member.premiumSinceTimestamp/1000)}:R>`, true)
            embed.addField('Roles', member.roles.cache.map(r=>`${r}`).join(' '))
            let embeds = [embed, new MessageEmbed().setTitle('Avatar').setURL(member.user.displayAvatarURL({dynamic:true,size:2048})).setImage(member.user.displayAvatarURL({dynamic:true,size:2048})).setColor(member.user.accentColor??member.displayColor)]
            if (member.avatar) embeds.push(new MessageEmbed().setTitle('Avatar en Server').setURL(member.avatarURL({dynamic:true,size:2048})??'').setImage(member.avatarURL({dynamic:true,size:2048})??'').setColor(member.user.accentColor??member.displayColor))
            interaction.editReply({
                embeds: embeds
            })
        }
    }
}
