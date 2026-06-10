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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const testItems = [
    {
        title: 'Geladeira Consul 450L',
        description: 'Geladeira em perfeito estado, funcionando normalmente. Aceita propostas.',
        category: 'ELETRONICOS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Sofá 3 Lugares Cinza',
        description: 'Sofá reclinável cinza claro, ótimo estado, apenas precisa de um pequeno reparo no mecanismo.',
        category: 'MOVEIS',
        condition: 'BOM',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Bicicleta Mountain Bike',
        description: 'Bicicleta aro 29, shimano 21 velocidades, quadro em alumínio. Precisa de ajustes nas marchas.',
        category: 'ESPORTES',
        condition: 'REPARO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1605778374522-57569c4b3b1c?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Notebook Dell Inspiron',
        description: 'Notebook 15.6", Intel Core i5, 8GB RAM, SSD 256GB. Tela com pequeno arranhão, funcional.',
        category: 'ELETRONICOS',
        condition: 'BOM',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1588521426614-8900ed786e53?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Camisetas Variadas (lote com 10)',
        description: 'Lote com 10 camisetas de diferentes cores e tamanhos, praticamente novas.',
        category: 'ROUPAS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Estante de Madeira Maciça',
        description: 'Estante para livros, 5 prateleiras, madeira de boa qualidade. Excelente estado.',
        category: 'MOVEIS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Coleção de Livros (15 unidades)',
        description: 'Diversos gêneros: ficção científica, mistério, romance. Todos em excelente condição.',
        category: 'LIVROS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Kit Utensílios de Cozinha',
        description: 'Conjunto com facas, colheres, garfos, talheres diversos. Aço inoxidável.',
        category: 'UTENSÍLIOS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1578319495903-217c61ae98e3?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Micro-ondas LG 30L',
        description: 'Micro-ondas preto, 30 litros, funciona perfeitamente. Limpeza necessária.',
        category: 'ELETRONICOS',
        condition: 'BOM',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Brinquedos Educativos',
        description: 'Lego, quebra-cabeças e blocos de construção. Completos e em ótimo estado.',
        category: 'BRINQUEDOS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Escrivaninha para Home Office',
        description: 'Escrivaninha de MDF, cor tabaco, com gaveta. Ideal para trabalhar em casa.',
        category: 'MOVEIS',
        condition: 'BOM',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Impressora HP Multifuncional',
        description: 'Impressora, copiadora e scanner em um. Toner recarregado, funcionando bem.',
        category: 'ELETRONICOS',
        condition: 'BOM',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Jeans e Calças (lote com 8)',
        description: 'Diversas marcas conhecidas, tamanhos P, M e G. Praticamente novas.',
        category: 'ROUPAS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Ar Condicionado Split',
        description: 'Ar condicionado 12mil BTUs, controle remoto, geladeira com pequeno barulho.',
        category: 'ELETRONICOS',
        condition: 'REPARO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1545259741-2ea3ebfff55d?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Guitarra Acústica',
        description: 'Guitarra em madeira de boa qualidade, som excelente. Encordoamento novo.',
        category: 'ESPORTES',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Medicamentos e Suplementos',
        description: 'Diversos medicamentos e suplementos ainda com validade. Receita médica incluída.',
        category: 'SAUDE',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1587854692152-cbe660dbde36?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Cama Box Casal',
        description: 'Cama box casal com colchão de mola ensacada. Muito confortável, pouco uso.',
        category: 'MOVEIS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1540932239986-310128078ceb?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Relógio Smartwatch',
        description: 'Smartwatch com monitoramento cardíaco, bateria dura uma semana.',
        category: 'ELETRONICOS',
        condition: 'BOM',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
        ]),
    },
    {
        title: 'Pano de Obra Mistos',
        description: 'Diversos panos de obra, toalhas e tecidos para limpeza. Praticamente novos.',
        category: 'UTENSÍLIOS',
        condition: 'NOVO',
        images: JSON.stringify([
            'https://images.unsplash.com/photo-1584558618666-58dc9d3c6b0b?w=400&h=300&fit=crop',
        ]),
    },
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Criar usuário teste (doador)
            const hashedPassword = yield bcrypt_1.default.hash('password123', 10);
            const testDonor = yield prisma.user.upsert({
                where: { email: 'doador@teste.com' },
                update: {},
                create: {
                    name: 'João Doador',
                    email: 'doador@teste.com',
                    password_hash: hashedPassword,
                    phone: '(11) 99999-9999',
                    city: 'São Paulo',
                    state: 'SP',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
                },
            });
            console.log('✓ Usuário doador criado/atualizado:', testDonor.email);
            // Adicionar itens
            for (const itemData of testItems) {
                yield prisma.item.create({
                    data: {
                        title: itemData.title,
                        description: itemData.description,
                        category: itemData.category,
                        condition: itemData.condition,
                        images: itemData.images,
                        status: 'AVAILABLE',
                        donorId: testDonor.id,
                    },
                });
            }
            console.log(`✓ ${testItems.length} itens de teste adicionados com sucesso!`);
            console.log('✓ Email de teste: doador@teste.com');
            console.log('✓ Senha: password123');
        }
        catch (error) {
            console.error('Erro ao popular banco de dados:', error);
            process.exit(1);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
