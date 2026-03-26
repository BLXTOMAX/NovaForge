import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

const app = express();
app.use(cors());
app.use(express.json());

const {
  PORT = 3001,
  DISCORD_BOT_TOKEN,
  DISCORD_GUILD_ID,
  DISCORD_LOG_CHANNEL_ID,
} = process.env;

/* ================= IDs FIXES ================= */

const STAFF_ROLE_ID = "1484300777894973584";
const VERIFIED_ROLE_ID = "1484595349703364739";
const RULES_CHANNEL_ID = "1484300877316755626";

const TICKET_CATEGORIES = {
  buy: {
    label: "Acheter",
    emoji: "🛒",
    categoryId: "1484300828847247410",
    prefix: "achat",
    description:
      "Bienvenue dans ton ticket d’achat.\nDécris ce que tu veux commander, ton budget et les détails utiles pour qu’on te réponde rapidement.",
  },
  help: {
    label: "Aide",
    emoji: "🛠️",
    categoryId: "1484300830919098581",
    prefix: "aide",
    description:
      "Bienvenue dans ton ticket d’aide.\nExplique clairement ton problème ou ta question, et le staff t’aidera au plus vite.",
  },
  finalize: {
    label: "Finalisez la commande",
    emoji: "💳",
    categoryId: "1484300834643775488",
    prefix: "finalisation",
    description:
      "Bienvenue dans ton ticket de finalisation.\nEnvoie ici les infos utiles pour terminer la commande, ainsi que ta capture de paiement si besoin.",
  },
};

if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
  console.error("Variables .env manquantes.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

/* ================= HELPERS ================= */

function sanitizeChannelName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function isStaff(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

function buildTicketButtons({ claimedBy = null, closed = false } = {}) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("claim_ticket")
      .setLabel(claimedBy ? `Pris par ${claimedBy}` : "Prendre en charge")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(Boolean(claimedBy) || closed),
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel(closed ? "Ticket fermé" : "Fermer ticket")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(closed),
    new ButtonBuilder()
      .setCustomId("delete_ticket")
      .setLabel("Supprimer ticket")
      .setStyle(ButtonStyle.Danger)
  );
}

function buildPanelSelectRow() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ticket_type_select")
      .setPlaceholder("Choisis le type de ticket")
      .addOptions([
        {
          label: TICKET_CATEGORIES.buy.label,
          description: "Pour acheter une prestation",
          value: "buy",
          emoji: TICKET_CATEGORIES.buy.emoji,
        },
        {
          label: TICKET_CATEGORIES.help.label,
          description: "Pour demander de l’aide",
          value: "help",
          emoji: TICKET_CATEGORIES.help.emoji,
        },
        {
          label: TICKET_CATEGORIES.finalize.label,
          description: "Pour terminer une commande",
          value: "finalize",
          emoji: TICKET_CATEGORIES.finalize.emoji,
        },
      ])
  );
}

function buildRulesButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("accept_rules")
      .setLabel("J’accepte le règlement")
      .setStyle(ButtonStyle.Success)
  );
}

async function sendLog(guild, embed) {
  if (!DISCORD_LOG_CHANNEL_ID) return;

  try {
    const logChannel = await guild.channels.fetch(DISCORD_LOG_CHANNEL_ID);
    if (!logChannel || !logChannel.isTextBased()) return;
    await logChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Erreur log channel :", err);
  }
}

