
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    // Modo simulação se não houver credenciais SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('===================================================');
        console.log('📧 MODO SIMULAÇÃO DE E-MAIL (Sem credenciais SMTP)');
        console.log(`Para: ${to}`);
        console.log(`Assunto: ${subject}`);
        console.log(`Conteúdo HTML: \n${html}`);
        console.log('===================================================');
        return { messageId: 'simulated-email-id' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"DoeBrasil" <${process.env.SMTP_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
