import { useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-24 overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse delay-700"></div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-primary text-sm font-semibold mb-8 shadow-sm border border-green-100 animate-fade-in-up">
                    <Heart size={16} className="fill-current" />
                    <span>Conectando corações e lares</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                    Doe móveis, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">
                        transforme vidas.
                    </span>
                </h1>

                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Sua doação pode ser o recomeço de alguém. A plataforma que une quem quer ajudar a quem precisa mobiliar um lar com dignidade.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/painel/novo-item')}
                        className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200/50 transform hover:-translate-y-1 flex items-center gap-2"
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

                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
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
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
