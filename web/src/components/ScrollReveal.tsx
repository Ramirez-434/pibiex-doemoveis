
import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
    children: ReactNode;
    threshold?: number;
    delay?: number;
    className?: string;
    animation?: 'fade-up' | 'fade-in' | 'slide-in' | 'scale-up';
}

const ScrollReveal = ({
    children,
    threshold = 0.2,
    delay = 0,
    className = "",
    animation = 'fade-up'
}: ScrollRevealProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: threshold,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    const getAnimationClass = () => {
        // We reuse existing keyframes from index.css or define inline styles if needed
        // Assuming we rely on the `isVisible` state to toggle classes
        if (!isVisible) return 'opacity-0 translate-y-10'; // Initial state (hidden)

        switch (animation) {
            case 'fade-up':
                return 'opacity-100 translate-y-0';
            case 'fade-in':
                return 'opacity-100';
            case 'scale-up':
                return 'opacity-100 scale-100';
            default:
                return 'opacity-100 translate-y-0';
        }
    };

    const initialStyle = !isVisible ? {
        opacity: 0,
        transform: animation === 'fade-up' ? 'translateY(20px)' :
            animation === 'scale-up' ? 'scale(0.95)' : 'none',
        transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
    } : {
        opacity: 1,
        transform: animation === 'fade-up' ? 'translateY(0)' :
            animation === 'scale-up' ? 'scale(1)' : 'none',
        transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
    };

    return (
        <div
            ref={ref}
            className={`${className}`} // Removed base transition classes to control them via style for dynamic delay
            style={initialStyle}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
