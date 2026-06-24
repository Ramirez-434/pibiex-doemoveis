
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, MessageCircle, ArrowLeft, Check } from 'lucide-react';
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
    beneficiary?: {
        id: string;
        name: string;
        city: string;
        state: string;
    }
}

const MyRequests = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    let user = {} as any;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') user = JSON.parse(userStr);
    } catch(e) {}
    const [searchParams] = useSearchParams();
    const itemId = searchParams.get('itemId');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyRequests();
    }, [itemId]);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const params: any = {};

            if (itemId) {
                params.itemId = itemId;
            } else {
                params.beneficiaryId = user.id;
            }

            const response = await api.get('/requests', { params });
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        if (confirm('Ao aprovar esta solicitação, o item será marcado como DOADO para este usuário e outras solicitações serão recusadas. Deseja continuar?')) {
            try {
                await api.patch(`/requests/${requestId}/approve`);
                alert('Doação aprovada com sucesso!');
                navigate('/painel/minhas-doacoes');
            } catch (error) {
                console.error('Error approving request:', error);
                alert('Erro ao aprovar doação');
            }
        }
    };

    const isDonorView = !!itemId;

    return (
        <div>
            <div className="mb-8 flex items-center gap-4">
                {isDonorView && (
                    <Link to="/painel/minhas-doacoes" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isDonorView ? 'Gerenciar Interessados' : 'Minhas Solicitações'}
                    </h1>
                    <p className="text-gray-500">
                        {isDonorView
                            ? 'Veja quem tem interesse/pediu sua doação.'
                            : 'Acompanhe os pedidos de doação que você fez.'}
                    </p>
                </div>
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
                            {!isDonorView && (
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {req.item.images[0] ? (
                                        <img src={req.item.images[0]} alt={req.item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package size={20} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                {isDonorView ? (
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{req.beneficiary?.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {req.beneficiary?.city} - {req.beneficiary?.state}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Solicitado em {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-gray-800 truncate">{req.item.title}</h3>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Solicitado em {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Doador: <span className="font-medium">{req.item.donor.name}</span>
                                        </p>
                                    </>
                                )}
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

                                <div className="flex gap-2">
                                    {isDonorView && req.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleApprove(req.id)}
                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                                        >
                                            <Check size={14} /> Aprovar Doação
                                        </button>
                                    )}

                                    {!isDonorView && req.status === 'APPROVED' && (
                                        <a
                                            href={`https://wa.me/55${req.item.donor.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                                        >
                                            <MessageCircle size={14} /> WhatsApp
                                        </a>
                                    )}

                                    <button
                                        onClick={() => navigate('/painel/mensagens', { state: { openChatId: req.id } })}
                                        className="px-3 py-1.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-green-50 transition-colors flex items-center gap-1"
                                    >
                                        <MessageCircle size={14} /> Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {isDonorView ? 'Nenhum interessado ainda' : 'Nenhuma solicitação encontrada'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {isDonorView ? 'Aguarde os pedidos chegarem.' : 'Explore o catálogo e encontre itens que você precisa.'}
                    </p>
                    {!isDonorView && (
                        <Link
                            to="/catalogo"
                            className="px-6 py-3 bg-secondary text-white rounded-xl hover:bg-orange-600 transition-colors font-medium inline-block"
                        >
                            Ver Catálogo
                        </Link>
                    )}
                </div>
            )}

        </div>
    );
};

export default MyRequests;
