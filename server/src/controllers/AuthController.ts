import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { sendEmail } from '../services/emailService';
import { AuthRequest } from '../middleware/authMiddleware';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, city, state } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
                phone,
                city,
                state,
            },
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, SECRET_KEY, {
            expiresIn: '7d',
        });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city, state: user.state, avatar: user.avatar } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Do not reveal if user exists
            res.status(200).json({ message: 'Se o email existir, um link de recuperação será enviado.' });
            return;
        }

        // Generate token (random string)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 15 * 60000); // 15 minutes

        await prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        // Send Email
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${baseUrl}/redefinir-senha?token=${token}`;

        const html = `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Recuperação de Senha</h2>
                <p>Você solicitou a redefinição de sua senha.</p>
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #008000; color: white; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
                <p>Ou copie este link: ${resetLink}</p>
                <p>Este link expira em 1 hora.</p>
            </div>
        `;

        await sendEmail(email, 'DoeBrasil - Recuperação de Senha', html);

        res.status(200).json({ message: 'Se o email existir, um link de recuperação será enviado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao enviar email. Tente novamente mais tarde.' });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body; // Body is usually any, but let's leave it.

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            res.status(400).json({ error: 'Token inválido ou expirado.' });
            return;
        }

        const password_hash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password_hash },
        });

        // Delete used token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        console.log('DEBUG: updateProfile called');
        console.log('DEBUG: Body:', req.body);
        const userId = req.user?.userId;
        console.log('DEBUG: UserId:', userId);
        const { avatar, name, phone, city, state } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                avatar,
                name,
                phone,
                city,
                state
            }
        });

        res.json({
            message: 'Perfil atualizado!',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                city: updatedUser.city,
                state: updatedUser.state
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};
