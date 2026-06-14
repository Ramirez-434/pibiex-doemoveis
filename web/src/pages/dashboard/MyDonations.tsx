import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';

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
    const [activeChat, setActiveChat] = useState<{ requestId: string; itemName: string; otherUserName: string } | null>(null);
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
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.images[0] ? (
                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500">
                                    Publicado em {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                    item.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {item.status === 'AVAILABLE' && <CheckCircle size={12} />}
                                    {item.status === 'PENDING' && <Clock size={12} />}
                                    {item.status === 'DONATED' && <Package size={12} />}
                                    {item.status === 'AVAILABLE' ? 'Disponível' :
                                        item.status === 'PENDING' ? 'Pendente' : 'Doado'}
                                </span>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                                >
                                    Excluir
                                </button>

                                <Link
                                    to={`/painel/solicitacoes?itemId=${item.id}`}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors flex items-center gap-1"
                                >
                                    <MessageCircle size={16} /> Ver Interessados
                                </Link>
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

            {activeChat && (
                <ChatWindow
                    requestId={activeChat.requestId}
                    itemName={activeChat.itemName}
                    otherUserName={activeChat.otherUserName}
                    onClose={() => setActiveChat(null)}
                />
            )}
        </div>
    );
};

export default MyDonations;
