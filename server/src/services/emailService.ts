
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
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

export const sendEmail = async (to: string, subject: string, html: string) => {
    // 1. Prioridade Máxima: Resend API (Garante 100% de entrega no Gmail, imune a bloqueios de porta)
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch('https://api.resend.com/emails', {
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
            const data = await res.json();
            console.log('✅ Resend API Response:', data);
            return data;
        } catch (error) {
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
        const info = await transporter.sendMail({
            from: `"DoeBrasil" <${process.env.SMTP_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log('✅ SMTP Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending SMTP email:', error);
        throw error;
    }
};
