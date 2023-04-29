const { Client, Intents } = require("discord.js");
const { readdirSync } = require("fs");
const { token, disabledCommands } = require("../config.json");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    partials: ["MESSAGE", "REACTION"],
    allowedMentions: {
        repliedUser: true
    }
});

/**
 * @typedef {Object} Command
 * @property {string} name
 * @property {(msg: import("discord.js").Message) => Promise<void>} execute
 * @property {function} [load]
 * @property {function} [unload]
 */

/** @type {Command[]} */
const commands = [
    {
        name: "sbe:reload",
        execute: async (msg) => {
            const result = loadCommands();
            if (result.length) {
                const all = result.map((e) => `⏵ ${e}`).join("\n");
                await msg.reply("Command errors:\n" + all);
                return;
            }

            await msg.reply("✅ Commands successfully reloaded.");
        }
    }
];

async function loadCommands() {
    for (const cmd of commands) {
        if (cmd.unload) {
            await cmd.unload(client);
        }
    }

    commands.splice(1);
    const files = readdirSync("./src/commands");
    const errors = [];

    for (const file of files) {
        const module = `./commands/${file.substr(0, file.length - 3)}`;
        delete require.cache[require.resolve(module)];

        try {
            /** @type {Command} */
            const command = require(module);

            if (command.load) {
                await command.load(client);
            }
            commands.push(command);
        } catch (err) {
            errors.push(file + ": " + err.message);
        }
    }

    return errors;
}

/**
 * Checks if the specified command is disabled in a guild.
 * @param {import("discord.js").Guild} guild
 * @param {string} command
 */
function isCommandDisabled(guild, command) {
    const guildId = guild.id;
    if (!Array.isArray(disabledCommands[guildId])) {
        // No commands specified for this guild
        return false;
    }

    return disabledCommands[guildId].includes(command);
}

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    const command = msg.content.split(/\s+/)[0].toLowerCase();
    const cmd = commands.find((cmd) => cmd.name == command);

    if (cmd === undefined) {
        return;
    }

    const disabled = isCommandDisabled(msg.guild, command);
    if (disabled) {
        await msg.reply("This command is not available in this server.");
        return;
    }

    try {
        await cmd.execute(msg);
    } catch (err) {
        await msg.reply("Execution failed: " + err.message);
    }
});

loadCommands().then((errors) => {
    for (const error of errors) {
        console.error(error);
    }

    console.log("Initial load complete.");
    client.login(token);
});
