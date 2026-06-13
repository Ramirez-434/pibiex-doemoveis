import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, MessageCircle, ShieldAlert } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled || location.pathname !== '/' ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4 sm:py-5'
            }`} style={{ paddingTop: 'max(var(--safe-area-inset-top, 0px), 1rem)' }}>
            <div className="container mx-auto px-3 sm:px-4">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="Doe + Brasil Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                        <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-800' : 'text-green-900'
                            }`}>
                            Doe + Brasil
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-6 lg:gap-8">
                        <Link to="/" className={`font-medium text-sm lg:text-base hover:text-primary transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-green-900 hover:text-green-700'
                            }`}>
                            Início
                        </Link>
                        <Link to="/catalogo" className={`font-medium text-sm lg:text-base hover:text-primary transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-green-900 hover:text-green-700'
                            }`}>
                            Catálogo
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-2 lg:gap-4">
                                <Link to="/painel/chat" className={`p-2 md:p-2.5 lg:p-3 rounded-lg transition-colors hover:bg-gray-100 md:hover:bg-transparent ${scrolled || location.pathname !== '/' ? 'text-gray-600 hover:text-primary' : 'text-green-900 hover:text-green-700'}`} aria-label="Mensagens">
                                    <MessageCircle size={20} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                                </Link>
                                <div className={scrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-green-900'}>
                                    <NotificationBell />
                                </div>
                                {(user.role === 'ADMIN' || user.email === 'mrbatista274@gmail.com') && (
                                    <Link to="/admin" className={`p-2 md:p-2.5 lg:p-3 rounded-lg transition-colors hover:bg-gray-100 md:hover:bg-transparent ${scrolled || location.pathname !== '/' ? 'text-gray-600 hover:text-primary' : 'text-green-900 hover:text-green-700'}`} aria-label="Painel Admin">
                                        <ShieldAlert size={20} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                                    </Link>
                                )}
                                <Link to="/painel" className="btn-gradient flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-white rounded-full font-semibold text-sm lg:text-base shadow-lg shadow-green-200/50 transform hover:-translate-y-0.5 min-h-[44px] md:min-h-auto touch-manipulation">
                                    <User size={18} />
                                    Painel
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className={`font-semibold text-sm lg:text-base transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-600 hover:text-primary' : 'text-green-900 hover:text-green-700'}`}>
                                    Entrar
                                </Link>
                                {location.pathname !== '/cadastro' && (
                                    <Link to="/cadastro" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all transform hover:-translate-y-0.5 ${scrolled || location.pathname !== '/'
                                        ? 'bg-primary text-white hover:bg-green-700 shadow-lg hover:shadow-green-200/50'
                                        : 'bg-white text-primary hover:bg-gray-100 shadow-lg'
                                        }`}>
                                        <User size={18} />
                                        Cadastrar
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-800' : 'text-green-900'
                            }`}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl animate-fade-in-down z-50">
                    <div className="flex flex-col p-3 sm:p-4 space-y-2">
                        <Link to="/" className="px-4 py-3.5 sm:py-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-semibold text-base min-h-[48px] flex items-center touch-manipulation transition-colors">
                            Início
                        </Link>
                        <Link to="/catalogo" className="px-4 py-3.5 sm:py-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-semibold text-base min-h-[48px] flex items-center touch-manipulation transition-colors">
                            Catálogo
                        </Link>
                        {user ? (
                            <>
                                <Link to="/painel" className="px-4 py-3.5 sm:py-4 rounded-2xl bg-primary/10 text-primary font-bold text-base min-h-[48px] flex items-center touch-manipulation transition-colors">
                                    Acessar Painel
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin" className="px-4 py-3.5 sm:py-4 rounded-2xl bg-gray-800 text-white font-bold text-base min-h-[48px] flex items-center touch-manipulation transition-colors mt-2">
                                        Painel Admin
                                    </Link>
                                )}
                            </>
                        ) : (
                            <Link to="/login" className="px-4 py-3.5 sm:py-4 rounded-2xl bg-primary text-white font-bold text-base text-center shadow-lg min-h-[48px] flex items-center justify-center touch-manipulation transition-colors hover:bg-green-700">
                                Entrar / Cadastrar
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
