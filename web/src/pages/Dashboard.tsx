import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Package, HeartHandshake, User, LogOut, MessageCircle, Camera, Shield, Menu, X, ChevronRight } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import api from '../services/api';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        { path: '/painel/novo-item',       label: 'Doar',        fullLabel: 'Doar Novo Item',        icon: PlusCircle },
        { path: '/painel/minhas-doacoes',  label: 'Doações',     fullLabel: 'Minhas Doações',        icon: Package },
        { path: '/painel/solicitacoes',    label: 'Pedidos',     fullLabel: 'Minhas Solicitações',   icon: HeartHandshake },
        { path: '/painel/chat',            label: 'Mensagens',   fullLabel: 'Mensagens',             icon: MessageCircle },
    ];

    const isAdmin = user.role === 'ADMIN' || user.email === 'mrbatista274@gmail.com';
    if (isAdmin) {
        menuItems.push({ path: '/admin', label: 'Admin', fullLabel: 'Painel Admin', icon: Shield });
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
            const options = { maxSizeMB: 0.1, maxWidthOrHeight: 500, useWebWorker: true };
            file = await imageCompression(file, options);
            const formData = new FormData();
            formData.append('image', file, file.name || 'avatar.jpg');
            const uploadRes = await api.post('/upload', formData);
            const avatarUrl = uploadRes.data.url;
            await api.patch('/auth/profile', { avatar: avatarUrl });
            const updatedUser = { ...user, avatar: avatarUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('storage'));
        } catch (error: any) {
            console.error('Error updating avatar:', error);
            alert(`Erro: ${error.response?.data?.error || 'Erro desconhecido'}`);
        } finally {
            setUploading(false);
        }
    };

    const avatarColors = ['from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600', 'from-pink-500 to-rose-600'];
    const avatarGradient = avatarColors[(user.name?.charCodeAt(0) ?? 0) % avatarColors.length];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden lg:flex pt-28 min-h-screen">
                <div className="container mx-auto px-4 py-8 flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="w-72 flex-shrink-0">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-28">
                            {/* User profile */}
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                <div className="relative group cursor-pointer flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg border-2 border-white">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xl font-bold`}>
                                                {user.name?.charAt(0)?.toUpperCase() ?? <User size={24} />}
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
                                <div className="overflow-hidden min-w-0">
                                    <h3 className="font-bold text-gray-800 text-base truncate capitalize">{user.name?.toLowerCase()}</h3>
                                    <p className="text-xs text-gray-500 truncate">{[user.city, user.state].filter(Boolean).join(' – ') || 'Membro da comunidade'}</p>
                                </div>
                            </div>

                            {/* Nav */}
                            <nav className="space-y-1">
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</div>
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium text-sm group ${
                                                isActive
                                                    ? 'bg-primary text-white shadow-lg shadow-green-200'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                            }`}
                                        >
                                            <Icon size={18} className="flex-shrink-0" />
                                            <span className="flex-1">{item.fullLabel}</span>
                                            {isActive && <ChevronRight size={14} className="opacity-70" />}
                                        </Link>
                                    );
                                })}

                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium text-sm text-red-500 hover:bg-red-50"
                                    >
                                        <LogOut size={18} className="flex-shrink-0" />
                                        Sair da Conta
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Desktop Main content */}
                    <main className="flex-1 animate-fade-in-up">
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* ── MOBILE LAYOUT ── */}
            <div className="lg:hidden flex flex-col min-h-screen">
                {/* Mobile top header */}
                <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                    <div className="flex items-center justify-between px-4 py-3 pt-14">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold`}>
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-gray-800 text-sm truncate capitalize leading-tight">{user.name?.toLowerCase()}</p>
                                <p className="text-xs text-gray-400 truncate leading-tight">{[user.city, user.state].filter(Boolean).join(' – ') || 'Painel'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </header>

                {/* Mobile main content */}
                <main className="flex-1 pt-28 pb-24 px-3">
                    <Outlet />
                </main>

                {/* ── Bottom Tab Bar ── */}
                <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                    <div className="flex items-center justify-around px-2 pt-2 pb-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all min-w-[56px] touch-manipulation ${
                                        isActive ? 'text-primary' : 'text-gray-400'
                                    }`}
                                >
                                    <div className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all ${
                                        isActive ? 'bg-primary/10' : ''
                                    }`}>
                                        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                                    </div>
                                    <span className={`text-[10px] font-semibold leading-tight ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* ── Mobile slide-in menu (hamburger) ── */}
                {mobileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col animate-slide-in-right" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                            {/* Drawer header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <span className="font-bold text-gray-800">Conta</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Drawer profile card */}
                            <div className="px-5 py-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xl font-bold`}>
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs">
                                            <Camera size={14} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                                        </label>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-800 truncate capitalize">{user.name?.toLowerCase()}</p>
                                        <p className="text-xs text-gray-500 truncate">{[user.city, user.state].filter(Boolean).join(' – ') || 'Membro da comunidade'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer nav */}
                            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Navegação</p>
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium text-sm ${
                                                isActive
                                                    ? 'bg-primary text-white shadow-lg shadow-green-200'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                            }`}
                                        >
                                            <Icon size={18} className="flex-shrink-0" />
                                            <span className="flex-1">{item.fullLabel}</span>
                                            {isActive && <ChevronRight size={14} className="opacity-70" />}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Drawer logout */}
                            <div className="px-3 pb-4 border-t border-gray-100 pt-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium text-sm text-red-500 hover:bg-red-50"
                                >
                                    <LogOut size={18} className="flex-shrink-0" />
                                    Sair da Conta
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
