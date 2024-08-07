import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const skills = ['Cooking', 'Shopping', 'Gardening', 'Painting', 'Fishing', 'Knitting', 'Woodworking', 'Photography'];
const locations = ['Clementi', 'Yew Tee', 'Ang Mo Kio', 'Tampines', 'Bukit Batok', 'Jurong East', 'Woodlands', 'Bedok'];

async function main() {
  
  const volunteers = [];
  for (let i = 0; i < 10; i++) {
    const hashedPassword = await bcrypt.hash(`password123`, 10);
    
    const randomSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 3);
    const randomLocations = locations.sort(() => 0.5 - Math.random()).slice(0, 1);

    const volunteer = prisma.user.create({
      data: {
        email: `volunteer${i}@example.com`,
        username: `volunteer${i}`,
        password: hashedPassword,
        profile: {
          create: {
            name: `Volunteer ${i}`,
            role: Role.VOLUNTEER,
            age: 25 + i,
            address: `${randomLocations}`,
            skills: randomSkills,
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
            name: `Elder ${i}`,
            role: Role.ELDER,
            age: 65 + i,
            address: `${randomLocations}`,
            skills: randomSkills,
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
