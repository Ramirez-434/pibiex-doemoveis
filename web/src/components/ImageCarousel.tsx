import React, { useState } from 'react';
import { Heart, Share2, MessageCircle, MapPin, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useToast } from './Toast';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { showToast } = useToast();

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    showToast(
      isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      'success'
    );
  };

  const handleShare = async () => {
    const text = `Confira este item para doação: ${title}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Doe + Brasil',
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copiado para clipboard!', 'success');
    }
  };

  return (
    <div className="relative w-full bg-gray-100 rounded-2xl overflow-hidden aspect-video group">
      {/* Main Image */}
      <img
        src={images[currentIndex]}
        alt={`${title} - Imagem ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition opacity-0 group-hover:opacity-100 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Imagem anterior"
          >
            <ChevronLeft size={20} className="text-gray-900" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition opacity-0 group-hover:opacity-100 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Próxima imagem"
          >
            <ChevronRight size={20} className="text-gray-900" />
          </button>
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          onClick={handleFavorite}
          className="bg-white/90 hover:bg-white rounded-full p-2 transition shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
        </button>
        <button
          onClick={handleShare}
          className="bg-white/90 hover:bg-white rounded-full p-2 transition shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          aria-label="Compartilhar"
        >
          <Share2 size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                index === currentIndex ? 'border-primary' : 'border-white/30'
              }`}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ isOpen, onClose, item }) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleRequest = () => {
    showToast('Solicitação de doação enviada com sucesso!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{item?.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {item?.images && (
            <ImageCarousel images={JSON.parse(item.images)} title={item.title} />
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{item?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Categoria</h3>
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {item?.category}
                </span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Condição</h3>
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {item?.condition === 'NOVO' && '✨ Novo'}
                  {item?.condition === 'BOM' && '👍 Bom Estado'}
                  {item?.condition === 'REPARO' && '🔧 Precisa de Reparo'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Informações do Doador</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span>{item?.donor?.city} - {item?.donor?.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span>Publicado há {Math.floor((Date.now() - new Date(item?.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 sm:p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition min-h-[48px] touch-manipulation"
          >
            Fechar
          </button>
          <button
            onClick={handleRequest}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Solicitar Doação</span>
            <span className="sm:hidden">Solicitar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
