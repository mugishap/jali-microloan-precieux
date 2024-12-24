import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'
const prisma = new PrismaClient()
async function main() {
    const password = await hash(process.env.DEFAULT_ADMIN_PASSWORD, 10)
    const user = await prisma.user.upsert({
        where: { telephone: process.env.DEFAULT_ADMIN_TELEPHONE },
        update: {},
        create: {
            telephone: process.env.DEFAULT_ADMIN_TELEPHONE,
            firstName: 'Jali',
            lastName: 'Admin',
            password,
            userType: 'ADMIN',

        },
    })
    console.log({ user })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })