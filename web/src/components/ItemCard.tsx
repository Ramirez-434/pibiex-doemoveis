import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ItemProps {
    id: string;
    title: string;
    images: string[];
    condition: string;
    status?: string;
    quantity?: number;
    donor: {
        city: string;
        state: string;
    };
}

const ItemCard = ({ item }: { item: ItemProps }) => {
    const [imgError, setImgError] = useState(false);
    const isDonated = item.status === 'DONATED';

    return (
        <div className={`group bg-white rounded-xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full transform motion-safe:hover:-translate-y-2 ${isDonated ? 'opacity-90' : ''}`}>
            <div className="w-full aspect-video bg-gray-100 relative overflow-hidden">
                {item.images[0] && !imgError ? (
                    <img
                        src={item.images[0]}
                        alt={item.title}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105 ${isDonated ? 'grayscale contrast-95 opacity-80' : ''}`}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 gap-1">
                        <Package size={28} />
                        <span className="text-xs font-medium">Sem imagem</span>
                    </div>
                )}

                {isDonated && (
                    <div className="absolute inset-0 bg-gray-900/35 flex items-center justify-center z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-gray-900/85 text-white shadow-lg backdrop-blur-md border border-white/25">
                            <CheckCircle2 size={15} className="text-emerald-400" />
                            Doado
                        </span>
                    </div>
                )}

                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                    <span className={`
            px-2 sm:px-4 py-1 sm:py-1.5 text-xs font-bold rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/20
            ${isDonated ? 'bg-gray-600/90 text-white' :
                            item.condition === 'Excelente' ? 'bg-green-500/90 text-white' :
                                item.condition === 'Bom' ? 'bg-blue-500/90 text-white' :
                                    'bg-orange-500/90 text-white'}
          `}>
                        {isDonated ? 'Doado' : item.condition}
                    </span>
                </div>

                {(item.quantity ?? 1) > 1 && (
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${isDonated ? 'bg-gray-700/90' : 'bg-indigo-500/90'} text-white shadow-lg backdrop-blur-md border border-white/20`}>
                            ×{item.quantity} un.
                        </span>
                    </div>
                )}

                {!isDonated && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-6">
                        <span className="text-white text-xs sm:text-sm font-medium flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Clock size={14} className="sm:w-4 sm:h-4" /> Adicionado recentemente
                        </span>
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow relative">
                <div className="mb-3 sm:mb-4">
                    <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">
                        <MapPin size={14} className={`mr-1 sm:mr-1.5 flex-shrink-0 ${isDonated ? 'text-gray-400' : 'text-secondary'}`} />
                        <span className="truncate">{item.donor.city} - {item.donor.state}</span>
                    </div>
                    <h3 className={`text-sm sm:text-lg md:text-xl font-bold leading-tight transition-colors line-clamp-2 ${isDonated ? 'text-gray-500 group-hover:text-gray-700' : 'text-gray-800 group-hover:text-primary'}`}>
                        {item.title}
                    </h3>
                </div>

                <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-50">
                    <Link
                        to={`/item/${item.id}`}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all font-semibold text-sm sm:text-base group/btn shadow-sm min-h-[44px] sm:min-h-[48px] touch-manipulation ${
                            isDonated
                                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                : 'bg-gray-50 text-gray-700 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-green-200/50'
                        }`}
                    >
                        {isDonated ? 'Item Já Doado' : 'Ver Detalhes'}
                        <ArrowRight size={16} className="sm:w-5 sm:h-5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
