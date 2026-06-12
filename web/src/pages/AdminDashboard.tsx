import { useEffect, useState } from 'react';
import api from '../services/api';
import { UserX, Trash2, TrendingUp, PieChart as PieIcon, Users, Package, HeartHandshake } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

interface DashboardSummary {
    kpis: {
        totalUsers: number;
        totalActiveItems: number;
        familiesHelped: number;
        successRate: number;
    };
    charts: {
        itemsPerMonth: { month: string; count: number }[];
        itemsByStatus: { status: string; count: number }[];
    };
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [usersRes, itemsRes, summaryRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/items', { params: { limit: 100 } }),
                api.get('/admin/dashboard/summary')
            ]);
            setUsers(usersRes.data);
            setItems(itemsRes.data);
            setSummary(summaryRes.data);
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

    if (loading) return <div className="text-center p-10 mt-20">Carregando painel admin...</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 mt-10 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
            
            {summary && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                            <Users className="text-blue-500 mb-2" size={24} />
                            <p className="text-gray-500 text-sm font-medium">Usuários Ativos</p>
                            <p className="text-3xl font-bold text-gray-800">{summary.kpis.totalUsers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                            <Package className="text-green-500 mb-2" size={24} />
                            <p className="text-gray-500 text-sm font-medium">Móveis Ativos</p>
                            <p className="text-3xl font-bold text-gray-800">{summary.kpis.totalActiveItems}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                            <HeartHandshake className="text-rose-500 mb-2" size={24} />
                            <p className="text-gray-500 text-sm font-medium">Famílias Ajudadas</p>
                            <p className="text-3xl font-bold text-gray-800">{summary.kpis.familiesHelped}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                            <TrendingUp className="text-yellow-500 mb-2" size={24} />
                            <p className="text-gray-500 text-sm font-medium">Taxa de Sucesso</p>
                            <p className="text-3xl font-bold text-gray-800">{summary.kpis.successRate}%</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <TrendingUp size={20} className="text-primary" />
                                <h3 className="font-bold text-gray-800 text-lg">Crescimento de Cadastros</h3>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={summary.charts.itemsPerMonth}>
                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <PieIcon size={20} className="text-primary" />
                                <h3 className="font-bold text-gray-800 text-lg">Efetividade (Status dos Itens)</h3>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={summary.charts.itemsByStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="status"
                                        >
                                            {summary.charts.itemsByStatus.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden flex flex-col">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                        <UserX size={20} /> Gerenciar Usuários
                    </h2>
                    <div className="overflow-y-auto flex-1 max-h-96 pr-2">
                        {users.map((u) => (
                            <div key={u.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border border-gray-100 rounded-lg mb-2 transition-colors">
                                <div>
                                    <p className="font-semibold text-sm">{u.name} <span className="text-xs bg-green-100 text-green-800 px-2 rounded font-bold ml-2">{u.role}</span></p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                                {u.role !== 'ADMIN' && (
                                    <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden flex flex-col">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                        <Trash2 size={20} /> Gerenciar Itens (Móveis)
                    </h2>
                    <div className="overflow-y-auto flex-1 max-h-96 pr-2">
                        {items.length === 0 ? <p className="text-gray-500 text-sm">Nenhum item.</p> : items.map((i) => (
                            <div key={i.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border border-gray-100 rounded-lg mb-2 transition-colors">
                                <div>
                                    <p className="font-semibold text-sm truncate max-w-[200px]">{i.title}</p>
                                    <p className="text-xs text-gray-500">{i.category} • <span className="font-bold">{i.status}</span></p>
                                </div>
                                <button onClick={() => deleteItem(i.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors">
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
