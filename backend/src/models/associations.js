import User from "./User.js";
import Message from "./Message.js";
import Group from "./Group.js";
import GroupMember from "./GroupMember.js";
import Document from "./Document.js";
import Contact from "./Contact.js";

const setupAssociations = () => {
  // User <-> Message (Direct messages)
  User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
  User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" });
  Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

  // User <-> Group (Many-to-Many via GroupMember)
  User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId" });
  Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId" });

  // Group <-> Message
  Group.hasMany(Message, { foreignKey: "groupId", as: "messages" });
  Message.belongsTo(Group, { foreignKey: "groupId", as: "group" });

  // Group <-> Admin (User)
  Group.belongsTo(User, { foreignKey: "adminId", as: "admin" });

  // Group <-> Document
  Group.hasMany(Document, { foreignKey: "groupId", as: "documents" });
  Document.belongsTo(Group, { foreignKey: "groupId", as: "group" });
  Document.belongsTo(User, { foreignKey: "userId", as: "uploader" });

  // User <-> Contact (Self-referential Many-to-Many via Contact table)
  User.belongsToMany(User, {
    through: Contact,
    as: "contacts",
    foreignKey: "userId",
    otherKey: "contactId",
  });
};


export default setupAssociations;
