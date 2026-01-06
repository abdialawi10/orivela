import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@answerai.com' },
    update: {},
    create: {
      email: 'admin@answerai.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  })

  // Create default business (only create if doesn't exist)
  let business = await prisma.business.findFirst()
  
  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'Your Business',
        businessHours: JSON.stringify({
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '10:00', close: '14:00' },
          sunday: { open: null, close: null },
        }),
        services: JSON.stringify(['Consultation', 'Support', 'Sales']),
        pricingNotes: 'Contact us for detailed pricing information.',
        escalationPhone: '+1234567890',
        escalationEmail: 'admin@answerai.com',
        tone: 'friendly, professional, concise',
      },
    })
  }

  // Create sample FAQ items
  await prisma.knowledgeBaseItem.createMany({
    data: [
      {
        type: 'FAQ',
        title: 'What are your business hours?',
        question: 'What are your business hours?',
        answer: 'We are open Monday through Friday from 9 AM to 5 PM, and Saturday from 10 AM to 2 PM. We are closed on Sundays.',
      },
      {
        type: 'FAQ',
        title: 'How can I contact support?',
        question: 'How can I contact support?',
        answer: 'You can reach our support team by calling us during business hours, sending us an SMS, or emailing us. Our AI assistant can also help answer common questions.',
      },
      {
        type: 'FAQ',
        title: 'Do you offer refunds?',
        question: 'Do you offer refunds?',
        answer: 'Our refund policy depends on the specific product or service. Please contact us directly for assistance with refund requests.',
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seed data created successfully!')
  console.log('Admin user:', user.email)
  console.log('Default password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
