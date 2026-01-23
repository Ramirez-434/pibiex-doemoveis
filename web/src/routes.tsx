import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Catalog from './pages/Catalog';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewItem from './pages/dashboard/NewItem';
import MyDonations from './pages/dashboard/MyDonations';
import MyRequests from './pages/dashboard/MyRequests';
import PrivateRoute from './components/PrivateRoute';

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

                <Route path="/painel" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
                    <Route index element={<Navigate to="/painel/novo-item" replace />} />
                    <Route path="novo-item" element={<NewItem />} />
                    <Route path="minhas-doacoes" element={<MyDonations />} />
                    <Route path="solicitacoes" element={<MyRequests />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
