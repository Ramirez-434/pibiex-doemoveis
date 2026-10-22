import { useState } from 'react';
import { Leaf, Heart, Users, Sparkles, Recycle, HandHeart, Handshake } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const MotivationSection = () => {
    const [imgError, setImgError] = useState<Record<number, boolean>>({});

    const features = [
        {
            icon: Leaf,
            badgeIcon: Recycle,
            badgeText: "Economia Circular",
            title: "Sustentabilidade",
            description: "Dê uma segunda vida aos seus itens e ajude a reduzir o desperdício no planeta.",
            color: "text-green-600",
            bg: "bg-green-100",
            gradient: "from-emerald-500/20 via-green-500/5 to-transparent",
            borderHover: "hover:border-green-200",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
            illustration: (
                <svg className="w-full h-full opacity-20 group-hover:opacity-35 transition-opacity duration-500" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="160" cy="30" r="45" fill="url(#greenGrad)" />
                    <path d="M130 95C130 65 155 40 185 40C185 70 160 95 130 95Z" fill="#16A34A" fillOpacity="0.25" />
                    <path d="M150 105C150 85 168 68 190 68C190 88 172 105 150 105Z" fill="#22C55E" fillOpacity="0.3" />
                    <defs>
                        <radialGradient id="greenGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(160 30) rotate(90) scale(45)">
                            <stop stopColor="#22C55E" stopOpacity="0.4" />
                            <stop offset="1" stopColor="#22C55E" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                </svg>
            )
        },
        {
            icon: Heart,
            badgeIcon: HandHeart,
            badgeText: "Amor ao Próximo",
            title: "Solidariedade",
            description: "Seus itens parados podem se tornar úteis e marcar a diferença na vida de uma família vizinha.",
            color: "text-red-500",
            bg: "bg-red-100",
            gradient: "from-rose-500/20 via-red-500/5 to-transparent",
            borderHover: "hover:border-red-200",
            image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
            illustration: (
                <svg className="w-full h-full opacity-20 group-hover:opacity-35 transition-opacity duration-500" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="165" cy="25" r="50" fill="url(#redGrad)" />
                    <path d="M160 85C160 85 135 68 135 52C135 43 142 36 150 36C155 36 159 39 160 43C161 39 165 36 170 36C178 36 185 43 185 52C185 68 160 85 160 85Z" fill="#EF4444" fillOpacity="0.25" />
                    <defs>
                        <radialGradient id="redGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(165 25) rotate(90) scale(50)">
                            <stop stopColor="#F43F5E" stopOpacity="0.4" />
                            <stop offset="1" stopColor="#F43F5E" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                </svg>
            )
        },
        {
            icon: Users,
            badgeIcon: Handshake,
            badgeText: "Rede do Bem",
            title: "Comunidade",
            description: "Fortaleça laços locais conectando-se com pessoas da sua região através da doação.",
            color: "text-blue-500",
            bg: "bg-blue-100",
            gradient: "from-blue-500/20 via-indigo-500/5 to-transparent",
            borderHover: "hover:border-blue-200",
            image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80",
            illustration: (
                <svg className="w-full h-full opacity-20 group-hover:opacity-35 transition-opacity duration-500" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="160" cy="30" r="48" fill="url(#blueGrad)" />
                    <circle cx="145" cy="55" r="14" fill="#3B82F6" fillOpacity="0.25" />
                    <circle cx="175" cy="50" r="12" fill="#6366F1" fillOpacity="0.25" />
                    <path d="M125 90C125 78 134 72 145 72C156 72 165 78 165 90" stroke="#3B82F6" strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" />
                    <path d="M158 88C158 78 165 73 175 73C185 73 192 78 192 88" stroke="#6366F1" strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" />
                    <defs>
                        <radialGradient id="blueGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(160 30) rotate(90) scale(48)">
                            <stop stopColor="#3B82F6" stopOpacity="0.4" />
                            <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                </svg>
            )
        }
    ];

    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-3 sm:px-4">
                <ScrollReveal>
                    <div className="text-center mb-10 sm:mb-12 md:mb-16">
                        <span className="text-xs sm:text-sm font-bold text-primary tracking-wider uppercase mb-2 sm:mb-3 block">Por que usar o Doe + Brasil?</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                            Pequenos gestos, <span className="text-gradient">grande impacto</span>
                        </h2>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 lg:gap-10">
                    {features.map((feature, idx) => (
                        <ScrollReveal key={idx} delay={idx * 150} className="h-full">
                            <div className={`group relative h-full rounded-2xl sm:rounded-3xl bg-gray-50/80 border border-gray-100 ${feature.borderHover} hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col overflow-hidden`}>
                                {/* Header com Imagem + Overlay Ilustrado */}
                                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-gray-100">
                                    {!imgError[idx] ? (
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            loading="lazy"
                                            onError={() => setImgError(prev => ({ ...prev, [idx]: true }))}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                                            <Sparkles size={40} className={feature.color} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                    {/* Badge superior sobre a imagem */}
                                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-gray-800 shadow-sm">
                                            <feature.badgeIcon size={13} className={feature.color} />
                                            {feature.badgeText}
                                        </span>
                                    </div>

                                    {/* Ícone Principal flutuando na borda da imagem */}
                                    <div className="absolute bottom-3 left-5 sm:left-6 z-10">
                                        <div className={`w-12 sm:w-14 h-12 sm:h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon size={24} className="sm:w-7 sm:h-7" />
                                        </div>
                                    </div>
                                </div>

                                {/* Corpo do Card com Ilustração Decorativa de Fundo */}
                                <div className="relative p-5 sm:p-6 md:p-8 flex flex-col flex-grow">
                                    <div className="absolute bottom-0 right-0 w-44 h-28 pointer-events-none select-none">
                                        {feature.illustration}
                                    </div>

                                    <h3 className="relative z-10 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="relative z-10 text-sm sm:text-base text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MotivationSection;
