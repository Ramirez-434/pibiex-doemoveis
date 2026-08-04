import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, AlertCircle, ArrowLeft, Calendar, Share2, Heart, CheckCircle2, Package, Tag, Sparkles, Send, Camera, Loader2, Trash2, MessageSquare, Hash } from 'lucide-react';
import confetti from 'canvas-confetti';
import imageCompression from 'browser-image-compression';
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
    quantity?: number;
    receivedPhoto?: string;
    donor: {
        name: string;
        city: string;
        state: string;
    };
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string; avatar?: string };
}

const conditionConfig: Record<string, { color: string; bg: string; icon: string }> = {
    'Excelente': { color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: '✨' },
    'Bom':       { color: 'text-blue-700',    bg: 'bg-blue-100 border-blue-200',       icon: '👍' },
    'Aceitável': { color: 'text-orange-700',  bg: 'bg-orange-100 border-orange-200',   icon: '🔧' },
};

const avatarColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
];

const getAvatarColor = (name: string) => {
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
};

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [liked, setLiked] = useState(false);
    // Comments
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    // Received photo
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    let user: any = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') user = JSON.parse(userStr);
    } catch(e) {}

    useEffect(() => {
        fetchItem();
        fetchComments();
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

    const fetchComments = async () => {
        try {
            const res = await api.get(`/items/${id}/comments`);
            setComments(res.data);
        } catch { /* ignore */ }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmittingComment(true);
        try {
            const res = await api.post(`/items/${id}/comments`, { content: commentText.trim() });
            setComments(prev => [...prev, res.data]);
            setCommentText('');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Erro ao comentar');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await api.delete(`/items/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch { alert('Erro ao deletar comentário'); }
    };

    const handleReceivedPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
            const compressed = await imageCompression(file, options);
            const fd = new FormData();
            fd.append('image', compressed, compressed.name || 'photo.jpg');
            const uploadRes = await api.post('/upload', fd);
            const photoUrl = uploadRes.data.url;
            await api.patch(`/items/${id}/received-photo`, { photoUrl });
            setItem(prev => prev ? { ...prev, receivedPhoto: photoUrl } : prev);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Erro ao enviar foto');
        } finally {
            setUploadingPhoto(false);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    };

    const handleRequestDonation = async () => {
        if (!user) { navigate('/login'); return; }
        setRequesting(true);
        try {
            await api.post('/requests', { itemId: item?.id, beneficiaryId: user.id });
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#059669', '#F59E0B', '#FFFFFF', '#6EE7B7'] });
            setTimeout(() => setShowSuccessModal(true), 800);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao solicitar doação.');
        } finally {
            setRequesting(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ title: item?.title, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent shadow-lg"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando item...</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50 gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Package size={36} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Item não encontrado</h2>
                <p className="text-gray-500 mb-2">O item que você procura não existe ou foi removido.</p>
                <Link to="/catalogo" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                    <ArrowLeft size={18} /> Voltar para o catálogo
                </Link>
            </div>
        );
    }

    const cond = conditionConfig[item.condition] ?? { color: 'text-gray-700', bg: 'bg-gray-100 border-gray-200', icon: '📦' };
    const hasLocation = item.donor.city || item.donor.state;
    const location = [item.donor.city, item.donor.state].filter(Boolean).join(', ');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/40 font-sans pt-20 pb-16">

            {/* Decorative top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500"></div>

            <div className="container mx-auto px-4 max-w-6xl pt-8">

                {/* Breadcrumb */}
                <Link
                    to="/catalogo"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors font-medium group"
                >
                    <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-primary group-hover:text-primary transition-all">
                        <ArrowLeft size={16} />
                    </span>
                    Voltar para o catálogo
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/80 animate-fade-in-up">
                    <div className="flex flex-col lg:flex-row">

                        {/* ─── Image Gallery ─── */}
                        <div className="lg:w-[55%] bg-gray-50 flex flex-col">
                            {/* Main image */}
                            <div className="relative flex-1 min-h-72 sm:min-h-96 lg:min-h-[500px] overflow-hidden">
                                {item.images[activeImage] ? (
                                    <img
                                        src={item.images[activeImage]}
                                        alt={item.title}
                                        className="w-full h-full object-contain transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                                        <Package size={56} />
                                        <span className="text-sm font-medium">Sem imagem</span>
                                    </div>
                                )}

                                {/* Gradient overlay bottom */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-none" />

                                {/* Status badge */}
                                {item.status !== 'AVAILABLE' && (
                                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                        Indisponível
                                    </div>
                                )}

                                {/* Like button */}
                                <button
                                    onClick={() => setLiked(l => !l)}
                                    className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all ${liked ? 'bg-red-500 text-white scale-110' : 'bg-white/80 text-gray-500 hover:text-red-500'}`}
                                >
                                    <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                                </button>

                                {/* Image count indicator */}
                                {item.images.length > 1 && (
                                    <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                                        {activeImage + 1} / {item.images.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {item.images.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto bg-white border-t border-gray-100">
                                    {item.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                                                activeImage === index
                                                    ? 'border-primary shadow-md shadow-primary/20 scale-105'
                                                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
                                            }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ─── Product Info ─── */}
                        <div className="lg:w-[45%] flex flex-col">

                            {/* Top section */}
                            <div className="p-6 lg:p-10 flex-1">

                                {/* Condition + Date row */}
                                <div className="flex items-center justify-between mb-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cond.bg} ${cond.color}`}>
                                        <span>{cond.icon}</span>
                                        {item.condition}
                                    </span>
                                    <span className="text-gray-400 text-xs flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <Calendar size={12} />
                                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight capitalize">
                                    {item.title.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </h1>

                                {/* Category + Quantity row */}
                                <div className="flex items-center gap-2 flex-wrap mb-5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 text-primary text-xs font-semibold rounded-full border border-primary/20">
                                        <Tag size={11} />
                                        {item.category}
                                    </span>
                                    {(item.quantity ?? 1) > 1 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
                                            <Hash size={11} />
                                            {item.quantity} unidades disponíveis
                                        </span>
                                    )}
                                </div>

                                {/* Location */}
                                {hasLocation && (
                                    <div className="flex items-center gap-2 text-gray-600 mb-6 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 w-fit">
                                        <MapPin size={16} className="text-primary flex-shrink-0" />
                                        <span className="font-medium text-sm">{location}</span>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição</h3>
                                    <p className="text-gray-600 leading-relaxed text-base">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                    <Sparkles size={14} className="text-gray-300" />
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                </div>

                                {/* Donor card */}
                                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-4 border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Doador</h3>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 bg-gradient-to-br ${getAvatarColor(item.donor.name)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}>
                                            {item.donor.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{item.donor.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <CheckCircle2 size={11} className="text-emerald-500" />
                                                Membro verificado
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Action buttons ─── */}
                            <div className="p-6 lg:px-10 lg:pb-10 border-t border-gray-50 space-y-3">
                                {item.status !== 'AVAILABLE' ? (
                                    <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold text-center flex items-center justify-center gap-2 border border-gray-200">
                                        <AlertCircle size={18} />
                                        Item Indisponível
                                    </div>
                                ) : user?.id === item.donorId ? (
                                    <div className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-center border border-blue-100">
                                        📦 Este item é seu
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRequestDonation}
                                        disabled={requesting}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-base hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 active:scale-95"
                                    >
                                        {requesting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Solicitar Doação
                                            </>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={handleShare}
                                    className="w-full py-3.5 bg-white text-gray-600 border border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Share2 size={16} /> Compartilhar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Foto pós-doação ─── */}
                {item.status === 'DONATED' && (
                    <div className="mt-8 bg-white rounded-3xl shadow-lg border border-gray-100 p-6 lg:p-10 animate-fade-in-up">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Camera size={20} className="text-emerald-500" />
                            Foto do Produto Recebido
                        </h2>

                        {item.receivedPhoto ? (
                            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                                <img src={item.receivedPhoto} alt="Produto recebido" className="w-full max-h-96 object-contain bg-gray-50" />
                                <p className="text-xs text-gray-400 text-center py-2 bg-gray-50">📸 Foto enviada pelo beneficiário</p>
                            </div>
                        ) : (
                            <div>
                                {/* Beneficiário pode postar a foto */}
                                {user && (
                                    <div>
                                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center mb-4">
                                            <Camera size={36} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">Nenhuma foto publicada ainda.</p>
                                            <p className="text-gray-400 text-xs mt-1">Se você recebeu este item, compartilhe uma foto!</p>
                                        </div>
                                        <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                                            uploadingPhoto
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                        }`}>
                                            {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                            {uploadingPhoto ? 'Enviando foto...' : 'Enviar minha foto do produto'}
                                            <input
                                                ref={photoInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploadingPhoto}
                                                onChange={handleReceivedPhotoUpload}
                                            />
                                        </label>
                                    </div>
                                )}
                                {!user && (
                                    <p className="text-gray-400 text-sm text-center py-6">Nenhuma foto publicada ainda.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Comentários ─── */}
                <div className="mt-8 bg-white rounded-3xl shadow-lg border border-gray-100 p-6 lg:p-10 animate-fade-in-up">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MessageSquare size={20} className="text-primary" />
                        Comentários
                        {comments.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">{comments.length}</span>
                        )}
                    </h2>

                    {/* Lista de comentários */}
                    {comments.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Seja o primeiro a comentar! 💬</p>
                    ) : (
                        <div className="space-y-4 mb-6">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br ${avatarColors[comment.author.name.charCodeAt(0) % avatarColors.length]} overflow-hidden`}>
                                        {comment.author.avatar
                                            ? <img src={comment.author.avatar} alt="" className="w-full h-full object-cover" />
                                            : comment.author.name.charAt(0).toUpperCase()
                                        }
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm text-gray-800">{comment.author.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] text-gray-400">
                                                    {new Date(comment.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                                                </span>
                                                {user?.id === comment.author.id && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-0.5 rounded"
                                                        title="Deletar comentário"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Campo de comentário */}
                    {user ? (
                        <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
                            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br ${avatarColors[user.name?.charCodeAt(0) % avatarColors.length]} overflow-hidden`}>
                                {user.avatar
                                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                    : user.name?.charAt(0).toUpperCase()
                                }
                            </div>
                            <div className="flex-1 flex gap-2">
                                <textarea
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(e as any); }}}
                                    rows={1}
                                    maxLength={500}
                                    placeholder="Escreva um comentário..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none font-medium text-gray-700 text-sm transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingComment || !commentText.trim()}
                                    className="p-2.5 bg-primary text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 self-end"
                                >
                                    {submittingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4 border-t border-gray-100">
                            <p className="text-gray-500 text-sm">
                                <Link to="/login" className="text-primary font-semibold hover:underline">Faça login</Link> para comentar
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Success Modal ─── */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-scale-in border border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
                            <CheckCircle2 size={38} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Pedido Enviado! 🎉</h3>
                        <p className="text-gray-500 mb-7 leading-relaxed text-sm">
                            Sua solicitação foi enviada com sucesso ao doador. Aguarde o contato para combinar a retirada.
                        </p>
                        <button
                            onClick={() => { setShowSuccessModal(false); navigate('/painel/solicitacoes'); }}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-200"
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
