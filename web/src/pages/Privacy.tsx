const Privacy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
                
                <div className="prose prose-orange max-w-none text-gray-700 space-y-4">
                    <p><strong>Última atualização:</strong> Junho de 2026</p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">1. Compromisso com a LGPD</h2>
                    <p>O <strong>Doe + Brasil</strong> está comprometido com a proteção e a privacidade dos seus dados pessoais. Esta Política foi elaborada em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">2. Dados que Coletamos</h2>
                    <p>Coletamos apenas os dados essenciais para o funcionamento da plataforma:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Dados de Cadastro:</strong> Nome completo, E-mail, Telefone, Cidade e Estado.</li>
                        <li><strong>Dados de Navegação:</strong> Informações técnicas básicas necessárias para a segurança da sua sessão.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Uso dos Dados</h2>
                    <p>Seus dados são utilizados exclusivamente para as seguintes finalidades:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Permitir o contato interno entre doador e beneficiário via chat seguro.</li>
                        <li>Notificações por e-mail sobre suas doações e solicitações.</li>
                        <li>Geração de métricas acadêmicas anonimizadas (ex: quantidade de famílias ajudadas).</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">4. Compartilhamento de Dados</h2>
                    <p>Nós <strong>não vendemos, alugamos ou repassamos</strong> seus dados pessoais para terceiros, marqueteiros ou empresas. Apenas o beneficiário aprovado poderá interagir com você no chat interno para combinar a retirada do móvel.</p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Seus Direitos (Art. 18 da LGPD)</h2>
                    <p>Você tem o direito de solicitar a exclusão de sua conta a qualquer momento entrando em contato com a administração. Ao solicitar a exclusão, aplicamos a técnica de <em>Soft Delete</em> com anonimização (ofuscamento) do seu e-mail para garantir a desvinculação completa da sua identidade, enquanto mantemos o histórico estatístico global intacto para fins de prestação de contas do projeto PIBIEX.</p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
