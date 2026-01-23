import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

interface ItemProps {
    id: string;
    title: string;
    images: string[];
    condition: string;
    donor: {
        city: string;
        state: string;
    };
}

const ItemCard = ({ item }: { item: ItemProps }) => {
    return (
        <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">
            <div className="h-64 bg-gray-100 relative overflow-hidden">
                {item.images[0] ? (
                    <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <span className="text-sm font-medium">Sem imagem</span>
                    </div>
                )}

                <div className="absolute top-4 right-4 z-10">
                    <span className={`
            px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/20
            ${item.condition === 'NOVO' ? 'bg-green-500/90 text-white' :
                            item.condition === 'BOM' ? 'bg-blue-500/90 text-white' :
                                'bg-orange-500/90 text-white'}
          `}>
                        {item.condition}
                    </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white text-sm font-medium flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Clock size={16} /> Adicionado recentemente
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow relative">
                <div className="mb-4">
                    <div className="flex items-center text-gray-500 text-sm mb-2 font-medium">
                        <MapPin size={16} className="mr-1.5 text-secondary" />
                        <span className="truncate">{item.donor.city} - {item.donor.state}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                    </h3>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                    <Link
                        to={`/item/${item.id}`}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-50 text-gray-700 rounded-2xl hover:bg-primary hover:text-white transition-all font-bold group/btn shadow-sm hover:shadow-lg hover:shadow-green-200/50"
                    >
                        Ver Detalhes
                        <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
