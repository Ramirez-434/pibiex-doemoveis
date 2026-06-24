
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import SecurityBanner from './SecurityBanner';
import { ArrowLeft, Package, MoreVertical, Ban, Check, X as XIcon } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    type: 'TEXT' | 'SYSTEM';
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
    };
}

interface ChatWindowProps {
    requestId: string;
    itemName: string;
    itemImage: string | null;
    otherUserName: string;
    otherUserId: string;
    isDonor: boolean;
    requestStatus: string;
    onClose: () => void;
}

const ChatWindow = ({ requestId, itemName, itemImage, otherUserName, otherUserId, isDonor, requestStatus, onClose }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    let user = {} as any;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') user = JSON.parse(userStr);
    } catch(e) {}

    useEffect(() => {
        fetchMessages();
        
        // Connect to Socket.io
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
        
        socket.on('connect', () => {
            socket.emit('join_chat', requestId);
        });

        socket.on('new_message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.disconnect();
        };
    }, [requestId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/chat/${requestId}`);
            setMessages(response.data.messages || []);
            setIsBlocked(response.data.isBlocked || false);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(newMessage);
    };

    const handleQuickReply = (message: string) => {
        sendMessage(message);
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        try {
            await api.post('/chat', { requestId, content });
            setNewMessage('');
            // A mensagem nova chegará pelo WebSocket, não precisamos fazer fetchMessages()
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleApprove = async () => {
        try {
            await api.patch(`/requests/${requestId}/approve`);
            window.location.reload(); // Recarrega para atualizar o status e as mensagens no ChatList
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Erro ao aprovar doação');
        }
    };

    const handleReject = async () => {
        try {
            await api.patch(`/requests/${requestId}/reject`);
            window.location.reload();
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Erro ao recusar doação');
        }
    };

    const handleBlockUser = async () => {
        if (!window.confirm(`Tem certeza que deseja bloquear ${otherUserName}? Vocês não poderão mais trocar mensagens.`)) return;
        
        try {
            await api.post('/block', { blockedId: otherUserId });
            setShowMenu(false);
            window.location.reload();
        } catch (error) {
            console.error('Error blocking user:', error);
            alert('Erro ao bloquear usuário');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700 transition-colors p-1">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h3 className="font-bold text-gray-800">{otherUserName}</h3>
                        <p className="text-xs text-primary font-medium">{itemName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                            <div className="absolute top-12 right-0 bg-white border border-gray-100 shadow-xl rounded-xl w-48 overflow-hidden z-50 animate-fade-in">
                                <button 
                                    onClick={handleBlockUser}
                                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                                >
                                    <Ban size={16} />
                                    Bloquear Usuário
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <SecurityBanner chatId={requestId} />

            {/* Anchored Item Card */}
            <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {itemImage ? (
                            <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={20} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{itemName}</p>
                        <p className="text-xs text-gray-500">Status: {
                            requestStatus === 'APPROVED' ? <span className="text-primary font-medium">Aprovado</span> :
                            requestStatus === 'REJECTED' ? <span className="text-red-500 font-medium">Recusado</span> :
                            <span className="text-yellow-600 font-medium">Pendente</span>
                        }</p>
                    </div>
                </div>

                {isDonor && requestStatus === 'PENDING' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={handleApprove}
                            className="flex-1 bg-primary hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <Check size={16} /> Aprovar
                        </button>
                        <button 
                            onClick={handleReject}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <XIcon size={16} /> Recusar
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="text-center text-gray-400 text-sm mt-4">Carregando...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-4">Nenhuma mensagem ainda.</div>
                ) : (
                    messages.map((msg) => {
                        if (msg.type === 'SYSTEM') {
                            return (
                                <div key={msg.id} className="flex justify-center my-4">
                                    <div className="bg-gray-100 text-gray-600 text-xs py-1 px-4 rounded-full max-w-[85%] text-center">
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        }

                        const isMe = msg.senderId === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe
                                    ? 'bg-primary text-white rounded-br-sm shadow-sm'
                                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                                    }`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-100 p-2 flex gap-2 overflow-x-auto">
                <button
                    onClick={() => handleQuickReply("Tenho interesse!")}
                    className="whitespace-nowrap px-3 py-1 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-full text-xs font-medium border border-gray-200 transition-colors"
                >
                    👋 Tenho interesse!
                </button>
                <button
                    onClick={() => handleQuickReply("Isso ainda está disponível?")}
                    className="whitespace-nowrap px-3 py-1 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-full text-xs font-medium border border-gray-200 transition-colors"
                >
                    ❓ Está disponível?
                </button>
                <button
                    onClick={() => handleQuickReply("Podemos combinar a entrega?")}
                    className="whitespace-nowrap px-3 py-1 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-full text-xs font-medium border border-gray-200 transition-colors"
                >
                    🚚 Entrega
                </button>
            </div>

            <form onSubmit={handleSend} className="p-3 border-t-0 flex gap-2 bg-white z-10 sticky bottom-0">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isBlocked ? "Você não pode responder a esta conversa." : "Digite sua mensagem..."}
                    disabled={isBlocked}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm disabled:opacity-50 disabled:bg-gray-100"
                />
                {!isBlocked && (
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-primary text-white p-3 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
                    >
                        <Send size={18} />
                    </button>
                )}
            </form>
        </div>
    );
};

export default ChatWindow;
