import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
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

        const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
            expiresIn: '7d',
        });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
