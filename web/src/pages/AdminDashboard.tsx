import { useEffect, useState } from 'react';
import api from '../services/api';
import { UserX, Trash2 } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface Item {
    id: string;
    title: string;
    category: string;
    status: string;
}

interface Stats {
    totalUsers: number;
    totalItems: number;
    familiesHelped: number;
    successRate: number;
}

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [usersRes, itemsRes, statsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/items'), // Assuming there's a public or admin route to get all items
                api.get('/admin/stats')
            ]);
            setUsers(usersRes.data);
            setItems(itemsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
            alert('Acesso negado ou erro ao carregar.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteUser = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir/banir este usuário e todos os seus itens?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            alert('Usuário deletado!');
            fetchData();
        } catch (error) {
            alert('Erro ao deletar usuário.');
        }
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;
        try {
            await api.delete(`/admin/items/${id}`);
            alert('Item deletado!');
            fetchData();
        } catch (error) {
            alert('Erro ao deletar item.');
        }
    };

    if (loading) return <div className="text-center p-10">Carregando painel admin...</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 mt-10">
            <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
            
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">Usuários Ativos</p>
                        <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">Móveis Cadastrados</p>
                        <p className="text-2xl font-bold text-primary">{stats.totalItems}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">Famílias Ajudadas</p>
                        <p className="text-2xl font-bold text-primary">{stats.familiesHelped}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">Taxa de Sucesso</p>
                        <p className="text-2xl font-bold text-primary">{stats.successRate}%</p>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <UserX size={20} className="text-red-500" />
                        Gerenciar Usuários
                    </h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {users.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">{user.name} {user.role === 'ADMIN' && <span className="text-xs bg-primary text-white px-2 py-1 rounded ml-2">ADMIN</span>}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                {user.role !== 'ADMIN' && (
                                    <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                                        <UserX size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Trash2 size={20} className="text-red-500" />
                        Gerenciar Itens (Móveis)
                    </h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-gray-500">{item.category} • {item.status}</p>
                                </div>
                                <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
