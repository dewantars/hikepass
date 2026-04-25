const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { password: hash }
  });
  console.log('Admin password updated');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
