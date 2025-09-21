import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  InteractionType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import type { IStorage } from "./storage";

const DISCORD_TOKEN =
  process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN || "";

function checkAdminPermissions(interaction: any): boolean {
  return (
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ??
    false
  );
}

export function startDiscordBot(storage: IStorage) {
  if (!DISCORD_TOKEN) {
    console.warn("Discord bot token not found. Bot will not start.");
    return;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("ready", () => {
    console.log(`Discord bot logged in as ${client.user?.tag}`);
    registerSlashCommands(client);
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
      await handleSlashCommand(interaction, storage);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction, storage);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenuInteraction(interaction, storage);
    } else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction, storage);
    } else if (interaction.isChannelSelectMenu()) {
      await handleChannelSelectMenu(interaction, storage);
    } else if (interaction.isRoleSelectMenu()) {
      await handleRoleSelectMenu(interaction, storage);
    }
  });

  client.login(DISCORD_TOKEN).catch(console.error);
}

async function registerSlashCommands(client: Client) {
  const commands = [
    new SlashCommandBuilder()
      .setName("configurar")
      .setDescription("Configurar o sistema de verificação")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("verificar")
          .setDescription("Configurar as opções de verificação"),
      ),
  ];

  try {
    await client.application?.commands.set(commands);
    console.log("Slash commands registered successfully");
  } catch (error) {
    console.error("Error registering slash commands:", error);
  }
}

async function handleSlashCommand(interaction: any, storage: IStorage) {
  if (!interaction.isCommand()) return;

  if (
    interaction.commandName === "configurar" &&
    interaction.options.getSubcommand() === "verificar"
  ) {
    await handleConfigureVerification(interaction, storage);
  }
}

