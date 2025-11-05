import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating demo user to admin role...')

  // Update demo user to have admin role
  const updatedUser = await prisma.user.update({
    where: { email: 'demo@example.com' },
    data: { role: 'ADMIN' }
  })

  console.log('Demo user updated to admin role:', updatedUser.email, updatedUser.role)
}

main()
  .catch((e) => {
    console.error('Error updating demo user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })