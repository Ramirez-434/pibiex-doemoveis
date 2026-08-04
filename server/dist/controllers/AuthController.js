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
exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.login = exports.googleLogin = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const emailService_1 = require("../services/emailService");
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// JWT secret (30 days token expiration)
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone, city, state } = req.body;
        const existingUser = yield server_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (existingUser.authProvider === 'GOOGLE') {
                res.status(400).json({ error: 'Esta conta foi criada com o Google. Por favor, utilize o botão Continuar com o Google.' });
                return;
            }
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const password_hash = yield bcryptjs_1.default.hash(password, 10);
        const user = yield server_1.prisma.user.create({
            data: {
                name,
                email,
                password_hash,
                phone,
                city,
                state,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, SECRET_KEY, {
            expiresIn: '30d',
        });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city, state: user.state, avatar: user.avatar }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
exports.register = register;
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        // Verifica a assinatura e expiração do token diretamente com o Google
        const ticket = yield client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ error: 'Token Google inválido.' });
            return;
        }
        const email = payload.email;
        const name = payload.name || 'Usuário Google';
        const providerId = payload.sub; // ID único do Google
        const avatar = payload.picture;
        // Procura se o e-mail já existe
        let user = yield server_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Se não existe, cria a conta blindada para o Google
            user = yield server_1.prisma.user.create({
                data: {
                    email,
                    name,
                    avatar,
                    authProvider: 'GOOGLE',
                    providerId,
                    password_hash: null, // Sem senha local
                }
            });
        }
        else {
            // Se já existe e foi criado localmente no passado (sem provedor),
            // a melhor prática de UX é atrelar a conta Google à conta existente
            if (user.authProvider === 'LOCAL' && !user.providerId) {
                user = yield server_1.prisma.user.update({
                    where: { email },
                    data: {
                        authProvider: 'GOOGLE',
                        providerId,
                        // Mantém a senha para permitir login misto caso deseje no futuro
                    }
                });
            }
        }
        // Gera o nosso próprio JWT da aplicação para manter a sessão
        const appToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, SECRET_KEY, {
            expiresIn: '30d',
        });
        res.json({ token: appToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city, state: user.state, avatar: user.avatar } });
    }
    catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Falha na autenticação com o Google.' });
    }
});
exports.googleLogin = googleLogin;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield server_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (user.authProvider === 'GOOGLE') {
            res.status(400).json({ error: 'Esta conta foi criada com o Google. Por favor, utilize o botão Continuar com o Google.' });
            return;
        }
        // TypeScript now requires us to handle null password_hash, though for LOCAL users it shouldn't be null
        if (!user.password_hash) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isValid = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, SECRET_KEY, {
            expiresIn: '30d',
        });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city, state: user.state, avatar: user.avatar } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield server_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Do not reveal if user exists
            res.status(200).json({ message: 'Se o email existir, um link de recuperação será enviado.' });
            return;
        }
        // Generate token (random string)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 15 * 60000); // 15 minutes
        yield server_1.prisma.passwordResetToken.create({
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
        // Dispara o e-mail em background (não bloqueia a resposta para o usuário)
        (0, emailService_1.sendEmail)(email, 'DoeBrasil - Recuperação de Senha', html).catch((err) => {
            console.error('Falha ao enviar e-mail em background:', err);
        });
        res.status(200).json({ message: 'Se o email existir, um link de recuperação será enviado.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao enviar email. Tente novamente mais tarde.' });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body; // Body is usually any, but let's leave it.
        const resetToken = yield server_1.prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetToken || resetToken.expiresAt < new Date()) {
            res.status(400).json({ error: 'Token inválido ou expirado.' });
            return;
        }
        const password_hash = yield bcryptjs_1.default.hash(newPassword, 10);
        yield server_1.prisma.user.update({
            where: { id: resetToken.userId },
            data: { password_hash },
        });
        // Delete used token
        yield server_1.prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });
        res.status(200).json({ message: 'Senha redefinida com sucesso!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.resetPassword = resetPassword;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('DEBUG: updateProfile called');
        console.log('DEBUG: Body:', req.body);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        console.log('DEBUG: UserId:', userId);
        const { avatar, name, phone, city, state } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const updatedUser = yield server_1.prisma.user.update({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
});
exports.updateProfile = updateProfile;
