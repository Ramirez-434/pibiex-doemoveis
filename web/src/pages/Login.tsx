import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/painel');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-in">
                {/* Left Side - Image/Branding */}
                <div className="md:w-1/2 bg-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-600 to-green-900 opacity-90 z-0 animate-gradient"></div>
                    {/* Decorative Blobs */}
                    <div className="absolute -top-24 -left-24 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 opacity-20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 animate-fade-in-down">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">Doe + Brasil</h1>
                        <p className="text-green-100 font-medium">Conectando corações e lares.</p>
                    </div>

                    <div className="relative z-10 mb-12 animate-fade-in-up delay-100">
                        <h2 className="text-5xl font-bold mb-6 leading-tight">Bem-vindo<br />de volta!</h2>
                        <p className="text-lg text-green-50 leading-relaxed">
                            Acesse sua conta para gerenciar suas doações ou acompanhar o status dos seus pedidos.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm text-green-200/80 font-medium">
                        © 2024 Doe + Brasil. Todos os direitos reservados.
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
                            <p className="text-gray-500">Entre com suas credenciais para continuar</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 flex items-center justify-center gap-2 animate-shake">
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
                                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-primary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Senha</label>
                                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-primary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <Link to="/recuperar-senha" className="text-sm font-medium text-primary hover:text-green-700 transition-colors">
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        Entrar <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Não tem uma conta?{' '}
                                <Link to="/cadastro" className="text-primary font-bold hover:underline hover:text-green-700 transition-colors">
                                    Cadastre-se
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
