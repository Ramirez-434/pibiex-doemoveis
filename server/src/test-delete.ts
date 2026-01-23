import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        // Find an item to delete (or create one)
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found');
            return;
        }

        const item = await prisma.item.create({
            data: {
                title: 'Test Item to Delete',
                description: 'Description',
                category: 'OUTROS',
                condition: 'NOVO',
                images: '[]',
                donorId: user.id
            }
        });
        console.log('Created item:', item.id);

        // Create a request for it
        await prisma.donationRequest.create({
            data: {
                itemId: item.id,
                beneficiaryId: user.id, // Self request for testing
                status: 'PENDING'
            }
        });
        console.log('Created request for item');

        // Try to delete
        console.log('Deleting requests...');
        await prisma.donationRequest.deleteMany({
            where: { itemId: item.id }
        });
        console.log('Deleted requests');

        console.log('Deleting item...');
        await prisma.item.delete({
            where: { id: item.id }
        });
        console.log('Deleted item successfully');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
