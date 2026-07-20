import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, AlertCircle, ArrowLeft, Calendar, Share2, Heart, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

interface Item {
    id: string;
    title: string;
    description: string;
    category: string;
    condition: string;
    images: string[];
    status: string;
    createdAt: string;
    donorId: string;
    donor: {
        name: string;
        city: string;
        state: string;
    };
}

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    let user = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') user = JSON.parse(userStr);
    } catch(e) {}

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await api.get(`/items/${id}`);
            setItem(response.data);
        } catch (error) {
            console.error('Error fetching item:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestDonation = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setRequesting(true);
        try {
            await api.post('/requests', { itemId: item?.id, beneficiaryId: user.id });

            // Celebration Effect
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2E7D32', '#F57C00', '#FFFFFF']
            });

            setTimeout(() => {
                setShowSuccessModal(true);
            }, 1000);

        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao solicitar doação.');
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Item não encontrado</h2>
                <Link to="/catalogo" className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft size={20} /> Voltar para o catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link to="/catalogo" className="inline-flex items-center text-gray-500 hover:text-primary mb-8 transition-colors font-medium">
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar para o catálogo
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
                    <div className="flex flex-col lg:flex-row">
                        {/* Image Gallery */}
                        <div className="lg:w-3/5 bg-gray-100 p-2">
                            <div className="relative h-72 sm:h-96 lg:h-[500px] rounded-2xl overflow-hidden bg-white shadow-inner">
                                {item.images[activeImage] ? (
                                    <img
                                        src={item.images[activeImage]}
                                        alt={item.title}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Sem imagem
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <button className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all text-gray-600 hover:text-red-500">
                                        <Heart size={24} />
                                    </button>
                                </div>
                            </div>

                            {item.images.length > 1 && (
                                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 px-2">
                                    {item.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === index ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="lg:w-2/5 p-6 lg:p-12 flex flex-col">
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${item.condition === 'Excelente' ? 'bg-green-100 text-green-700' :
                                        item.condition === 'Bom' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                        {item.condition}
                                    </span>
                                    <span className="text-gray-400 text-sm flex items-center gap-1">
                                        <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">{item.title}</h1>

                                <div className="flex items-center text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl inline-flex">
                                    <MapPin size={20} className="mr-2 text-primary" />
                                    <span className="font-medium">{item.donor.city}, {item.donor.state}</span>
                                </div>

                                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                                    {item.description}
                                </p>

                                <div className="border-t border-gray-100 pt-8 mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Doador</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold text-xl">
                                            {item.donor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{item.donor.name}</p>
                                            <p className="text-sm text-gray-500">Membro da comunidade</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                {item.status !== 'AVAILABLE' ? (
                                    <div className="w-full py-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                                        <AlertCircle size={20} />
                                        Item Indisponível
                                    </div>
                                ) : user?.id === item.donorId ? (
                                    <div className="w-full py-4 bg-blue-50 text-blue-600 rounded-xl font-bold text-center border border-blue-100">
                                        Este item é seu
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRequestDonation}
                                        disabled={requesting}
                                        className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                                    >
                                        {requesting ? 'Enviando...' : 'Solicitar Doação'}
                                    </button>
                                )}

                                <button className="w-full py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <Share2 size={20} /> Compartilhar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Sucesso */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-scale-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <CheckCircle2 size={40} className="text-green-600 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">Pedido Enviado!</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Sua solicitação foi enviada com sucesso ao doador. Agora é só aguardar o contato para combinar a retirada.
                        </p>
                        <button 
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/painel/solicitacoes');
                            }}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                        >
                            Ver Minhas Solicitações
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetail;
