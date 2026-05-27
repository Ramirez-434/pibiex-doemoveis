import { useState, useEffect } from 'react';
import { Search, Filter, X, Package } from 'lucide-react';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import ScrollReveal from '../components/ScrollReveal';

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

const categories = ['SOFA', 'MESA', 'CADEIRA', 'CAMA', 'ARMARIO', 'ESTANTE', 'OUTROS'];

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
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Hero Search Section */}
            <div className="bg-primary pt-24 md:pt-32 pb-16 md:pb-20 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-600 to-green-900 opacity-90 z-0 animate-gradient"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400 opacity-20 rounded-full blur-3xl"></div>

                <div className="container mx-auto relative z-10 max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight animate-fade-in-down">
                        Encontre o móvel ideal para seu lar
                    </h1>
                    <p className="text-green-100 text-base md:text-lg mb-8 md:mb-10 animate-fade-in-up delay-100">
                        Explore centenas de doações disponíveis em sua região.
                    </p>

                    <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 animate-scale-in delay-200">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="O que você está procurando? (ex: sofá, mesa...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-400 text-base md:text-lg"
                            />
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${showFilters || selectedCategory
                                ? 'bg-green-100 text-primary'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Filter size={20} />
                            Filtros
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {(showFilters || selectedCategory) && (
                        <div className="mt-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 animate-fade-in-down text-left">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-semibold text-white">Filtrar por Categoria</span>
                                {selectedCategory && (
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className="text-sm text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full transition-colors"
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
            <div className="container mx-auto px-4 py-12 -mt-10 relative z-20">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl h-96 animate-pulse shadow-sm border border-gray-100 overflow-hidden">
                                <div className="h-56 bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-10 bg-gray-200 rounded-xl mt-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {items.map((item, index) => (
                            <ScrollReveal key={item.id} animation="fade-up" delay={(index % 4) * 100}>
                                <ItemCard item={item} />
                            </ScrollReveal>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-primary/50" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhum item encontrado</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Não encontramos itens com os filtros selecionados. Tente buscar por outros termos ou limpe os filtros.
                        </p>
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory('')}
                                className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
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
