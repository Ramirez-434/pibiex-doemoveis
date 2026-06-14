
import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';

interface Message {
    id: string;
    content: string;
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
    otherUserName: string;
    onClose: () => void;
}

const ChatWindow = ({ requestId, itemName, otherUserName, onClose }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
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
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
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

    return (
        <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col h-[500px]">
            <div className="bg-primary text-white p-4 rounded-t-xl flex justify-between items-center shadow-md">
                <div>
                    <h3 className="font-bold">{otherUserName}</h3>
                    <p className="text-xs text-green-100">{itemName}</p>
                </div>
                <button onClick={onClose} className="hover:bg-green-700 p-1 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="text-center text-gray-400 text-sm mt-4">Carregando...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-4">Nenhuma mensagem ainda.</div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-xl text-sm ${isMe
                                    ? 'bg-primary text-white rounded-br-none shadow-md'
                                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                                    }`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
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
                    className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-full text-xs font-medium border border-gray-200 transition-colors"
                >
                    👋 Tenho interesse!
                </button>
                <button
                    onClick={() => handleQuickReply("Isso ainda está disponível?")}
                    className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-full text-xs font-medium border border-gray-200 transition-colors"
                >
                    ❓ Está disponível?
                </button>
                <button
                    onClick={() => handleQuickReply("Podemos combinar a entrega?")}
                    className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-full text-xs font-medium border border-gray-200 transition-colors"
                >
                    🚚 Entrega
                </button>
            </div>

            <form onSubmit={handleSend} className="p-3 pt-1 border-t-0 flex gap-2 bg-white rounded-b-xl">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white p-2 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
