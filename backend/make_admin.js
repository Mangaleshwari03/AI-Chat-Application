import { sequelize } from './src/lib/db.js';
import User from './src/models/User.js';

(async () => {
  try {
    await sequelize.authenticate();
    
    const email = process.argv[2];
    if (!email) {
      console.error("Please provide an email address. Example: node make_admin.js test@example.com");
      process.exit(1);
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    
    console.log(`Success! User ${user.fullName} (${email}) is now an ADMIN.`);
    
  } catch(e) { 
    console.error("Error:", e.message); 
  } finally {
    process.exit(0);
  }
})();
