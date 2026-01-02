const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models with database (creates tables if they don't exist)
    // Use alter: true to update existing tables with new columns
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');
    
    // Verify StudentLead table exists
    try {
      const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_leads'");
      if (results.length === 0) {
        console.log('⚠️  Warning: student_leads table not found, attempting to create...');
        const StudentLead = require('../models/StudentLead');
        await StudentLead.sync({ force: false, alter: true });
        console.log('✅ student_leads table created/verified');
      } else {
        console.log('✅ student_leads table exists');
      }
    } catch (tableError) {
      console.error('⚠️  Error checking student_leads table:', tableError.message);
      // Continue anyway - sync should have created it
    }

    // Check if admin user exists, if not create one
    const adminExists = await User.findOne({ where: { email: 'admin@gmail.com' } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
      console.log('✅ Default admin user created (admin@gmail.com / admin123)');
    } else {
      let updated = false;
      if (!adminExists.emailVerified) {
        adminExists.emailVerified = true;
        adminExists.emailVerifiedAt = new Date();
        updated = true;
      }
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        updated = true;
      }
      if (updated) {
        await adminExists.save();
        console.log('✅ Existing admin user updated/verified (admin@gmail.com)');
      }
    }

    // Also check for admin@kubera.io from QUICKSTART.md
    const kuberaAdmin = await User.findOne({ where: { email: 'admin@kubera.io' } });
    if (!kuberaAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Kubera Admin',
        email: 'admin@kubera.io',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
      console.log('✅ Default admin user created (admin@kubera.io / admin123)');
    } else {
      let updated = false;
      if (!kuberaAdmin.emailVerified) {
        kuberaAdmin.emailVerified = true;
        kuberaAdmin.emailVerifiedAt = new Date();
        updated = true;
      }
      if (kuberaAdmin.role !== 'admin') {
        kuberaAdmin.role = 'admin';
        updated = true;
      }
      if (updated) {
        await kuberaAdmin.save();
        console.log('✅ Existing admin user updated/verified (admin@kubera.io)');
      }
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@kubera.io';
    const superAdminExists = await User.findOne({ where: { email: superAdminEmail.toLowerCase() } });

    if (!superAdminExists) {
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      await User.create({
        name: 'Super Admin',
        email: superAdminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'super_admin',
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
      console.log(`✅ Super admin user created (${superAdminEmail} / ${superAdminPassword})`);
    } else {
      let updated = false;
      if (superAdminExists.role !== 'super_admin') {
        superAdminExists.role = 'super_admin';
        updated = true;
      }
      if (!superAdminExists.emailVerified) {
        superAdminExists.emailVerified = true;
        superAdminExists.emailVerifiedAt = new Date();
        updated = true;
      }
      if (updated) {
        await superAdminExists.save();
        console.log(`✅ Existing super admin user updated/verified (${superAdminEmail})`);
      }
    }

    console.log('✅ Database initialization completed.');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

module.exports = initDatabase;





