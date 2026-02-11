
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            console.error(error);
            setError(error.response?.data?.error || 'Erro ao redefinir senha.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Token inválido ou ausente.</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Nova Senha</h2>
                    <p className="text-gray-500 text-sm">Crie uma nova senha segura.</p>
                </div>

                {success ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Senha Alterada!</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                            Sua senha foi atualizada com sucesso. Redirecionando para o login...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirmar Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-100 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Redefinir Senha <ArrowRight size={20} /></>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
