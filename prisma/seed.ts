import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const skills = ['Cooking', 'Shopping', 'Gardening', 'Painting', 'Photography', 'Knitting'];
const locations = ['Clementi', 'Yew Tee', 'Ang Mo Kio', 'Tampines', 'Bukit Batok', 'Jurong East', 'Woodlands', 'Bedok'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

async function main() {
  
  const volunteers = [];
  for (let i = 0; i < 10; i++) {
    const hashedPassword = await bcrypt.hash(`password123`, 10);
    
    const randomSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 3);
    const randomLocations = locations.sort(() => 0.5 - Math.random()).slice(0, 1);
    const randomDays = days.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 7) + 1);

    const volunteer = prisma.user.create({
      data: {
        email: `volunteer${i}@example.com`,
        username: `volunteer${i}`,
        password: hashedPassword,
        profile: {
          create: {
            firstName: `Volunteer ${i}`,
            lastName: 'Valthier',
            phoneNumber: '12345678',
            dateOfBirth: '01/01/2000',
            address: `${randomLocations}`,
            skills: randomSkills,
            role: Role.VOLUNTEER,
            availability: randomDays
          },
        },
      },
    });
    volunteers.push(volunteer);
  }

  const elders = [];
  for (let i = 0; i < 10; i++) {
    const hashedPassword = await bcrypt.hash(`password123`, 10);
    const randomSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 3);
    const randomLocations = locations.sort(() => 0.5 - Math.random()).slice(0, 1);
    const elder = prisma.user.create({
      data: {
        email: `elder${i}@example.com`,
        username: `elder${i}`,
        password: hashedPassword,
        profile: {
          create: {
            firstName: `Elder ${i}`,
            lastName: 'Evans',
            phoneNumber: '87654321',
            dateOfBirth: '01/01/1990',
            address: `${randomLocations}`,
            skills: randomSkills,
            role: Role.ELDER
          },
        },
      },
    });
    elders.push(elder);
  }

  await Promise.all(volunteers);
  await Promise.all(elders);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
