import { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface SecurityBannerProps {
    chatId: string;
}

const SecurityBanner = ({ chatId }: SecurityBannerProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isHidden = localStorage.getItem(`hide_security_banner_${chatId}`);
        if (!isHidden) {
            setIsVisible(true);
        }
    }, [chatId]);

    const handleDismiss = () => {
        localStorage.setItem(`hide_security_banner_${chatId}`, 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-start justify-between sm:items-center">
            <div className="flex items-start sm:items-center gap-3 text-yellow-800 text-sm">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-yellow-600" />
                <p>
                    <strong>Dica de Segurança:</strong> Nunca faça depósitos prévios para fretes e prefira marcar a retirada em locais públicos.
                </p>
            </div>
            <button 
                onClick={handleDismiss}
                className="text-yellow-600 hover:text-yellow-800 transition-colors ml-4 p-1 rounded-md hover:bg-yellow-100 flex-shrink-0"
                title="Fechar aviso"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

export default SecurityBanner;
