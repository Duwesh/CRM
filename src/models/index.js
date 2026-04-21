import { sequelize } from "../config/db.js";

import Firm from "./Firm.js";
import User from "./User.js";
import PasswordResetToken from "./PasswordResetToken.js";
import InviteToken from "./InviteToken.js";
import TeamMember from "./TeamMember.js";
import Client from "./Client.js";
import ClientService from "./ClientService.js";
import Contact from "./Contact.js";
import Lead from "./Lead.js";
import Engagement from "./Engagement.js";
import Task from "./Task.js";
import Deadline from "./Deadline.js";
import Invoice from "./Invoice.js";
import InvoiceSequence from "./InvoiceSequence.js";
import Interaction from "./Interaction.js";
import Reminder from "./Reminder.js";
import Document from "./Document.js";

// ============================================
// ASSOCIATIONS
// ============================================

// Firm Associations
Firm.hasMany(User, { foreignKey: "firm_id" });
User.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(TeamMember, { foreignKey: "firm_id" });
TeamMember.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(Client, { foreignKey: "firm_id" });
Client.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(Lead, { foreignKey: "firm_id" });
Lead.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(Task, { foreignKey: "firm_id" });
Task.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(Deadline, { foreignKey: "firm_id" });
Deadline.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(Invoice, { foreignKey: "firm_id" });
Invoice.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(Interaction, { foreignKey: "firm_id" });
Interaction.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(Reminder, { foreignKey: "firm_id" });
Reminder.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasMany(InviteToken, { foreignKey: "firm_id" });
InviteToken.belongsTo(Firm, { foreignKey: "firm_id" });

Firm.hasOne(InvoiceSequence, { foreignKey: "firm_id" });
InvoiceSequence.belongsTo(Firm, { foreignKey: "firm_id" });

// User Associations
User.hasOne(PasswordResetToken, { foreignKey: "user_id" });
PasswordResetToken.belongsTo(User, { foreignKey: "user_id" });

// Client Associations
Client.hasMany(Contact, { foreignKey: "client_id" });
Contact.belongsTo(Client, { foreignKey: "client_id" });

Client.hasMany(ClientService, { foreignKey: "client_id" });
ClientService.belongsTo(Client, { foreignKey: "client_id" });

Client.hasMany(Engagement, { foreignKey: "client_id" });
Engagement.belongsTo(Client, { foreignKey: "client_id" });

Client.hasMany(Task, { foreignKey: "client_id" });
Task.belongsTo(Client, { foreignKey: "client_id" });

Client.hasMany(Deadline, { foreignKey: "client_id" });
Deadline.belongsTo(Client, { foreignKey: "client_id" });

Client.hasMany(Invoice, { foreignKey: "client_id" });
Invoice.belongsTo(Client, { foreignKey: "client_id" });

Client.hasMany(Interaction, { foreignKey: "client_id" });
Interaction.belongsTo(Client, { foreignKey: "client_id" });

Client.hasMany(Reminder, { foreignKey: "client_id" });
Reminder.belongsTo(Client, { foreignKey: "client_id" });

Client.hasMany(Document, { foreignKey: "client_id" });
Document.belongsTo(Client, { foreignKey: "client_id" });

// TeamMember Associations
TeamMember.hasMany(Client, { foreignKey: "manager_id", as: "managedClients" });
Client.belongsTo(TeamMember, { foreignKey: "manager_id", as: "manager" });

TeamMember.hasMany(Engagement, {
  foreignKey: "assigned_to",
  as: "assignedEngagements",
});
Engagement.belongsTo(TeamMember, { foreignKey: "assigned_to", as: "assignee" });

TeamMember.hasMany(Task, { foreignKey: "assigned_to", as: "assignedTasks" });
Task.belongsTo(TeamMember, { foreignKey: "assigned_to", as: "assignee" });

TeamMember.hasMany(Interaction, { foreignKey: "team_member_id" });
Interaction.belongsTo(TeamMember, { foreignKey: "team_member_id" });

TeamMember.hasMany(Reminder, {
  foreignKey: "assigned_to",
  as: "assignedReminders",
});
Reminder.belongsTo(TeamMember, { foreignKey: "assigned_to", as: "assignee" });

TeamMember.hasMany(Document, { foreignKey: "uploaded_by" });
Document.belongsTo(TeamMember, { foreignKey: "uploaded_by", as: "uploader" });

// Engagement -> Tasks
Engagement.hasMany(Task, { foreignKey: "engagement_id" });
Task.belongsTo(Engagement, { foreignKey: "engagement_id" });

export {
  Firm,
  User,
  PasswordResetToken,
  InviteToken,
  TeamMember,
  Client,
  ClientService,
  Contact,
  Lead,
  Engagement,
  Task,
  Deadline,
  Invoice,
  InvoiceSequence,
  Interaction,
  Reminder,
  Document,
  sequelize,
};
