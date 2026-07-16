import { sequelize } from './src/lib/db.js';
import User from './src/models/User.js';

(async () => {
  try {
    await sequelize.authenticate();
    const existing = await User.findByPk(0);
    if (!existing) {
      // In MySQL, to insert 0 into an auto_increment column, we might need to change sql_mode
      await sequelize.query("SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO'");
      await User.create({
        id: 0,
        fullName: 'Study AI Assistant',
        email: 'ai@chatify.com',
        password: 'no-password',
        profilePic: '/ai_avatar.png'
      });
      console.log('Dummy AI user created with ID 0');
    } else {
      console.log('AI user already exists');
    }
  } catch(e) { console.error(e); }
  process.exit(0);
})();
