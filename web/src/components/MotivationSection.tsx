import { Leaf, Heart, Users } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const MotivationSection = () => {
    const features = [
        {
            icon: Leaf,
            title: "Sustentabilidade",
            description: "Dê uma segunda vida aos seus móveis e ajude a reduzir o desperdício no planeta.",
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            icon: Heart,
            title: "Solidariedade",
            description: "Seu móvel parado pode se tornar o conforto e o recomeço de uma família vizinha.",
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
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <span className="text-sm font-bold text-primary tracking-wider uppercase mb-2 block">Por que usar o DoeBrasil?</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                            Pequenos gestos, <span className="text-gradient">grande impacto</span>
                        </h2>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((feature, idx) => (
                        <ScrollReveal key={idx} delay={idx * 150} className="h-full">
                            <div className="group h-full p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
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
