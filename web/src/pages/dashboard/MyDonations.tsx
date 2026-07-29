import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';

interface Item {
    id: string;
    title: string;
    images: string[];
    status: string;
    createdAt: string;
}

const MyDonations = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
    let user = {} as any;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') user = JSON.parse(userStr);
    } catch(e) {}

    useEffect(() => {
        fetchMyDonations();
    }, []);

    const fetchMyDonations = async () => {
        try {
            const response = await api.get('/items', { params: { donorId: user.id } });
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching donations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta doação?')) {
            try {
                await api.delete(`/items/${id}`);
                setItems(items.filter(item => item.id !== id));
            } catch (error: any) {
                console.error('Error deleting item:', error);
                alert(`Erro ao excluir doação: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Minhas Doações</h1>
                    <p className="text-gray-500">Gerencie os itens que você disponibilizou.</p>
                </div>
                <Link
                    to="/painel/novo-item"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                    Doar Novo Item
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-white rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : items.length > 0 ? (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 transition-all hover:shadow-md">
                            <div className="flex gap-4 w-full sm:w-auto flex-1">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                    {item.images[0] && !failedImages[item.id] ? (
                                        <img 
                                            src={item.images[0]} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover" 
                                            onError={() => setFailedImages(prev => ({ ...prev, [item.id]: true }))}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package size={24} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1 truncate">{item.title}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 whitespace-normal">
                                        Publicado em {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-2">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase items-center gap-1 w-max ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 border border-green-200' :
                                            item.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                'bg-gray-100 text-gray-700 border border-gray-200'
                                            }`}>
                                            {item.status === 'AVAILABLE' && <CheckCircle size={12} />}
                                            {item.status === 'PENDING' && <Clock size={12} />}
                                            {item.status === 'DONATED' && <Package size={12} />}
                                            {item.status === 'AVAILABLE' ? 'Disponível' :
                                                item.status === 'PENDING' ? 'Pendente' : 'Doado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t border-gray-100 sm:border-0 mt-2 sm:mt-0">
                                <Link
                                    to={`/painel/solicitacoes?itemId=${item.id}`}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs sm:text-sm transition-colors"
                                >
                                    <MessageCircle size={16} /> Interessados
                                </Link>

                                <Link
                                    to={`/painel/editar-item/${item.id}`}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs sm:text-sm transition-colors"
                                >
                                    <Edit2 size={16} /> Editar
                                </Link>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-xs sm:text-sm transition-colors"
                                >
                                    <Trash2 size={16} /> Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Você ainda não fez doações</h3>
                    <p className="text-gray-500 mb-6">Que tal desapegar de algo que não usa mais?</p>
                    <Link
                        to="/painel/novo-item"
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-green-700 transition-colors font-medium inline-block"
                    >
                        Começar a Doar
                    </Link>
                </div>
            )}

        </div>
    );
};

export default MyDonations;