async function createPrivateTicket({
  guild,
  user,
  typeKey,
  reason = "Nouveau ticket",
  orderData = null,
}) {
  const type = TICKET_CATEGORIES[typeKey];
  if (!type) throw new Error("Type de ticket invalide");

  const channelNameBase = orderData?.ref
    ? `${type.prefix}-${sanitizeChannelName(orderData.ref)}`
    : `${type.prefix}-${sanitizeChannelName(user.username)}`;

  const channel = await guild.channels.create({
    name: channelNameBase,
    type: ChannelType.GuildText,
    parent: type.categoryId,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: STAFF_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  const openEmbed = new EmbedBuilder()
    .setTitle(`${type.emoji} Ticket ${type.label}`)
    .setDescription(type.description)
    .setColor(0x00e5ff)
    .setFooter({ text: "NovaForge Tickets" })
    .setTimestamp();

  if (orderData) {
    openEmbed.addFields(
      { name: "📦 Pack", value: String(orderData.pack), inline: true },
      { name: "💳 Paiement", value: String(orderData.method), inline: true },
      { name: "📧 Email", value: String(orderData.email) },
      { name: "🔑 Référence", value: String(orderData.ref) }
    );
  }

  await channel.send({
    content: `<@${user.id}> <@&${STAFF_ROLE_ID}>`,
    embeds: [openEmbed],
    components: [buildTicketButtons()],
  });

  const logEmbed = new EmbedBuilder()
    .setTitle("🟢 Ticket créé")
    .setColor(0x57f287)
    .addFields(
      { name: "Type", value: type.label, inline: true },
      { name: "Salon", value: `<#${channel.id}>`, inline: true },
      { name: "Utilisateur", value: `<@${user.id}>`, inline: true },
      { name: "Raison", value: reason }
    )
    .setTimestamp();

  await sendLog(guild, logEmbed);

  return channel;
}

async function sendRulesPanel(guild) {
  const channel = await guild.channels.fetch(RULES_CHANNEL_ID);
  if (!channel || !channel.isTextBased()) {
    throw new Error("Salon règlement introuvable ou non textuel");
  }

  const embed = new EmbedBuilder()
    .setTitle("📜 Règlement NovaForge")
    .setDescription(
      [
        "Merci de lire et respecter ce règlement avant d’accéder au serveur.",
        "",
        "**1. Respect**",
        "• Aucun manque de respect, harcèlement, insulte ou toxicité.",
        "• Pas de spam, flood, pub ou troll inutile.",
        "",
        "**2. Commandes & paiements**",
        "• Toute commande se fait uniquement via le site officiel ou un ticket.",
        "• N’effectue aucun paiement sur un autre compte que celui communiqué officiellement.",
        "",
        "**3. Scam & sécurité**",
        "• Toute tentative d’arnaque, usurpation, fausse preuve de paiement ou manipulation = sanction immédiate.",
        "• Les transactions hors cadre officiel ne sont pas garanties.",
        "",
        "**4. Revente & contenu**",
        "• Interdiction de revendre, leak ou redistribuer nos créations sans autorisation.",
        "",
        "**5. Litiges**",
        "• Tout litige passe uniquement par ticket.",
        "• Le staff garde le dernier mot en cas d’abus ou de comportement suspect.",
        "",
        "En cliquant sur **J’accepte le règlement**, tu confirmes accepter ces règles."
      ].join("\n")
    )
    .setColor(0x8b5cf6)
    .setFooter({ text: "NovaForge • Accès au serveur" })
    .setTimestamp();

  await channel.send({
    embeds: [embed],
    components: [buildRulesButtonRow()],
  });
}

/* ================= READY + SLASH COMMANDS ================= */

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Bot connecté en tant que ${readyClient.user.tag}`);

  try {
    const commands = [
      new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Envoie le panel de tickets"),
      new SlashCommandBuilder()
        .setName("reglement")
        .setDescription("Envoie le panel du règlement"),
    ].map((command) => command.toJSON());

    const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(readyClient.user.id, DISCORD_GUILD_ID),
      { body: commands }
    );

    console.log("Commandes /panel et /reglement enregistrées");
  } catch (error) {
    console.error("Erreur enregistrement slash commands :", error);
  }
});

/* ================= INTERACTIONS ================= */

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "panel") {
        const embed = new EmbedBuilder()
          .setTitle("🎟️ Support NovaForge")
          .setDescription(
            [
              "Choisis le type de ticket dans le menu ci-dessous.",
              "",
              "• **Acheter** → pour commander une prestation",
              "• **Aide** → pour poser une question ou signaler un souci",
              "• **Finalisez la commande** → pour terminer une commande en cours",
            ].join("\n")
          )
          .setColor(0x00e5ff)
          .setFooter({ text: "NovaForge Tickets" });

        await interaction.reply({
          embeds: [embed],
          components: [buildPanelSelectRow()],
        });

        return;
      }

      if (interaction.commandName === "reglement") {
        await sendRulesPanel(interaction.guild);
        await interaction.reply({
          content: `✅ Le règlement a été envoyé dans <#${RULES_CHANNEL_ID}>.`,
          ephemeral: true,
        });
        return;
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId !== "ticket_type_select") return;
      if (!interaction.guild) return;

      const typeKey = interaction.values[0];
      const type = TICKET_CATEGORIES[typeKey];

      if (!type) {
        return interaction.reply({
          content: "Type de ticket invalide.",
          ephemeral: true,
        });
      }

      const existing = interaction.guild.channels.cache.find(
        (c) =>
          c.parentId === type.categoryId &&
          c.name === `${type.prefix}-${sanitizeChannelName(interaction.user.username)}`
      );

      if (existing) {
        return interaction.reply({
          content: `Tu as déjà un ticket ouvert ici : <#${existing.id}>`,
          ephemeral: true,
        });
      }

      const channel = await createPrivateTicket({
        guild: interaction.guild,
        user: interaction.user,
        typeKey,
        reason: `Ouverture depuis le panel (${type.label})`,
      });

      return interaction.reply({
        content: `✅ Ticket créé : <#${channel.id}>`,
        ephemeral: true,
      });
    }

    if (interaction.isButton()) {
      if (!interaction.guild) return;

      if (interaction.customId === "accept_rules") {
        const member = await interaction.guild.members.fetch(interaction.user.id);

        if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
          return interaction.reply({
            content: "✅ Tu as déjà accepté le règlement.",
            ephemeral: true,
          });
        }

        await member.roles.add(VERIFIED_ROLE_ID);

        const logEmbed = new EmbedBuilder()
          .setTitle("✅ Règlement accepté")
          .setColor(0x57f287)
          .addFields({
            name: "Membre",
            value: `<@${interaction.user.id}>`,
            inline: true,
          })
          .setTimestamp();

        await sendLog(interaction.guild, logEmbed);

        return interaction.reply({
          content: "✅ Merci, tu as désormais accès au serveur.",
          ephemeral: true,
        });
      }

      if (!interaction.channel) return;

      if (interaction.customId === "claim_ticket") {
        const member = await interaction.guild.members.fetch(interaction.user.id);

        if (!isStaff(member)) {
          return interaction.reply({
            content: "Seul le staff peut prendre en charge un ticket.",
            ephemeral: true,
          });
        }

        const messages = await interaction.channel.messages.fetch({ limit: 10 });
        const botMessage = messages.find(
          (m) => m.author.id === client.user.id && m.components?.length > 0
        );

        if (botMessage) {
          await botMessage.edit({
            components: [
              buildTicketButtons({
                claimedBy: interaction.user.username,
                closed: false,
              }),
            ],
          });
        }

        await interaction.reply({
          content: `✅ Ticket pris en charge par <@${interaction.user.id}>.`,
        });

        const logEmbed = new EmbedBuilder()
          .setTitle("🔵 Ticket pris en charge")
          .setColor(0x5865f2)
          .addFields(
            {
              name: "Salon",
              value: `${interaction.channel.name}`,
              inline: true,
            },
            {
              name: "Staff",
              value: `<@${interaction.user.id}>`,
              inline: true,
            }
          )
          .setTimestamp();

        await sendLog(interaction.guild, logEmbed);
        return;
      }

      if (interaction.customId === "close_ticket") {
        const channel = interaction.channel;

        if (!channel.name.startsWith("closed-")) {
          await channel.setName(`closed-${channel.name}`.slice(0, 100));
        }

        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessage = messages.find(
          (m) => m.author.id === client.user.id && m.components?.length > 0
        );

        if (botMessage) {
          await botMessage.edit({
            components: [buildTicketButtons({ closed: true })],
          });
        }

        await interaction.reply({
          content: "🔒 Ticket fermé. Suppression automatique dans 10 secondes.",
        });

        await channel.send({
          content: `<@&${STAFF_ROLE_ID}> ticket fermé par <@${interaction.user.id}>.`,
        });

        const logEmbed = new EmbedBuilder()
          .setTitle("🟠 Ticket fermé")
          .setColor(0xfaa61a)
          .addFields(
            { name: "Salon", value: `${channel.name}`, inline: true },
            { name: "Fermé par", value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        await sendLog(interaction.guild, logEmbed);

        setTimeout(async () => {
          try {
            await channel.delete("Auto-delete après fermeture");
          } catch (err) {
            console.error("Erreur suppression auto :", err);
          }
        }, 10000);

        return;
      }

      if (interaction.customId === "delete_ticket") {
        const channel = interaction.channel;

        await interaction.reply({
          content: "🗑️ Suppression du ticket dans 3 secondes...",
        });

        const logEmbed = new EmbedBuilder()
          .setTitle("🔴 Ticket supprimé")
          .setColor(0xed4245)
          .addFields(
            { name: "Salon", value: `${channel.name}`, inline: true },
            { name: "Supprimé par", value: `<@${interaction.user.id}>`, inline: true }
          )
          .setTimestamp();

        await sendLog(interaction.guild, logEmbed);

        setTimeout(async () => {
          try {
            await channel.delete("Suppression manuelle du ticket");
          } catch (err) {
            console.error("Erreur suppression ticket :", err);
          }
        }, 3000);

        return;
      }
    }
  } catch (err) {
    console.error("Erreur interaction :", err);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Erreur lors du traitement.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Erreur lors du traitement.",
        ephemeral: true,
      });
    }
  }
});

