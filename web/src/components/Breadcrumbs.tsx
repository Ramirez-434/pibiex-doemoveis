import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const breadcrumbLabels: { [key: string]: string } = {
  '': 'Início',
  'catalogo': 'Catálogo',
  'painel': 'Painel',
  'painel/novo-item': 'Novo Item',
  'painel/minhas-doacoes': 'Minhas Doações',
  'painel/solicitacoes': 'Minhas Solicitações',
  'painel/chat': 'Mensagens',
  'item': 'Detalhes do Item',
};

export const Breadcrumbs: React.FC<{ customLabel?: string }> = ({ customLabel }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  const breadcrumbs = [
    { label: 'Início', path: '/' },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const key = pathSegments.slice(0, index + 1).join('/');
      const label = breadcrumbLabels[key] || segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, path };
    }),
  ];

  return (
    <nav className="flex items-center gap-1 text-xs sm:text-sm px-3 sm:px-4 py-3 bg-gradient-to-r from-white to-gray-50 border-b border-gray-100">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-1">
          {index === 0 ? (
            <Link to={crumb.path} className="text-primary hover:text-primary/80 transition flex items-center gap-1">
              <Home size={16} />
              <span className="hidden sm:inline">{crumb.label}</span>
            </Link>
          ) : (
            <>
              <ChevronRight size={16} className="text-gray-400" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-600 font-medium">{customLabel || crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="text-gray-600 hover:text-primary transition">
                  {crumb.label}
                </Link>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
};
