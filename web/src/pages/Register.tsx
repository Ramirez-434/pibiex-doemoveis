import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, MapPin, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { AxiosError } from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        city: '',
        state: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem. Tente novamente.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            const error = err as AxiosError<{ error: string }>;
            setError(error.response?.data?.error || 'Falha ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-10 px-4 font-sans">
            <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse animate-scale-in">
                {/* Right Side - Image/Branding */}
                <div className="md:w-5/12 bg-secondary p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500 to-orange-800 opacity-90 z-0 animate-gradient"></div>
                    <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-300 opacity-20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-right animate-fade-in-down">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">Doe + Brasil</h1>
                        <p className="text-orange-100 font-medium">Junte-se à nossa comunidade.</p>
                    </div>

                    <div className="relative z-10 mb-12 text-right animate-fade-in-up delay-100">
                        <h2 className="text-4xl font-bold mb-6 leading-tight">Crie sua<br />conta hoje</h2>
                        <p className="text-lg text-orange-50 leading-relaxed">
                            Comece a transformar vidas doando itens ou encontre o que você precisa para o seu lar.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm text-orange-200/80 font-medium text-right">
                        © 2024 Doe + Brasil.
                    </div>
                </div>

                {/* Left Side - Form */}
                <div className="md:w-7/12 p-8 md:p-12 bg-white relative">
                    <div className="max-w-lg mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Cadastro</h2>
                            <p className="text-gray-500">Preencha seus dados para se registrar</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center border border-red-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Nome Completo</label>
                                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                        placeholder="Seu nome"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
                                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Senha</label>
                                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirmar Senha</label>
                                <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Cidade</label>
                                    <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                            placeholder="Cidade"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Estado</label>
                                    <div className="relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1">
                                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
                                            placeholder="UF"
                                            maxLength={2}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start mt-4">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        required
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-secondary/30 cursor-pointer accent-secondary"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-semibold text-gray-700 cursor-pointer">
                                        Consentimento LGPD
                                    </label>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Li e aceito os <Link to="/termos" className="text-secondary hover:underline" target="_blank">Termos de Uso</Link> e a <Link to="/privacidade" className="text-secondary hover:underline" target="_blank">Política de Privacidade</Link>, e consinto livremente com o tratamento dos meus dados pessoais (Nome, Email e Endereço) para fins de funcionamento da plataforma, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6 transform active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    <>
                                        Criar Conta <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="text-secondary font-bold hover:underline hover:text-orange-700 transition-colors">
                                    Faça Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
