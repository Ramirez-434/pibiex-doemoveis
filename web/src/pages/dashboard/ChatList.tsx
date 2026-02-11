
import { useState, useEffect } from 'react';
import { Package, MessageCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';

interface Conversation {
    id: string; // This is the requestId
    itemId: string;
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
    const [activeChat, setActiveChat] = useState<{ requestId: string; itemName: string; otherUserName: string } | null>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/chat/conversations');
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Mensagens</h1>
                <p className="text-gray-500">Suas conversas ativas sobre doações.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-white rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : conversations.length > 0 ? (
                <div className="space-y-4">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => setActiveChat({
                                requestId: conv.id,
                                itemName: conv.item.title,
                                otherUserName: conv.otherUser.name
                            })}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                {conv.item.image ? (
                                    <img src={conv.item.image} alt={conv.item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-800 truncate">{conv.otherUser.name}</h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2 flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(conv.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-primary font-medium mb-1 truncate uppercase tracking-wider">{conv.item.title}</p>
                                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                            </div>

                            <div className="text-gray-300">
                                <MessageCircle size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <MessageCircle size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhuma conversa</h3>
                    <p className="text-gray-500">Inicie um chat através de suas solicitações ou doações.</p>
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

export default ChatList;
