import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting admin user...')
  
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@answerai.com' },
    update: {
      password: hashedPassword,
      name: 'Admin User',
    },
    create: {
      email: 'admin@answerai.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  })

  console.log('✅ Admin user created/updated successfully!')
  console.log('Email:', user.email)
  console.log('Password: admin123')
  console.log('\nYou can now login with:')
  console.log('  Email: admin@answerai.com')
  console.log('  Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




