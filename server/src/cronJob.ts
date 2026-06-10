import cron from 'node-cron';
import { prisma } from './server';
import { ItemStatus } from './types';
import { sendEmail } from './services/emailService';

export const startCronJobs = () => {
    // Roda todos os dias à meia-noite
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Verificando itens retidos...');
        try {
            // Data limite de 5 dias atrás
            const limitDate = new Date();
            limitDate.setDate(limitDate.getDate() - 5);

            const expiredItems = await prisma.item.findMany({
                where: {
                    status: ItemStatus.RESERVED,
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
                await prisma.item.update({
                    where: { id: item.id },
                    data: { status: ItemStatus.AVAILABLE }
                });

                // Cancela requests
                await prisma.donationRequest.updateMany({
                    where: { itemId: item.id, status: 'PENDING' },
                    data: { status: 'REJECTED' }
                });

                // Notifica doador
                await sendEmail(
                    item.donor.email,
                    `Reserva Expirada: ${item.title}`,
                    `A reserva do seu móvel expirou pois a retirada não foi confirmada. O móvel voltou ao catálogo público.`
                );

                // Notifica beneficiário (o primeiro, se houver)
                const beneficiaryRequest = item.requests[0];
                if (beneficiaryRequest) {
                    await sendEmail(
                        beneficiaryRequest.beneficiary.email,
                        `Prazo Vencido: ${item.title}`,
                        `A sua solicitação pelo móvel foi cancelada pois o limite de 5 dias para retirada foi atingido.`
                    );
                }
            }
            
            if (expiredItems.length > 0) {
                console.log(`[CRON] ${expiredItems.length} itens devolvidos ao catálogo.`);
            }

        } catch (error) {
            console.error('[CRON] Erro ao expirar itens:', error);
        }
    });
};