/* ================= CHECKOUT SITE ================= */

app.post("/order", async (req, res) => {
  const { pack, email, ref, method, discordUserId } = req.body;

  if (!pack || !email || !ref || !method) {
    return res.status(400).json({
      error: "Champs manquants",
    });
  }

  try {
    const guild = await client.guilds.fetch(DISCORD_GUILD_ID);

    const user =
      discordUserId && /^\d+$/.test(String(discordUserId))
        ? await client.users.fetch(String(discordUserId))
        : await client.users.fetch(guild.ownerId);

    const channel = await createPrivateTicket({
      guild,
      user,
      typeKey: "finalize",
      reason: "Commande depuis le site",
      orderData: { pack, email, ref, method },
    });

    await channel.send({
      content:
        "Merci d’envoyer ici la capture du paiement PayPal ainsi que l’email utilisé.",
    });

    return res.json({
      success: true,
      channelId: channel.id,
      channelName: channel.name,
    });
  } catch (err) {
    console.error("Erreur création ticket commande :", err);
    return res.status(500).json({
      error: "Impossible de créer le ticket Discord",
      details: String(err),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Discord server running on ${PORT}`);
});

client.on("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.on("error", (err) => console.error("Discord client error:", err));
client.on("warn", (msg) => console.warn("Discord warn:", msg));
client.on("shardError", (err) => console.error("Shard error:", err));

console.log("TOKEN:", DISCORD_BOT_TOKEN ? "OK" : "MANQUANT");

try {
  const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);
  const me = await rest.get(Routes.user());
  console.log("Token Discord valide pour :", me.username);
} catch (err) {
  console.error("Token Discord invalide ou refusé :", err);
}

client.login(DISCORD_BOT_TOKEN)
  .then(() => console.log("Login Discord lancé"))
  .catch((err) => console.error("Erreur login Discord :", err));
