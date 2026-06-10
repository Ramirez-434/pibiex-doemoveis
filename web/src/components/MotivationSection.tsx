import { Leaf, Heart, Users } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const MotivationSection = () => {
    const features = [
        {
            icon: Leaf,
            title: "Sustentabilidade",
            description: "Dê uma segunda vida aos seus itens e ajude a reduzir o desperdício no planeta.",
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            icon: Heart,
            title: "Solidariedade",
            description: "Seus itens parados podem se tornar úteis e marcar a diferença na vida de uma família vizinha.",
            color: "text-red-500",
            bg: "bg-red-100"
        },
        {
            icon: Users,
            title: "Comunidade",
            description: "Fortaleça laços locais conectando-se com pessoas da sua região através da doação.",
            color: "text-blue-500",
            bg: "bg-blue-100"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                    {features.map((feature, idx) => (
                        <ScrollReveal key={idx} delay={idx * 150} className="h-full">
                            <div className="group h-full p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                                <div className={`w-12 sm:w-14 h-12 sm:h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                    <feature.icon size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" />
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MotivationSection;
