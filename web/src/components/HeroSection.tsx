import { useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative bg-gradient-to-br from-green-100 via-green-50 to-white py-24 overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse delay-700"></div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-primary text-sm font-semibold mb-8 shadow-sm border border-green-100 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
                    <Heart size={16} className="fill-current animate-pulse" />
                    <span>Conectando corações e lares</span>
                </div>

                <ScrollReveal>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                        Doe móveis, <br />
                        <span className="block text-gradient pb-2">
                            transforme vidas.
                        </span>
                    </h1>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Sua doação pode ser o recomeço de alguém. A plataforma que une quem quer ajudar a quem precisa mobiliar um lar com dignidade.
                    </p>
                </ScrollReveal>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/painel/novo-item')}
                        className="btn-gradient px-8 py-4 text-white rounded-full font-bold text-lg shadow-lg shadow-green-200/50 transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        <Heart size={20} />
                        Quero Doar Agora
                    </button>
                    <button
                        onClick={() => navigate('/catalogo')}
                        className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                        <Search size={20} />
                        Buscar Móveis
                    </button>
                </div>

                <ScrollReveal animation="fade-up" delay={400} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
                    {[
                        { label: 'Itens Doados', value: '150+' },
                        { label: 'Famílias Ajudadas', value: '85+' },
                        { label: 'Cidades', value: '12' },
                        { label: 'Voluntários', value: '300+' },
                    ].map((stat, idx) => (
                        <div key={idx} className="flex flex-col">
                            <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                            <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">{stat.label}</span>
                        </div>
                    ))}
                </ScrollReveal>
            </div>
        </section>
    );
};

export default HeroSection;
