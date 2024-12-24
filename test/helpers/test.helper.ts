import { faker } from '@faker-js/faker';

export const generateTestPhone = () => `+25078${faker.string.numeric(7)}`;
export const generatePassword = () => 'Password123!';

export const createTestUser = async (prisma: PrismaService, userType: UserType = UserType.END_USER) => {
    return await prisma.user.create({
        data: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            telephone: generateTestPhone(),
            password: generatePassword(),
            userType,
        },
    });
}; 