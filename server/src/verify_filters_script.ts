import { PrismaClient } from '@prisma/client';
import { Category, Condition } from './types';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting verification...');

    // 1. Create a dummy user
    const user = await prisma.user.create({
        data: {
            name: 'Test Filter User',
            email: `testfilter${Date.now()}@example.com`,
            password_hash: 'hash',
        }
    });
    console.log('Created test user:', user.id);

    try {
        // 2. Create items with different conditions
        const item1 = await prisma.item.create({
            data: {
                title: 'Item Novo',
                description: 'Description',
                category: Category.SOFA,
                condition: Condition.NOVO,
                images: '[]',
                donorId: user.id,
                status: 'AVAILABLE'
            }
        });

        const item2 = await prisma.item.create({
            data: {
                title: 'Item Bom',
                description: 'Description',
                category: Category.MESA,
                condition: Condition.BOM,
                images: '[]',
                donorId: user.id,
                status: 'AVAILABLE'
            }
        });
        console.log('Created test items');

        // 3. Test the API
        console.log('Fetching items with condition=NOVO...');
        try {
            const response = await fetch('http://localhost:3000/items?condition=NOVO');
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const data: any = await response.json();

            console.log(`Received ${data.length} items`);
            const allNovo = data.every((item: any) => item.condition === 'NOVO');
            const foundItem1 = data.find((item: any) => item.id === item1.id);
            const foundItem2 = data.find((item: any) => item.id === item2.id);

            if (allNovo && foundItem1 && !foundItem2) {
                console.log('SUCCESS: Filter correctly returned only NOVO items.');
            } else {
                console.error('FAILURE: Filter did not work as expected.');
                console.log('Data:', JSON.stringify(data, null, 2));
            }

        } catch (e) {
            console.error('API request failed. Is the server running?');
            console.error(e);
        }

    } finally {
        // Cleanup
        console.log('Cleaning up...');
        await prisma.donationRequest.deleteMany({ where: { item: { donorId: user.id } } }); // Just in case
        await prisma.item.deleteMany({ where: { donorId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.$disconnect();
    }
}

main();
