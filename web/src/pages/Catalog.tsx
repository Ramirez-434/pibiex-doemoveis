import { useState, useEffect } from 'react';
import { Search, Filter, X, Package } from 'lucide-react';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import ScrollReveal from '../components/ScrollReveal';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SkeletonGrid } from '../components/Skeleton';

interface Item {
    id: string;
    title: string;
    images: string[];
    condition: string;
    category: string;
    donor: {
        city: string;
        state: string;
    };
}

const categories = ['ELETRONICOS', 'ROUPAS', 'MOVEIS', 'LIVROS', 'UTENSÍLIOS', 'BRINQUEDOS', 'ESPORTES', 'SAUDE', 'OUTROS'];

const Catalog = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [selectedCategory, searchTerm]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (searchTerm) params.search = searchTerm;
            if (selectedCategory) params.category = selectedCategory;

            const response = await api.get('/items', { params });
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchItems();
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-24">
            <Breadcrumbs />
            {/* Hero Search Section */}
            <div className="bg-primary pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-14 md:pb-16 lg:pb-20 px-3 sm:px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-600 to-green-900 opacity-90 z-0 animate-gradient"></div>
                <div className="absolute -top-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-48 sm:w-80 h-48 sm:h-80 bg-yellow-400 opacity-20 rounded-full blur-3xl"></div>

                <div className="container mx-auto relative z-10 max-w-4xl text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight animate-fade-in-down leading-tight">
                        Encontre os itens que você procura
                    </h1>
                    <p className="text-green-100 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 animate-fade-in-up delay-100 px-2">
                        Explore centenas de doações disponíveis em sua região.
                    </p>

                    <div className="bg-white p-2 sm:p-2.5 rounded-lg sm:rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 animate-scale-in delay-200">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 sm:w-5" />
                            <input
                                type="text"
                                placeholder="O que você está procurando? (ex: livros, roupas...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 sm:pl-10 md:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base md:text-lg min-h-[44px] sm:min-h-auto touch-manipulation"
                            />
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 sm:px-6 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] sm:min-h-auto touch-manipulation text-sm sm:text-base ${showFilters || selectedCategory
                                ? 'bg-green-100 text-primary'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Filter size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Filtros</span>
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {(showFilters || selectedCategory) && (
                        <div className="mt-3 sm:mt-4 bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-lg sm:rounded-2xl border border-white/20 animate-fade-in-down text-left">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <span className="font-semibold text-white text-sm sm:text-base">Filtrar por Categoria</span>
                                {selectedCategory && (
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className="text-xs sm:text-sm text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-2 sm:px-3 py-1 rounded-full transition-colors"
                                    >
                                        <X size={14} /> Limpar filtro
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                                            ? 'bg-white text-primary shadow-lg transform scale-105'
                                            : 'bg-black/20 text-white hover:bg-black/30 border border-white/10'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="container mx-auto px-3 sm:px-4 py-8 md:py-12 -mt-10 relative z-20">
                {loading ? (
                    <SkeletonGrid count={12} />
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                        {items.map((item, index) => (
                            <ScrollReveal key={item.id} animation="fade-up" delay={(index % 4) * 100}>
                                <ItemCard item={item} />
                            </ScrollReveal>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 sm:py-20 md:py-24 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
                            <Package size={32} className="sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary/50" />
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Nenhum item encontrado</h3>
                        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-4">
                            Não encontramos itens com os filtros selecionados. Tente buscar por outros termos ou limpe os filtros.
                        </p>
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory('')}
                                className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-auto touch-manipulation"
                            >
                                Ver todos os itens
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalog;
