"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Connecting to database...');
            // Find an item to delete (or create one)
            const user = yield prisma.user.findFirst();
            if (!user) {
                console.log('No user found');
                return;
            }
            const item = yield prisma.item.create({
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
            yield prisma.donationRequest.create({
                data: {
                    itemId: item.id,
                    beneficiaryId: user.id, // Self request for testing
                    status: 'PENDING'
                }
            });
            console.log('Created request for item');
            // Try to delete
            console.log('Deleting requests...');
            yield prisma.donationRequest.deleteMany({
                where: { itemId: item.id }
            });
            console.log('Deleted requests');
            console.log('Deleting item...');
            yield prisma.item.delete({
                where: { id: item.id }
            });
            console.log('Deleted item successfully');
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
