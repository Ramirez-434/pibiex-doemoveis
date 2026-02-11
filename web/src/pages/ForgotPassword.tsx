
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (error) {
            console.error(error);
            setError('Erro ao enviar email. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h2>
                    <p className="text-gray-500 text-sm">Digite seu email para receber um link de redefinição.</p>
                </div>

                {sent ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Verifique seu Email</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                            Enviamos um link para <strong>{email}</strong>. Clique nele para redefinir sua senha.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 mb-6 text-left">
                            <strong>Nota (Simulação):</strong> Como não há servidor de email real, verifique o <strong>CONSOLE DO SERVIDOR</strong> para o link.
                        </div>
                        <Link to="/login" className="text-primary font-bold hover:underline text-sm">
                            Voltar para o Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-primary outline-none transition-all"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Enviar Link <ArrowRight size={20} /></>}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-gray-500 hover:text-primary text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                                <ArrowLeft size={16} /> Voltar para o Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
