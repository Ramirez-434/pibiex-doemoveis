import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20 pt-12 pb-6 border-t border-gray-800">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-800">
          {/* Sobre */}
          <div className="animate-fade-in-up">
            <h3 className="font-bold text-white mb-4 text-sm sm:text-base">Doe + Brasil</h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              Conectando corações e transformando vidas através da doação de produtos.
            </p>
          </div>

          {/* Navegação */}
          <div className="animate-fade-in-up delay-100">
            <h3 className="font-bold text-white mb-4 text-sm sm:text-base">Navegação</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="/" className="hover:text-primary transition">
                  Início
                </a>
              </li>
              <li>
                <a href="/catalogo" className="hover:text-primary transition">
                  Catálogo
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-primary transition">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-primary transition">
                  Cadastro
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="animate-fade-in-up delay-200">
            <h3 className="font-bold text-white mb-4 text-sm sm:text-base">Contato</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <a href="mailto:contato@doemaisbr.com.br" className="hover:text-primary transition">
                  contato@doemaisbr.com.br
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <a href="tel:+551133333333" className="hover:text-primary transition">
                  (11) 3333-3333
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div className="animate-fade-in-up delay-300">
            <h3 className="font-bold text-white mb-4 text-sm sm:text-base">Redes Sociais</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary transition flex items-center justify-center" title="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary transition flex items-center justify-center" title="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary transition flex items-center justify-center" title="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-400">
          <p>
            © {currentYear} Doe + Brasil. Feito com{' '}
            <Heart size={14} className="inline text-red-500 fill-red-500" /> para transformar vidas.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition">
              Privacidade
            </a>
            <a href="#" className="hover:text-primary transition">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