async function handleConfigureVerification(
  interaction: any,
  storage: IStorage,
) {
  // Additional runtime check for admin permissions
  if (!checkAdminPermissions(interaction)) {
    await interaction.reply({
      content: "Você precisa ser gurizão pra usar esse comando.",
      ephemeral: true,
    });
    return;
  }

  const serverId = interaction.guildId;
  const serverIcon = interaction.guild?.iconURL() || "";

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle("🔧 Configuração de Verificação")
    .setDescription(
      "Configure as opções de verificação para novos membros do servidor.",
    )
    .setThumbnail(serverIcon)
    .setFooter({ text: "Bot oficial da Gurizes - cpxd" })
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`config_channel_${serverId}`)
      .setLabel("Configurar Canal")
      .setEmoji("📝")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`config_role_${serverId}`)
      .setLabel("Configurar Cargo")
      .setEmoji("🏷️")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`config_embed_${serverId}`)
      .setLabel("Configurar Embed")
      .setEmoji("✏️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`config_logs_${serverId}`)
      .setLabel("Configurar Logs")
      .setEmoji("📋")
      .setStyle(ButtonStyle.Secondary),
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

async function handleButtonInteraction(interaction: any, storage: IStorage) {
  const customId = interaction.customId;
  const serverId = interaction.guildId;

  if (customId === "verify_user") {
    await handleVerifyUser(interaction, storage);
  } else if (customId.startsWith("config_")) {
    await handleConfigButton(interaction, storage, customId);
  } else if (
    customId.startsWith("approve_") ||
    customId.startsWith("reject_")
  ) {
    await handleVerificationAction(interaction, storage, customId);
  }
}

async function handleVerifyUser(interaction: any, storage: IStorage) {
  const serverId = interaction.guildId;
  const userId = interaction.user.id;

  try {
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const memberOptions = members
      .filter((member: any) => !member.user.bot && member.id !== userId)
      .first(25) // Discord select menu limit
      .map((member: any) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(member.displayName)
          .setDescription(`@${member.user.username}`)
          .setValue(member.id),
      );

    if (memberOptions.length === 0) {
      await interaction.reply({
        content:
          "Não foi possível encontrar membros disponíveis para indicação.",
        ephemeral: true,
      });
      return;
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`select_referrer_${serverId}`)
      .setPlaceholder("Selecione o membro que você conhece")
      .addOptions(memberOptions);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu,
    );

    await interaction.reply({
      content: "Selecione um membro existente que pode te indicar:",
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error handling verify user:", error);
    await interaction.reply({
      content: "Ocorreu um erro ao processar sua solicitação.",
      ephemeral: true,
    });
  }
}

async function handleSelectMenuInteraction(
  interaction: any,
  storage: IStorage,
) {
  if (interaction.customId.startsWith("select_referrer_")) {
    const serverId = interaction.guildId;
    const userId = interaction.user.id;
    const username = `${interaction.user.username}#${interaction.user.discriminator}`;
    const referrerId = interaction.values[0];
    const referrerMember = await interaction.guild.members.fetch(referrerId);
    const referrerUsername = `${referrerMember.user.username}#${referrerMember.user.discriminator}`;

    try {
      const verificationRequest = await storage.createVerificationRequest({
        serverId,
        userId,
        username,
        referrerId,
        referrerUsername,
      });

      await interaction.reply({
        content: `✅ Sua solicitação de verificação foi enviada! Você foi indicado por **${referrerUsername}**. Aguarde a aprovação de um administrador.`,
        ephemeral: true,
      });

      // Send notification to admins
      await sendAdminNotification(interaction, storage, verificationRequest);
    } catch (error) {
      console.error("Error creating verification request:", error);
      await interaction.reply({
        content: "Ocorreu um erro ao processar sua solicitação.",
        ephemeral: true,
      });
    }
  }
}

async function sendAdminNotification(
  interaction: any,
  storage: IStorage,
  request: any,
) {
  const config = await storage.getServerConfig(request.serverId);
  if (!config || !config.logsChannelId) return;

  try {
    const logsChannel = await interaction.guild.channels.fetch(
      config.logsChannelId,
    );
    if (!logsChannel) return;

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("⚠️ Nova Solicitação de Verificação")
      .addFields(
        { name: "Usuário", value: request.username, inline: true },
        { name: "Indicado por", value: request.referrerUsername, inline: true },
        {
          name: "Data de entrada",
          value: new Date().toLocaleDateString("pt-BR"),
          inline: true,
        },
        { name: "ID do usuário", value: request.userId, inline: false },
      )
      .setDescription(
        `<@${request.userId}> solicitou verificação e foi indicado por <@${request.referrerId}>`,
      )
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({ text: "Bot oficial da Gurizes - cpxd" })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`approve_${request.id}`)
        .setLabel("Aprovar")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`reject_${request.id}`)
        .setLabel("Negar")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Danger),
    );

    await logsChannel.send({
      embeds: [embed],
      components: [row],
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

async function handleVerificationAction(
  interaction: any,
  storage: IStorage,
  customId: string,
) {
  // Check admin permissions for verification actions
  if (!checkAdminPermissions(interaction)) {
    await interaction.reply({
      content:
        "❌ Você precisa ter permissões de administrador para aprovar ou rejeitar verificações.",
      ephemeral: true,
    });
    return;
  }

  const [action, requestId] = customId.split("_");
  const adminId = interaction.user.id;
  const adminUsername = `${interaction.user.username}#${interaction.user.discriminator}`;

  try {
    const status = action === "approve" ? "approved" : "rejected";
    const updated = await storage.updateVerificationRequest(requestId, {
      status,
      approvedBy: adminId,
      approvedByUsername: adminUsername,
    });

    if (!updated) {
      await interaction.reply({
        content: "Solicitação de verificação não encontrada.",
        ephemeral: true,
      });
      return;
    }

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(status === "approved" ? 0x00ff00 : 0xff0000)
      .setTitle(
        status === "approved"
          ? "✅ Verificação Aprovada"
          : "❌ Verificação Negada",
      )
      .addFields({
        name: status === "approved" ? "Aprovado por" : "Negado por",
        value: adminUsername,
        inline: true,
      });

    await interaction.update({
      embeds: [embed],
      components: [],
    });

    // Apply role if approved
    if (status === "approved") {
      await applyVerificationRole(interaction, storage, updated);
    }

    // Send DM to user
    try {
      const user = await interaction.client.users.fetch(updated.userId);
      const statusMessage =
        status === "approved"
          ? "✅ Sua verificação foi aprovada! Você agora tem acesso completo ao servidor."
          : "❌ Sua verificação foi negada. Entre em contato com a administração para mais informações.";

      await user.send(statusMessage);
    } catch (error) {
      console.log("Could not send DM to user");
    }
  } catch (error) {
    console.error("Error handling verification action:", error);
    await interaction.reply({
      content: "Ocorreu um erro ao processar a ação.",
      ephemeral: true,
    });
  }
}

async function applyVerificationRole(
  interaction: any,
  storage: IStorage,
  request: any,
) {
  const config = await storage.getServerConfig(request.serverId);
  if (!config || !config.verificationRoleId) return;

  try {
    const member = await interaction.guild.members.fetch(request.userId);
    const role = await interaction.guild.roles.fetch(config.verificationRoleId);

    if (member && role) {
      await member.roles.add(role);
    }
  } catch (error) {
    console.error("Error applying verification role:", error);
  }
}

async function handleModalSubmit(interaction: any, storage: IStorage) {
  // Check admin permissions
  if (!checkAdminPermissions(interaction)) {
    await interaction.reply({
      content:
        "❌ Você precisa ter permissões de administrador para configurar o bot.",
      ephemeral: true,
    });
    return;
  }

  const customId = interaction.customId;
  const serverId = interaction.guildId;

  if (customId === "config_embed_modal") {
    const title = interaction.fields.getTextInputValue("embed_title");
    const description =
      interaction.fields.getTextInputValue("embed_description");

    try {
      await storage.createOrUpdateServerConfig(serverId, {
        embedTitle: title,
        embedDescription: description,
      });

      await interaction.reply({
        content: `✅ Embed personalizada configurada com sucesso!\n\n**Título:** ${title}\n**Descrição:** ${description}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error updating embed config:", error);
      await interaction.reply({
        content: "❌ Erro ao salvar configuração da embed.",
        ephemeral: true,
      });
    }
  }
}

async function handleChannelSelectMenu(interaction: any, storage: IStorage) {
  // Check admin permissions
  if (!checkAdminPermissions(interaction)) {
    await interaction.reply({
      content:
        "❌ Você precisa ter permissões de administrador para configurar o bot.",
      ephemeral: true,
    });
    return;
  }

  const customId = interaction.customId;
  const serverId = interaction.guildId;
  const selectedChannelId = interaction.values[0];

  try {
    if (customId === "select_verification_channel") {
      await storage.createOrUpdateServerConfig(serverId, {
        verificationChannelId: selectedChannelId,
      });

      const channel = interaction.guild.channels.cache.get(selectedChannelId);
      await interaction.reply({
        content: `✅ Canal de verificação configurado para: ${channel}`,
        ephemeral: true,
      });

      // Send verification embed to the configured channel
      await sendVerificationEmbedToChannel(
        interaction,
        storage,
        selectedChannelId,
      );
    } else if (customId === "select_logs_channel") {
      await storage.createOrUpdateServerConfig(serverId, {
        logsChannelId: selectedChannelId,
      });

      const channel = interaction.guild.channels.cache.get(selectedChannelId);
      await interaction.reply({
        content: `✅ Canal de logs configurado para: ${channel}`,
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("Error updating channel config:", error);
    await interaction.reply({
      content: "❌ Erro ao salvar configuração de canal.",
      ephemeral: true,
    });
  }
}

async function handleRoleSelectMenu(interaction: any, storage: IStorage) {
  // Check admin permissions
  if (!checkAdminPermissions(interaction)) {
    await interaction.reply({
      content:
        "❌ Você precisa ter permissões de administrador para configurar o bot.",
      ephemeral: true,
    });
    return;
  }

  const customId = interaction.customId;
  const serverId = interaction.guildId;
  const selectedRoleId = interaction.values[0];

  if (customId === "select_verification_role") {
    try {
      await storage.createOrUpdateServerConfig(serverId, {
        verificationRoleId: selectedRoleId,
      });

      const role = interaction.guild.roles.cache.get(selectedRoleId);
      await interaction.reply({
        content: `✅ Cargo de verificação configurado para: ${role}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error updating role config:", error);
      await interaction.reply({
        content: "❌ Erro ao salvar configuração de cargo.",
        ephemeral: true,
      });
    }
  }
}

async function sendVerificationEmbedToChannel(
  interaction: any,
  storage: IStorage,
  channelId: string,
) {
  try {
    const config = await storage.getServerConfig(interaction.guildId);
    const channel = await interaction.guild.channels.fetch(channelId);

    if (!channel || !config) return;

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(config.embedTitle || "🔐 Sistema de Verificação")
      .setDescription(
        config.embedDescription ||
          "Bem-vindo ao servidor! Para ter acesso completo, você precisa ser verificado por um membro existente.",
      )
      .addFields({
        name: "Como funciona:",
        value:
          "1. Clique no botão 'Verificar' abaixo\n2. Selecione um membro que você conhece no servidor\n3. Aguarde a aprovação de um administrador\n4. Após aprovado, você receberá acesso completo!",
        inline: false,
      })
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({ text: "Bot oficial da Gurizes - cpxd" })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("verify_user")
        .setLabel("🔐 Verificar")
        .setStyle(ButtonStyle.Success),
    );

    await channel.send({
      embeds: [embed],
      components: [row],
    });
  } catch (error) {
    console.error("Error sending verification embed:", error);
  }
}

async function handleConfigButton(
  interaction: any,
  storage: IStorage,
  customId: string,
) {
  // Check admin permissions
  if (!checkAdminPermissions(interaction)) {
    await interaction.reply({
      content:
        "❌ Você precisa ter permissões de administrador para configurar o bot.",
      ephemeral: true,
    });
    return;
  }

  const configType = customId.split("_")[1];
  const serverId = interaction.guildId;

  switch (configType) {
    case "channel":
      const channelSelect = new ChannelSelectMenuBuilder()
        .setCustomId("select_verification_channel")
        .setPlaceholder("Selecione o canal de verificação")
        .setChannelTypes(ChannelType.GuildText);

      const channelRow =
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          channelSelect,
        );

      await interaction.reply({
        content:
          "📝 Selecione o canal onde será exibida a mensagem de verificação:",
        components: [channelRow],
        ephemeral: true,
      });
      break;

    case "role":
      const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId("select_verification_role")
        .setPlaceholder("Selecione o cargo de verificado");

      const roleRow =
        new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect);

      await interaction.reply({
        content:
          "🏷️ Selecione o cargo que será aplicado aos membros verificados:",
        components: [roleRow],
        ephemeral: true,
      });
      break;

    case "embed":
      const modal = new ModalBuilder()
        .setCustomId("config_embed_modal")
        .setTitle("Configurar Embed de Verificação");

      const titleInput = new TextInputBuilder()
        .setCustomId("embed_title")
        .setLabel("Título da Embed")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("🔐 Sistema de Verificação")
        .setValue("🔐 Sistema de Verificação")
        .setRequired(true)
        .setMaxLength(256);

      const descriptionInput = new TextInputBuilder()
        .setCustomId("embed_description")
        .setLabel("Descrição da Embed")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(
          "Bem-vindo ao servidor! Para ter acesso completo, você precisa ser verificado por um membro existente.",
        )
        .setValue(
          "Bem-vindo ao servidor! Para ter acesso completo, você precisa ser verificado por um membro existente.",
        )
        .setRequired(true)
        .setMaxLength(4000);

      const firstActionRow =
        new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
      const secondActionRow =
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          descriptionInput,
        );

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);
      break;

    case "logs":
      const logsChannelSelect = new ChannelSelectMenuBuilder()
        .setCustomId("select_logs_channel")
        .setPlaceholder("Selecione o canal de logs")
        .setChannelTypes(ChannelType.GuildText);

      const logsChannelRow =
        new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          logsChannelSelect,
        );

      await interaction.reply({
        content:
          "📋 Selecione o canal onde serão enviadas as notificações de verificação para os administradores:",
        components: [logsChannelRow],
        ephemeral: true,
      });
      break;

    default:
      await interaction.reply({
        content: "❌ Tipo de configuração não reconhecido.",
        ephemeral: true,
      });
  }
}
