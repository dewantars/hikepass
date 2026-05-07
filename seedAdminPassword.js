const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const adminPhone = '628111111111'; // "08111111111" => "628111111111"

  const adminUser = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { 
      password: hash,
      role: 'ADMIN',
      mountainId: 1 // Assign to Mountain 1 (Rinjani)
    },
    create: {
      phone: adminPhone,
      name: 'Super Admin Rinjani',
      password: hash,
      role: 'ADMIN',
      mountainId: 1
    }
  });

  console.log('Admin user created/updated:', adminUser);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
