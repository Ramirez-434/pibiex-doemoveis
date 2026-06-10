import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Catalog from './pages/Catalog';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import NewItem from './pages/dashboard/NewItem';
import MyDonations from './pages/dashboard/MyDonations';
import MyRequests from './pages/dashboard/MyRequests';
import ChatList from './pages/dashboard/ChatList';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/item/:id" element={<ItemDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Register />} />
                <Route path="/recuperar-senha" element={<ForgotPassword />} />
                <Route path="/redefinir-senha" element={<ResetPassword />} />
                <Route path="/termos" element={<Terms />} />
                <Route path="/privacidade" element={<Privacy />} />

                <Route path="/painel" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
                    <Route index element={<Navigate to="/painel/novo-item" replace />} />
                    <Route path="novo-item" element={<NewItem />} />
                    <Route path="minhas-doacoes" element={<MyDonations />} />
                    <Route path="solicitacoes" element={<MyRequests />} />
                    <Route path="chat" element={<ChatList />} />
                </Route>
                <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
