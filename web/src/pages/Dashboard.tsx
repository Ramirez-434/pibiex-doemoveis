import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PlusCircle, Package, HeartHandshake, User, LogOut, MessageCircle, Camera } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
    const location = useLocation();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [uploading, setUploading] = useState(false);

    const menuItems = [
        { path: '/painel/novo-item', label: 'Doar Novo Item', icon: PlusCircle },
        { path: '/painel/minhas-doacoes', label: 'Minhas Doações', icon: Package },
        { path: '/painel/solicitacoes', label: 'Minhas Solicitações', icon: HeartHandshake },
        { path: '/painel/chat', label: 'Mensagens', icon: MessageCircle },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            // 1. Upload image
            const uploadRes = await api.post('/upload', formData);
            const avatarUrl = uploadRes.data.url;

            // 2. Update profile
            const updateRes = await api.patch('/auth/profile', { avatar: avatarUrl });

            // 3. Update local state and storage
            const updatedUser = { ...user, avatar: avatarUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Optional: Trigger a custom event or use context to update Navbar if needed
            window.dispatchEvent(new Event('storage'));

        } catch (error: any) {
            console.error('Error updating avatar:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
                // Alert with specific message from server
                alert(`Erro: ${error.response.data.error || JSON.stringify(error.response.data)}`);
            } else {
                alert('Erro de conexão ou erro desconhecido.');
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 font-sans">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-72 flex-shrink-0 animate-fade-in-up">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-6 sticky top-28">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                <div className="relative group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-green-200 border-2 border-white">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white">
                                                <User size={28} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                        <Camera size={16} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                                    </label>
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-bold text-gray-800 text-lg truncate">{user.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{user.city} - {user.state}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Menu Principal
                                </div>
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium group ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-green-200 transform scale-105'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-primary hover:pl-6'
                                                }`}
                                        >
                                            <Icon size={20} className={`transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                                            {item.label}
                                        </Link>
                                    );
                                })}

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium text-red-500 hover:bg-red-50 hover:pl-6 mt-8"
                                >
                                    <LogOut size={20} />
                                    Sair da Conta
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 animate-fade-in-up delay-100">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
