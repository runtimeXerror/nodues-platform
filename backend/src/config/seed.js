const { User, Department } = require('../models');

const DEFAULT_DEPARTMENTS = [
  { name: 'Library', code: 'LIB', description: 'College Library' },
  { name: 'Hostel', code: 'HST', description: 'Hostel Office' },
  { name: 'Accounts', code: 'ACC', description: 'Accounts Section' },
  { name: 'Examination', code: 'EXM', description: 'Examination Section' },
  { name: 'Department HOD', code: 'HOD', description: 'Head of Department' },
];

const seedAdmin = async () => {
  const existing = await User.findOne({ where: { role: 'admin' } });
  if (!existing) {
    const email = process.env.ADMIN_EMAIL || 'admin@college.ac.in';
    const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
    await User.create({
      name: 'College Admin',
      email,
      password,
      role: 'admin',
      isApproved: true,
      isFirstLogin: false,
    });
    console.log(`✅ Admin created: ${email} / ${password}`);
    console.log('⚠️  Please change admin password immediately!');
  }

  // Seed default departments
  const deptCount = await Department.count();
  if (deptCount === 0) {
    await Department.bulkCreate(DEFAULT_DEPARTMENTS);
    console.log('✅ Default departments seeded');
  }
};

module.exports = seedAdmin;
