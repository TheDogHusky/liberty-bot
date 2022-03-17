const { MessageActionRow, MessageButton, Permissions } = require('discord.js');

module.exports = {
    name: "interactionCreate",
    async run(interaction, client) {
        if(!interaction.isButton()) return;

        if(interaction.customId === "unban") {
            const schema = require('../../models/guild');
            const data = await schema.findOne({ GuildID: interaction.guild.id });
            if(!data) return;
            if(!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: `I'm sorry but you don't have the permissions to use this button!`, ephemeral: true });
            const fieldValues = interaction.message.embeds[0].fields[0].value.split(" ");
            let banned = fieldValues[4];
            banned = banned.replaceAll("(", "");
            banned = banned.replaceAll(")", "");
            const savedUserObjectFromDB = data.manualBannedUsers.find(object => object.member === banned);
            /*
                The returned object:
                { member: <String ID>, reason: <String reason>, mod: <String ID> }
            **/
            if(!savedUserObjectFromDB) return interaction.reply({ content: `This user isn't banned anymore!`, ephemeral: true });
            const savedUser = await client.users.fetch(savedUserObjectFromDB.member);
            await interaction.guild.members.unban(savedUser, `Someone reacted to UNBAN button.`);
            await data.updateOne({ $pull: { manualBannedUsers: savedUserObjectFromDB } });
            interaction.reply({ content: `User ${savedUser.tag} have been unbanned!`, ephemeral: true });
            const newActionRow = new MessageActionRow().addComponents(new MessageButton().setCustomId("unban").setDisabled(true).setEmoji("💝").setLabel("Unbanned!").setStyle("DANGER"));
            interaction.message.edit({ components: [newActionRow] });
        }
    },
};