import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Upload, Loader2, MapPin } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import api from '../../services/api';

const categories = ['ELETRONICOS', 'ROUPAS', 'MOVEIS', 'LIVROS', 'UTENSÍLIOS', 'BRINQUEDOS', 'ESPORTES', 'SAUDE', 'OUTROS'];
const conditions = ['Excelente', 'Bom', 'Aceitável'];

const NewItem = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingCount, setUploadingCount] = useState(0); // quantas imagens estão subindo
    const [uploadProgress, setUploadProgress] = useState<string[]>([]); // nomes dos arquivos em progresso
    const [error, setError] = useState('');
    const storedUser = (() => {
        try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : {}; } catch { return {}; }
    })();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        condition: '',
        images: [] as string[],
        city: storedUser.city || '',
        state: storedUser.state || '',
        cep: '',
        quantity: 1,
    });
    const [cepLoading, setCepLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        const remainingSlots = 4 - formData.images.length;
        const filesToProcess = files.slice(0, remainingSlots);

        if (filesToProcess.length === 0) return;

        setUploadingCount(filesToProcess.length);
        setUploadProgress(filesToProcess.map(f => f.name));
        setError('');

        // Upload em paralelo
        const uploadPromises = filesToProcess.map(async (file) => {
            try {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                    initialQuality: 0.8
                };
                const compressedFile = await imageCompression(file, options);
                const formDataUpload = new FormData();
                formDataUpload.append('image', compressedFile, compressedFile.name || 'image.jpg');
                const response = await api.post('/upload', formDataUpload);
                return response.data.url as string;
            } catch (err) {
                console.error('Upload failed for:', file.name, err);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUrls = results.filter((url): url is string => url !== null);
        const failedCount = results.filter(r => r === null).length;

        if (failedCount > 0) {
            setError(`${failedCount} foto(s) falharam no upload. As demais foram salvas.`);
        }

        if (successfulUrls.length > 0) {
            setFormData((prev: any) => ({
                ...prev,
                images: [...prev.images, ...successfulUrls]
            }));
        }

        setUploadingCount(0);
        setUploadProgress([]);
        // Reset input para permitir reselecionar os mesmos arquivos
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        const newImages = formData.images.filter((_: string, i: number) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setFormData(prev => ({ ...prev, cep: raw }));
        const clean = raw.replace(/\D/g, '');
        if (clean.length === 8) {
            setCepLoading(true);
            try {
                const res = await axios.get(`https://viacep.com.br/ws/${clean}/json/`, { timeout: 3000 });
                if (res.data && !res.data.erro) {
                    setFormData(prev => ({ ...prev, city: res.data.localidade, state: res.data.uf }));
                }
            } catch { /* silently ignore */ }
            finally { setCepLoading(false); }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.city.trim()) {
            setError('Informe a cidade do item.');
            return;
        }

        if (formData.images.length === 0) {
            setError('Adicione pelo menos uma imagem do item.');
            return;
        }

        setLoading(true);

        try {
            // Atualiza cidade/estado no perfil do doador
            const updatedUser = { ...storedUser, city: formData.city.trim(), state: formData.state.trim() };
            await api.patch('/auth/profile', { city: formData.city.trim(), state: formData.state.trim() });
            localStorage.setItem('user', JSON.stringify(updatedUser));

            await api.post('/items', {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                condition: formData.condition,
                images: formData.images,
                quantity: formData.quantity,
            });
            navigate('/painel/minhas-doacoes');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao criar doação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full px-3 sm:px-4 md:px-0 animate-fade-in-up">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Doar Novo Item</h1>
                <p className="text-sm sm:text-base text-gray-500">Preencha as informações do item que deseja doar.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border border-red-100 flex items-start gap-2 animate-shake text-sm sm:text-base">
                    <X size={18} className="flex-shrink-0 mt-0.5" /> <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-8 md:p-10 space-y-8 sm:space-y-10">
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Título do Anúncio</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all font-medium text-gray-800 text-base min-h-[44px] sm:min-h-auto touch-manipulation"
                        placeholder="Ex: Item em bom estado"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Categoria</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white font-medium text-gray-800 text-base min-h-[44px] sm:min-h-auto touch-manipulation"
                            required
                        >
                            <option value="">Selecione...</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Condição</label>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {conditions.map(cond => (
                                <button
                                    key={cond}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, condition: cond })}
                                    className={`py-3 px-2 rounded-xl text-center font-medium text-sm sm:text-base transition-all ${
                                        formData.condition === cond
                                            ? 'border-2 border-primary text-primary bg-primary/10'
                                            : 'border-2 border-dashed border-gray-400 text-gray-700 hover:border-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {cond}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Quantidade ── */}
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Quantidade disponível <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                            className="w-11 h-11 rounded-xl border-2 border-gray-300 font-bold text-xl text-gray-600 hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                        >−</button>
                        <span className="w-12 text-center font-bold text-2xl text-gray-800">{formData.quantity}</span>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, quantity: Math.min(99, p.quantity + 1) }))}
                            className="w-11 h-11 rounded-xl border-2 border-gray-300 font-bold text-xl text-gray-600 hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                        >+</button>
                        <span className="text-xs text-gray-400 ml-1">unidade(s)</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary" />
                        Localização do Item <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                name="cep"
                                value={formData.cep}
                                onChange={handleCepChange}
                                maxLength={9}
                                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all font-medium text-gray-800 text-base min-h-[44px] touch-manipulation"
                                placeholder="CEP (opcional)"
                            />
                            {cepLoading && (
                                <Loader2 size={14} className="animate-spin text-primary absolute right-3 top-1/2 -translate-y-1/2" />
                            )}
                        </div>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all font-medium text-gray-800 text-base min-h-[44px] touch-manipulation"
                            placeholder="Cidade *"
                            required
                        />
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            maxLength={2}
                            className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all font-medium text-gray-800 text-base min-h-[44px] touch-manipulation uppercase"
                            placeholder="UF"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Digite o CEP para preencher automaticamente, ou informe a cidade manualmente.</p>
                </div>

                <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Descrição Detalhada</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none font-medium text-gray-800 text-base touch-manipulation"
                        placeholder="Descreva o estado do item, medidas aproximadas, etc."
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-3">Fotos do Item</label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 mb-4">
                        {formData.images.map((img: string, index: number) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                                <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}

                        {formData.images.length < 4 && (
                            <label className={`
                                relative aspect-square rounded-xl border-2 border-dashed border-gray-400 hover:border-primary hover:bg-green-50/50 
                                flex flex-col items-center justify-center cursor-pointer transition-all group
                                ${uploadingCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                            `}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploadingCount > 0}
                                    multiple
                                />
                                {uploadingCount > 0 ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="animate-spin text-primary" size={24} />
                                        <span className="text-xs font-bold text-primary text-center px-1">
                                            {uploadingCount === 1 ? 'Enviando...' : `Enviando ${uploadingCount} fotos...`}
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:text-primary transition-colors text-gray-400">
                                            <Upload size={18} className="sm:w-5 sm:h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-primary text-center px-1">Adicionar Fotos</span>
                                        <span className="text-[10px] text-gray-400 mt-0.5">Selecione várias</span>
                                    </>
                                )}
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                        Adicione até 4 fotos de uma vez. Formatos aceitos: JPG, PNG.
                    </p>
                    {uploadProgress.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {uploadProgress.map((name, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    <Loader2 size={10} className="animate-spin" />
                                    {name.length > 20 ? name.slice(0, 18) + '...' : name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-2 sm:pt-4">
                    <button
                        type="submit"
                        disabled={loading || uploadingCount > 0}
                        className="w-full bg-primary text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 min-h-[48px] sm:min-h-auto touch-manipulation"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="sm:w-6 sm:h-6 animate-spin" />
                                <span className="text-sm sm:text-base">Publicando...</span>
                            </>
                        ) : (
                            <>
                                Publicar Doação <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewItem;
