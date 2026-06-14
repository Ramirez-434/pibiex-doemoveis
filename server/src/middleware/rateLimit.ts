import rateLimit from 'express-rate-limit';

export const registerRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // Limite aumentado para a apresentação do PIBIEX (20 cadastros por IP)
    message: {
        error: 'Muitas tentativas de cadastro a partir deste IP. Por favor, tente novamente após 15 minutos.'
    },
    standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita os headers `X-RateLimit-*` legados
});
