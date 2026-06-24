
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';

interface Conversation {
    id: string; // This is the requestId
    itemId: string;
    isDonor: boolean;
    requestStatus: string;
    item: {
        title: string;
        image: string | null;
    };
    otherUser: {
        id: string;
        name: string;
    };
    lastMessage: string;
    lastMessageTime: string;
}

const ChatList = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState<{ requestId: string; itemName: string; itemImage: string | null; otherUserName: string; otherUserId: string; isDonor: boolean; requestStatus: string } | null>(null);
    const location = useLocation();

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/chat/conversations');
            setConversations(response.data);

            // Auto-open chat se vier de outra página (ex: Minhas Solicitações)
            if (location.state?.openChatId) {
                const convToOpen = response.data.find((c: any) => c.id === location.state.openChatId);
                if (convToOpen) {
                    setActiveChat({
                        requestId: convToOpen.id,
                        itemName: convToOpen.item.title,
                        itemImage: convToOpen.item.image,
                        otherUserName: convToOpen.otherUser.name,
                        otherUserId: convToOpen.otherUser.id,
                        isDonor: convToOpen.isDonor,
                        requestStatus: convToOpen.requestStatus
                    });
                }
            }

        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Lista de Conversas */}
            <div className={`w-full md:w-[350px] lg:w-[400px] flex-col border-r border-gray-200 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageCircle className="text-primary" />
                        Mensagens
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : conversations.length > 0 ? (
                        <div className="space-y-1">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveChat({
                                        requestId: conv.id,
                                        itemName: conv.item.title,
                                        itemImage: conv.item.image,
                                        otherUserName: conv.otherUser.name,
                                        otherUserId: conv.otherUser.id,
                                        isDonor: conv.isDonor,
                                        requestStatus: conv.requestStatus
                                    })}
                                    className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                                        activeChat?.requestId === conv.id ? 'bg-green-50 border border-green-100' : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                        {conv.item.image ? (
                                            <img src={conv.item.image} alt={conv.item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-semibold text-gray-800 truncate text-sm">{conv.otherUser.name}</h3>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                {new Date(conv.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">Nenhuma conversa</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Janela de Chat */}
            <div className={`flex-1 flex-col bg-gray-50 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
                {activeChat ? (
                    <ChatWindow
                        requestId={activeChat.requestId}
                        itemName={activeChat.itemName}
                        itemImage={activeChat.itemImage}
                        otherUserName={activeChat.otherUserName}
                        otherUserId={activeChat.otherUserId}
                        isDonor={activeChat.isDonor}
                        requestStatus={activeChat.requestStatus}
                        onClose={() => setActiveChat(null)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600">Suas Mensagens</h3>
                        <p className="text-sm">Selecione uma conversa na lateral para começar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
