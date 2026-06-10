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
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const server_1 = require("./server");
const types_1 = require("./types");
const emailService_1 = require("./services/emailService");
const startCronJobs = () => {
    // Roda todos os dias à meia-noite
    node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('[CRON] Verificando itens retidos...');
        try {
            // Data limite de 5 dias atrás
            const limitDate = new Date();
            limitDate.setDate(limitDate.getDate() - 5);
            const expiredItems = yield server_1.prisma.item.findMany({
                where: {
                    status: types_1.ItemStatus.RESERVED,
                    updatedAt: { lte: limitDate }
                },
                include: {
                    donor: true,
                    requests: {
                        where: { status: 'PENDING' },
                        include: { beneficiary: true }
                    }
                }
            });
            for (const item of expiredItems) {
                // Volta item para AVAILABLE
                yield server_1.prisma.item.update({
                    where: { id: item.id },
                    data: { status: types_1.ItemStatus.AVAILABLE }
                });
                // Cancela requests
                yield server_1.prisma.donationRequest.updateMany({
                    where: { itemId: item.id, status: 'PENDING' },
                    data: { status: 'REJECTED' }
                });
                // Notifica doador
                yield (0, emailService_1.sendEmail)(item.donor.email, `Reserva Expirada: ${item.title}`, `A reserva do seu móvel expirou pois a retirada não foi confirmada. O móvel voltou ao catálogo público.`);
                // Notifica beneficiário (o primeiro, se houver)
                const beneficiaryRequest = item.requests[0];
                if (beneficiaryRequest) {
                    yield (0, emailService_1.sendEmail)(beneficiaryRequest.beneficiary.email, `Prazo Vencido: ${item.title}`, `A sua solicitação pelo móvel foi cancelada pois o limite de 5 dias para retirada foi atingido.`);
                }
            }
            if (expiredItems.length > 0) {
                console.log(`[CRON] ${expiredItems.length} itens devolvidos ao catálogo.`);
            }
        }
        catch (error) {
            console.error('[CRON] Erro ao expirar itens:', error);
        }
    }));
};
exports.startCronJobs = startCronJobs;
