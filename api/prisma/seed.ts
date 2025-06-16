import { PrismaClient, AccountType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const schoolId = "cmbx6eryh0000o4bs234dbzhi";

  const usersData = Array.from({ length: 40 }).map((_, i) => {
    const fullName = `User ${i + 1}`;
    const email = `user${i + 1}@example.com`;
    const hashedPassword = bcrypt.hashSync("password123", 10);
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=User${i + 1}`;

    return {
      fullName,
      email,
      hashedPassword,
      avatarUrl,
      isEmailVerified: true,
      provider: AccountType.DEFAULT,
    };
  });

  // ✅ Step 1: Insert users using createMany and skip duplicates
  await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true, // this prevents error if the same email already exists
  });

  // ✅ Step 2: Fetch all users with those emails to get their IDs
  const allUsers = await prisma.user.findMany({
    where: {
      email: {
        in: usersData.map((u) => u.email),
      },
    },
    select: { id: true },
  });

  // ✅ Step 3: Enroll them into the school
  await prisma.memberOnSchools.createMany({
    data: allUsers.map((user) => ({
      userId: user.id,
      schoolId,
      role: Role.STUDENT,
    })),
    skipDuplicates: true,
  });

  console.log("✅ Dummy users seeded and linked to school.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
