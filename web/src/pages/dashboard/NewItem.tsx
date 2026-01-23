import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';

const categories = ['SOFA', 'MESA', 'CADEIRA', 'CAMA', 'ARMARIO', 'ESTANTE', 'OUTROS'];
const conditions = ['NOVO', 'BOM', 'REPARO'];

const NewItem = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        condition: '',
        images: [] as string[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        setUploading(true);
        try {
            const response = await api.post('/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData((prev: any) => ({
                ...prev,
                images: [...prev.images, response.data.url]
            }));
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Falha ao fazer upload da imagem.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = formData.images.filter((_: string, i: number) => i !== index);
        setFormData({ ...formData, images: newImages });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.images.length === 0) {
            setError('Adicione pelo menos uma imagem do item.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/items', formData);
            navigate('/painel/minhas-doacoes');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao criar doação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Doar Novo Item</h1>
                <p className="text-gray-500">Preencha as informações do móvel que deseja doar.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2 animate-shake">
                    <X size={20} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-8">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Título do Anúncio</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                        placeholder="Ex: Sofá de 3 lugares confortável"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white font-medium"
                            required
                        >
                            <option value="">Selecione...</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Condição</label>
                        <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white font-medium"
                            required
                        >
                            <option value="">Selecione...</option>
                            {conditions.map(cond => (
                                <option key={cond} value={cond}>{cond}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição Detalhada</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none font-medium"
                        placeholder="Descreva o estado do item, medidas aproximadas, etc."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Fotos do Item</label>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.images.map((img: string, index: number) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                                <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}

                        {formData.images.length < 4 && (
                            <label className={`
                                relative aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-green-50/50 
                                flex flex-col items-center justify-center cursor-pointer transition-all group
                                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <Loader2 className="animate-spin text-primary" size={24} />
                                ) : (
                                    <>
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:text-primary transition-colors text-gray-400">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-primary">Adicionar Foto</span>
                                    </>
                                )}
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                        Adicione até 4 fotos. Formatos aceitos: JPG, PNG.
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                Publicando...
                            </>
                        ) : (
                            <>
                                Publicar Doação <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewItem;
