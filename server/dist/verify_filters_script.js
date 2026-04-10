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
const types_1 = require("./types");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting verification...');
        // 1. Create a dummy user
        const user = yield prisma.user.create({
            data: {
                name: 'Test Filter User',
                email: `testfilter${Date.now()}@example.com`,
                password_hash: 'hash',
            }
        });
        console.log('Created test user:', user.id);
        try {
            // 2. Create items with different conditions
            const item1 = yield prisma.item.create({
                data: {
                    title: 'Item Novo',
                    description: 'Description',
                    category: types_1.Category.SOFA,
                    condition: types_1.Condition.NOVO,
                    images: '[]',
                    donorId: user.id,
                    status: 'AVAILABLE'
                }
            });
            const item2 = yield prisma.item.create({
                data: {
                    title: 'Item Bom',
                    description: 'Description',
                    category: types_1.Category.MESA,
                    condition: types_1.Condition.BOM,
                    images: '[]',
                    donorId: user.id,
                    status: 'AVAILABLE'
                }
            });
            console.log('Created test items');
            // 3. Test the API
            console.log('Fetching items with condition=NOVO...');
            try {
                const response = yield fetch('http://localhost:3000/items?condition=NOVO');
                if (!response.ok) {
                    throw new Error(`API returned ${response.status}`);
                }
                const data = yield response.json();
                console.log(`Received ${data.length} items`);
                const allNovo = data.every((item) => item.condition === 'NOVO');
                const foundItem1 = data.find((item) => item.id === item1.id);
                const foundItem2 = data.find((item) => item.id === item2.id);
                if (allNovo && foundItem1 && !foundItem2) {
                    console.log('SUCCESS: Filter correctly returned only NOVO items.');
                }
                else {
                    console.error('FAILURE: Filter did not work as expected.');
                    console.log('Data:', JSON.stringify(data, null, 2));
                }
            }
            catch (e) {
                console.error('API request failed. Is the server running?');
                console.error(e);
            }
        }
        finally {
            // Cleanup
            console.log('Cleaning up...');
            yield prisma.donationRequest.deleteMany({ where: { item: { donorId: user.id } } }); // Just in case
            yield prisma.item.deleteMany({ where: { donorId: user.id } });
            yield prisma.user.delete({ where: { id: user.id } });
            yield prisma.$disconnect();
        }
    });
}
main();
