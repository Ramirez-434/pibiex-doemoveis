import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, MessageCircle } from 'lucide-react';
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
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                            D
                        </div>
                        <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-800' : 'text-white'
                            }`}>
                            DoeMóveis
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`font-medium hover:text-primary transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-green-900 hover:text-green-700'
                            }`}>
                            Início
                        </Link>
                        <Link to="/catalogo" className={`font-medium hover:text-primary transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-green-900 hover:text-green-700'
                            }`}>
                            Catálogo
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/painel/chat" className={`p-2 transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-600 hover:text-primary' : 'text-green-900 hover:text-green-700'}`} aria-label="Mensagens">
                                    <MessageCircle size={20} />
                                </Link>
                                <div className={scrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-green-900'}>
                                    <NotificationBell />
                                </div>
                                <Link to="/painel" className="btn-gradient flex items-center gap-2 px-5 py-2.5 text-white rounded-full font-semibold shadow-lg shadow-green-200/50 transform hover:-translate-y-0.5">
                                    <User size={18} />
                                    Painel
                                </Link>
                            </div>
                        ) : (
                            <Link to="/login" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all transform hover:-translate-y-0.5 ${scrolled || location.pathname !== '/'
                                ? 'bg-primary text-white hover:bg-green-700 shadow-lg hover:shadow-green-200/50'
                                : 'bg-white text-primary hover:bg-gray-100 shadow-lg'
                                }`}>
                                <LogIn size={18} />
                                Entrar
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${scrolled || location.pathname !== '/' ? 'text-gray-800' : 'text-green-900'
                            }`}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl animate-fade-in-down">
                    <div className="flex flex-col p-4 space-y-4">
                        <Link to="/" className="px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                            Início
                        </Link>
                        <Link to="/catalogo" className="px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                            Catálogo
                        </Link>
                        {user ? (
                            <Link to="/painel" className="px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold">
                                Acessar Painel
                            </Link>
                        ) : (
                            <Link to="/login" className="px-4 py-3 rounded-xl bg-primary text-white font-bold text-center shadow-lg">
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
