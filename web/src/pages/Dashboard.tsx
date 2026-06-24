import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PlusCircle, Package, HeartHandshake, User, LogOut, MessageCircle, Camera, Shield } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import api from '../services/api';

const Dashboard = () => {
    const location = useLocation();
    const [user, setUser] = useState(() => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr && userStr !== 'undefined' ? JSON.parse(userStr) : {};
        } catch (e) {
            localStorage.removeItem('user');
            return {};
        }
    });
    const [uploading, setUploading] = useState(false);

    const menuItems = [
        { path: '/painel/novo-item', label: 'Doar Novo Item', icon: PlusCircle },
        { path: '/painel/minhas-doacoes', label: 'Minhas Doações', icon: Package },
        { path: '/painel/solicitacoes', label: 'Minhas Solicitações', icon: HeartHandshake },
        { path: '/painel/chat', label: 'Mensagens', icon: MessageCircle },
    ];

    if (user.role === 'ADMIN' || user.email === 'mrbatista274@gmail.com') {
        menuItems.push({ path: '/admin', label: 'Painel Admin', icon: Shield });
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Compressão do Avatar
            const options = {
                maxSizeMB: 0.1, // Avatar precisa ser bem leve (~100KB)
                maxWidthOrHeight: 500,
                useWebWorker: true
            };
            file = await imageCompression(file, options);

            const formData = new FormData();
            formData.append('image', file, file.name || 'avatar.jpg');

            // 1. Upload image
            const uploadRes = await api.post('/upload', formData);
            const avatarUrl = uploadRes.data.url;

            // 2. Update profile
            await api.patch('/auth/profile', { avatar: avatarUrl });

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
        <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 md:pt-24 lg:pt-28 font-sans">
            <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-72 flex-shrink-0 animate-fade-in-up">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6 sticky top-20 md:top-24 lg:top-28">
                            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100">
                                <div className="relative group cursor-pointer flex-shrink-0">
                                    <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full overflow-hidden shadow-lg shadow-green-200 border-2 border-white">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white">
                                                <User size={24} className="sm:w-7 sm:h-7" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                        <Camera size={14} className="sm:w-4 sm:h-4" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                                    </label>
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-3 sm:h-4 w-3 sm:w-4 border-b-2 border-primary"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-hidden min-w-0">
                                    <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">{user.name}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">{user.city} - {user.state}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <div className="px-3 sm:px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Menu
                                </div>
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-2xl transition-all font-medium text-sm sm:text-base group min-h-[44px] sm:min-h-auto touch-manipulation ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-green-200 transform scale-105'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-primary hover:pl-4 sm:hover:pl-6'
                                                }`}
                                        >
                                            <Icon size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                            <span className="hidden sm:inline">{item.label}</span>
                                            <span className="sm:hidden text-xs truncate">{item.label.split(' ')[0]}</span>
                                        </Link>
                                    );
                                })}

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-2xl transition-all font-medium text-sm sm:text-base text-red-500 hover:bg-red-50 hover:pl-4 sm:hover:pl-6 mt-6 sm:mt-8 min-h-[44px] sm:min-h-auto touch-manipulation"
                                >
                                    <LogOut size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                    <span className="hidden sm:inline">Sair da Conta</span>
                                    <span className="sm:hidden text-xs">Sair</span>
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
