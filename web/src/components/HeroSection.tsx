import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import api from '../services/api';

interface Stats {
    itemsDonated: number;
    familiesHelped: number;
    cities: number;
    volunteers: number;
}

const HeroSection = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        api.get('/items/stats/public')
            .then(res => setStats(res.data))
            .catch(err => console.error('Error fetching public stats:', err));
    }, []);

    const hasStats = stats && (stats.itemsDonated > 0 || stats.familiesHelped > 0 || stats.volunteers > 0);

    return (
        <section className="relative bg-gradient-to-br from-green-100 via-green-50 to-white py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 sm:w-96 h-64 sm:h-96 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-56 sm:w-80 h-56 sm:h-80 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse delay-700"></div>

            <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-primary text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-sm border border-green-100 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
                    <Heart size={14} className="sm:w-5 sm:h-5 fill-current animate-pulse" />
                    <span>Conectando corações e lares</span>
                </div>

                <ScrollReveal>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight leading-tight">
                        Doe o que não usa, <br />
                        <span className="block text-gradient pb-2">
                            transforme vidas.
                        </span>
                    </h1>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                        Sua doação pode ser o recomeço de alguém. A plataforma que conecta doadores com quem precisa de itens e produtos com dignidade.
                    </p>
                </ScrollReveal>

                <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/painel/novo-item')}
                        className="btn-gradient px-6 sm:px-8 py-3 sm:py-4 text-white rounded-full font-bold text-base sm:text-lg shadow-lg shadow-green-200/50 transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] sm:min-h-[56px] touch-manipulation transition-all"
                    >
                        <Heart size={18} className="sm:w-5 sm:h-5" />
                        Quero Doar Agora
                    </button>
                    <button
                        onClick={() => navigate('/catalogo')}
                        className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-base sm:text-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] sm:min-h-[56px] touch-manipulation"
                    >
                        <Search size={18} className="sm:w-5 sm:h-5" />
                        Buscar Itens
                    </button>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;
