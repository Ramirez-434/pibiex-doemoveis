import { useEffect, useState, useCallback } from 'react';
import HeroSection from '../components/HeroSection';
import MotivationSection from '../components/MotivationSection';
import ItemCard from '../components/ItemCard';
import api from '../services/api';
import { Search, Filter, X } from 'lucide-react';

interface Item {
    id: string;
    title: string;
    images: string[];
    condition: string;
    donor: {
        city: string;
        state: string;
    };
}

const CATEGORIES = [
    { value: 'SOFA', label: 'Sofá' },
    { value: 'MESA', label: 'Mesa' },
    { value: 'CADEIRA', label: 'Cadeira' },
    { value: 'CAMA', label: 'Cama' },
    { value: 'ARMARIO', label: 'Armário' },
    { value: 'ESTANTE', label: 'Estante' },
    { value: 'OUTROS', label: 'Outros' }
];

const CONDITIONS = [
    { value: 'NOVO', label: 'Novo' },
    { value: 'BOM', label: 'Bom Estado' },
    { value: 'REPARO', label: 'Precisa de Reparo' }
];

const Homepage = () => {
    const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // params.append('limit', '8'); // Increased limit for better browsing
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (category) params.append('category', category);
            if (condition) params.append('condition', condition);

            const response = await api.get(`/items?${params.toString()}`);
            setFeaturedItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, category, condition]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setCondition('');
    };

    const hasFilters = search || category || condition;

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection />
            <MotivationSection />

            <section className="container mx-auto px-4 py-16" id="catalogo">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Encontre seu Móvel
                        </h2>
                        <p className="text-gray-500">
                            Navegue pelos itens disponíveis para doação
                        </p>
                    </div>

                    {/* Filters Container */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar móveis..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full sm:w-40 appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-gray-600"
                            >
                                <option value="">Categorias</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Condition Dropdown */}
                        <div className="relative">
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="w-full sm:w-40 appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-gray-600"
                            >
                                <option value="">Condição</option>
                                {CONDITIONS.map(cond => (
                                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* Clear Filters Button */}
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                <span className="hidden sm:inline">Limpar</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500">Carregando móveis...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {featuredItems.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum item encontrado</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Não encontramos móveis com os filtros selecionados. Tente limpar os filtros ou buscar por outro termo.
                        </p>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-6 text-primary font-bold hover:underline"
                            >
                                Limpar todos os filtros
                            </button>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Homepage;
