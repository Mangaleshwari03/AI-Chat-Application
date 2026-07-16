import { connectDB } from "./src/lib/db.js";
import Group from "./src/models/Group.js";
import User from "./src/models/User.js";
import setupAssociations from "./src/models/associations.js";
import { sendGroupMessage } from "./src/controllers/group.controller.js";

const test = async () => {
  await connectDB();
  setupAssociations();

  try {
    const groups = await Group.findAll({
      include: [{ model: User }],
    });

    groups.forEach(group => {
       console.log(`Group ID: ${group.id}, Name: ${group.name}, Users count: ${group.Users?.length}`);
    });

  } catch (error) {
    console.error("Error in test script:", error);
  }
  process.exit(0);
};

test();
