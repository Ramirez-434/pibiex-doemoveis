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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        // Ignora erros de certificado SSL (comum no cPanel/Hostgator com 'mail.doemaisbr.com.br')
        rejectUnauthorized: false
    },
    connectionTimeout: 10000, // Timeout de 10s para não congelar o Frontend
    greetingTimeout: 10000,
});
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Prioridade Máxima: Resend API (Garante 100% de entrega no Gmail, imune a bloqueios de porta)
    if (process.env.RESEND_API_KEY) {
        try {
            const res = yield fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: 'DoeBrasil <onboarding@resend.dev>', // Email padrão de testes do Resend
                    to,
                    subject,
                    html
                })
            });
            const data = yield res.json();
            console.log('✅ Resend API Response:', data);
            return data;
        }
        catch (error) {
            console.error('❌ Resend API Error:', error);
            throw error;
        }
    }
    // 2. Fallback: Modo Simulação se não houver credenciais SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('===================================================');
        console.log('📧 MODO SIMULAÇÃO DE E-MAIL (Sem credenciais SMTP/Resend)');
        console.log(`Para: ${to}`);
        console.log(`Assunto: ${subject}`);
        console.log(`Conteúdo HTML: \n${html}`);
        console.log('===================================================');
        return { messageId: 'simulated-email-id' };
    }
    // 3. Fallback: Nodemailer SMTP (antigo)
    try {
        const info = yield transporter.sendMail({
            from: `"DoeBrasil" <${process.env.SMTP_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });
        console.log('✅ SMTP Message sent: %s', info.messageId);
        return info;
    }
    catch (error) {
        console.error('❌ Error sending SMTP email:', error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
