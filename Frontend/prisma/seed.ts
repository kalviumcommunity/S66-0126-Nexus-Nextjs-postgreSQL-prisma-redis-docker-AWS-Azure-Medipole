import { PrismaClient, UserRole, BloodGroup, RequestStatus } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medipole.com' },
    update: {},
    create: {
      email: 'admin@medipole.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })

  // Create Hospital
  const hospitalUser = await prisma.user.upsert({
    where: { email: 'cityhospital@example.com' },
    update: {},
    create: {
      email: 'cityhospital@example.com',
      password: hashedPassword,
      role: UserRole.HOSPITAL,
      hospitalProfile: {
        create: {
          name: 'City General Hospital',
          address: '123 Health St, Metro City',
          latitude: 12.9716,
          longitude: 77.5946,
          isVerified: true,
          inventory: {
            create: [
              { bloodGroup: BloodGroup.A_POSITIVE, units: 10 },
              { bloodGroup: BloodGroup.O_NEGATIVE, units: 5 },
              { bloodGroup: BloodGroup.B_POSITIVE, units: 8 },
            ],
          },
        },
      },
    },
  })

  const hospitalProfile = await prisma.hospitalProfile.findUnique({
    where: { userId: hospitalUser.id },
  })

  // Create Donor
  const donorUser = await prisma.user.upsert({
    where: { email: 'johndoe@example.com' },
    update: {},
    create: {
      email: 'johndoe@example.com',
      password: hashedPassword,
      role: UserRole.DONOR,
      donorProfile: {
        create: {
          bloodGroup: BloodGroup.A_POSITIVE,
          phone: '+919876543210',
          latitude: 12.9816,
          longitude: 77.6046,
        },
      },
    },
  })

  if (hospitalProfile) {
    // Create an emergency request
    await prisma.bloodRequest.create({
      data: {
        hospitalId: hospitalProfile.id,
        bloodGroup: BloodGroup.O_NEGATIVE,
        unitsRequired: 2,
        status: RequestStatus.PENDING,
        details: 'Urgent requirement for surgery.',
      },
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
