// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { ApplicationCommandDataResolvable, ChatInputCommandInteraction, Guild } from 'discord.js'
// import { Command, Client } from '../utils/classes.js'
// import { SlashCommandSubcommandBuilder } from '@discordjs/builders'

// export default class Config extends Command {
//     constructor(client: Client) {
//         super(client, {
//             name: {
//                 'en-US': 'config',
//                 'es-ES': 'configuracion',
//             },
//             description: {
//                 'en-US': 'Configure the bot',
//                 'es-ES': 'Configurar el bot',
//             },
//             global: false
//         })
//     }

//     async getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
//         if (!guild) return this.baseCommand.toJSON() as any
//         const server = this.client.servers.get(guild.id) ?? this.client.newServer(guild)

//         const suggestChannelsChoices = await Promise.all(
//             server.suggestChannels.map(c => ({
//                 name: c.default ? 'default' : c.alias as string,
//                 value: c.channel
//             }))
//         )

//         const logs = ['message_update', 'message_delete', 'message_attachment', 'invites', 'member_update']
//         const subcommandsLogs = logs.map(i =>
//             new SlashCommandSubcommandBuilder()
//                 .setName(i)
//                 .setDescription(`Config ${i} logs`)
//                 .addChannelOption(option =>
//                     option
//                         .setName('channel')
//                         .setDescription('Channel where the logs are send')
//                         .setRequired(true)
//                         .addChannelTypes(0)
//                 )
//         )

//         const command = this.baseCommand

//         command.addSubcommandGroup(subcommandGroup =>
//             subcommandGroup
//                 .setName('set') // group
//                 .setDescription('set configs')
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('prefix')
//                         .setDescription('Set a new unique prefix')
//                         .addStringOption(option =>
//                             option.setName('prefix').setDescription('New prefix').setRequired(true)
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('keep_roles')
//                         .setDescription('Set whether or not the bot should save a user\'s role and apply it when they join the server')
//                         .addBooleanOption(option =>
//                             option.setName('keep_roles').setDescription('Keep roles').setRequired(true)
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('suggest_channel')
//                         .setDescription('Set a unique suggest channel')
//                         .addChannelOption(option =>
//                             option
//                                 .setName('channel')
//                                 .setDescription('Channel where the suggest are sent')
//                                 .addChannelTypes(0)
//                                 .setRequired(true)
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('birthday_channel')
//                         .setDescription('Set a channel to say happy birthday to your users')
//                         .addChannelOption(option =>
//                             option
//                                 .setName('channel')
//                                 .setDescription('The channel to use')
//                                 .addChannelTypes(0)
//                                 .setRequired(true)
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('birthday_message')
//                         .setDescription('Change your happy birthday\'s announcement')
//                         .addStringOption(option =>
//                             option
//                                 .setName('message')
//                                 .setDescription('The message to use when sending the message')
//                                 .setRequired(true)
//                         )
//                 )
//         )

//         command.addSubcommandGroup(subcommandGroup =>
//             subcommandGroup
//                 .setName('add')
//                 .setDescription('add config')
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('prefix')
//                         .setDescription('Add a new prefix to the bot')
//                         .addStringOption(option =>
//                             option.setName('prefix').setDescription('A new prefix').setRequired(true)
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('suggest_channel')
//                         .setDescription('Add a new suggest channel')
//                         .addChannelOption(option =>
//                             option
//                                 .setName('channel')
//                                 .setDescription('Channel to suggest')
//                                 .setRequired(true)
//                                 .addChannelTypes(0)
//                         )
//                         .addStringOption(option =>
//                             option
//                                 .setName('alias')
//                                 .setDescription('Name to refired a suggest channel')
//                                 .setRequired(true)
//                         )
//                         .addBooleanOption(option =>
//                             option.setName('default').setDescription('Set a default suggestion channel')
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('blacklisted_word')
//                         .setDescription('Add a new blacklisted word')
//                         .addStringOption(option =>
//                             option
//                                 .setName('word')
//                                 .setDescription('The word to blacklist')
//                                 .setRequired(true)
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('no_filter_channel')
//                         .setDescription('Add a channel where the bot should not filter messages')
//                         .addChannelOption(option =>
//                             option
//                                 .setName('channel')
//                                 .setDescription('The channel to use')
//                                 .setRequired(true)
//                                 .addChannelTypes(0)
//                         )
//                 )
//         )

//         command.addSubcommandGroup(subcommandGroup =>
//             subcommandGroup
//                 .setName('remove')
//                 .setDescription('remove config')
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('prefix')
//                         .setDescription('Remove prefix')
//                         .addStringOption(option =>
//                             option
//                                 .setName('prefix')
//                                 .setDescription('Prefix to remove')
//                                 .addChoices(
//                                     ...(server?.getPrefixes(true).map(i => ({ name: i, value: i })) ?? [
//                                         { name: '>', value: '>' },
//                                         { name: '?', value: '?' }
//                                     ])
//                                 )
//                         )
//                 )
//                 .addSubcommand(subcommand => {
//                     subcommand.setName('suggest_channel').setDescription('Remove suggestion channel')
//                     if (suggestChannelsChoices && suggestChannelsChoices.length > 0)
//                         subcommand.addStringOption(option =>
//                             option
//                                 .setName('alias')
//                                 .setDescription('Alias of channel to remove')
//                                 .setRequired(true)
//                                 .addChoices(...suggestChannelsChoices)
//                         )
//                     return subcommand
//                 })
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('log')
//                         .setDescription('Remove log channel')
//                         .addStringOption(option =>
//                             option
//                                 .setName('logname')
//                                 .setDescription('Log name to remove')
//                                 .setRequired(true)
//                                 .addChoices(...logs.map(l => ({ name:l, value:l })))
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('birthday_channel')
//                         .setDescription('Remove the channel to celebrate user\'s birthdays')
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('blacklisted_word')
//                         .setDescription('Remove a blacklisted word')
//                         .addStringOption(option =>
//                             option
//                                 .setName('word')
//                                 .setDescription('The word to remove')
//                                 .setRequired(true)
//                         )
//                 )
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('no_filter_channel')
//                         .setDescription('Remove a channel where the bot should not filter messages')
//                         .addChannelOption(option =>
//                             option
//                                 .setName('channel')
//                                 .setDescription('The channel to remove')
//                                 .setRequired(true)
//                                 .addChannelTypes(0)
//                         )
//                 )
//         )

//         command.addSubcommandGroup(subcommandGroup => {
//             subcommandGroup.setName('log').setDescription('Config the logs channels')
//             for (const scl of subcommandsLogs) {
//                 subcommandGroup.addSubcommand(scl)
//             }
//             subcommandGroup.addSubcommand(subcommand =>
//                 subcommand
//                     .setName('auto')
//                     .setDescription('Configure logs automatically')
//                     .addChannelOption(option =>
//                         option.setName('category').setDescription('Category to use').addChannelTypes(4)
//                     )
//             )
//             return subcommandGroup
//         })

//         command.addSubcommandGroup(subcommandGroup =>
//             subcommandGroup
//                 .setName('export')
//                 .setDescription('Export the config file')
//                 .addSubcommand(subcommand => subcommand.setName('file').setDescription('Export the config file'))
//         )

//         command.addSubcommandGroup(subcommandGroup => {
//             subcommandGroup
//                 .setName('autoroles')
//                 .setDescription('Config the autoroles')
//                 .addSubcommand(subcommand =>
//                     subcommand
//                         .setName('create')
//                         .setDescription('Create a autorol group')
//                         .addStringOption(option => option.setName('name').setDescription('Set the name of the group').setRequired(true))
//                 )
//             if (server && server.autoroles && server.autoroles.size > 0) {
//                 subcommandGroup.addSubcommand(subcommand =>
//                     subcommand
//                         .setName('add')
//                         .setDescription('Add rol to autorol group')
//                         .addStringOption(option =>
//                             option
//                                 .setName('group')
//                                 .setDescription('The group name')
//                                 .setRequired(true)
//                                 .addChoices(...Array.from(server.autoroles.keys()).map(ar => ({ name: ar, value: ar })))
//                         )
//                         .addRoleOption(option => option.setName('rol').setDescription('Rol to add').setRequired(true))
//                 )

//                 subcommandGroup.addSubcommand(subcommand =>
//                     subcommand
//                         .setName('remove')
//                         .setDescription('Remove rol of an autorol group')
//                         .addStringOption(option =>
//                             option
//                                 .setName('group')
//                                 .setDescription('The group name')
//                                 .setRequired(true)
//                                 .addChoices(...Array.from(server.autoroles.keys()).map(ar => ({ name: ar, value: ar })))
//                         )
//                         .addRoleOption(option => option.setName('rol').setDescription('Rol to remove').setRequired(true))
//                 )

//                 subcommandGroup.addSubcommand(subcommand =>
//                     subcommand
//                         .setName('remove_group')
//                         .setDescription('Delete a autorol group')
//                         .addStringOption(option =>
//                             option
//                                 .setName('group')
//                                 .setDescription('The group name')
//                                 .setRequired(true)
//                                 .addChoices(...Array.from(server.autoroles.keys()).map(ar => ({ name: ar, value: ar })))
//                         )
//                 )

//                 subcommandGroup.addSubcommand(subcommand =>
//                     subcommand
//                         .setName('display')
//                         .setDescription('Display a autorol group')
//                         .addStringOption(option =>
//                             option
//                                 .setName('group')
//                                 .setDescription('The group name')
//                                 .setRequired(true)
//                                 .addChoices(...Array.from(server.autoroles.keys()).map(ar => ({ name: ar, value: ar })))
//                         )
//                         .addChannelOption(option => option.setName('channel').setDescription('Channel to display').addChannelTypes(0))
//                         .addStringOption(option => option.setName('message').setDescription('Message to display'))
//                 )
//             }
//             return subcommandGroup
//         })

//         command.addSubcommandGroup(subcommandGroup =>
//             subcommandGroup
//                 .setName('import')
//                 .setDescription('Import the config file')
//                 .addSubcommand(subcommand => subcommand.setName('file').setDescription('Export the config file'))
//         )

//         const cmd = command.toJSON() as any
//         const _ = cmd.options
//             .find((o: { name: string }) => o.name === 'import')
//             ?.options.find((o: { name: string }) => o.name === 'file')
//         _.options = [
//             {
//                 type: 11,
//                 name: 'json',
//                 description: 'Configuration json file',
//                 required: true
//             }
//         ]
//         return new Promise(resolve => resolve(cmd))
//     }

//     async run(interaction: ChatInputCommandInteraction) {
//         const subcommand = interaction.options.getSubcommand()
//         const subcommandGroup = interaction.options.getSubcommandGroup()
//         import(`./config/${subcommandGroup}.js`).then(scg => scg[subcommand](interaction)).catch(() => '')
//     }
// }
