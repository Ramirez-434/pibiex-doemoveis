import { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import ItemCard from '../components/ItemCard';
import api from '../services/api';

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

const Homepage = () => {
    const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await api.get('/items?limit=4');
                setFeaturedItems(response.data);
            } catch (error) {
                console.error('Error fetching items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection />

            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Destaques Recentes
                </h2>

                {loading ? (
                    <div className="text-center py-12">Carregando...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {featuredItems.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-12">
                        Nenhum item disponível no momento.
                    </div>
                )}
            </section>
        </div>
    );
};

export default Homepage;
