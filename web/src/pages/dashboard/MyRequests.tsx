import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import api from '../../services/api';

interface Request {
    id: string;
    status: string;
    createdAt: string;
    item: {
        id: string;
        title: string;
        images: string[];
        donor: {
            name: string;
            phone: string;
        };
    };
}

const MyRequests = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const response = await api.get('/requests', { params: { beneficiaryId: user.id } });
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Minhas Solicitações</h1>
                <p className="text-gray-500">Acompanhe os pedidos de doação que você fez.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-white rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {req.item.images[0] ? (
                                    <img src={req.item.images[0]} alt={req.item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 truncate">{req.item.title}</h3>
                                <p className="text-sm text-gray-500 mb-1">
                                    Solicitado em {new Date(req.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Doador: <span className="font-medium">{req.item.donor.name}</span>
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                    {req.status === 'APPROVED' && <CheckCircle size={12} />}
                                    {req.status === 'REJECTED' && <XCircle size={12} />}
                                    {req.status === 'PENDING' && <Clock size={12} />}
                                    {req.status === 'APPROVED' ? 'Aprovado' :
                                        req.status === 'REJECTED' ? 'Recusado' : 'Pendente'}
                                </span>

                                {req.status === 'APPROVED' && (
                                    <a
                                        href={`https://wa.me/55${req.item.donor.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                    >
                                        <MessageCircle size={14} /> Contatar Doador
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma solicitação encontrada</h3>
                    <p className="text-gray-500 mb-6">Explore o catálogo e encontre itens que você precisa.</p>
                    <Link
                        to="/catalogo"
                        className="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-orange-600 transition-colors font-medium inline-block"
                    >
                        Ver Catálogo
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyRequests;
