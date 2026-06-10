const Terms = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
                
                <div className="prose prose-orange max-w-none text-gray-700 space-y-4">
                    <p><strong>Última atualização:</strong> Junho de 2026</p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">1. Aceitação dos Termos</h2>
                    <p>Ao acessar e utilizar a plataforma <strong>Doe + Brasil</strong>, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossa plataforma.</p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">2. Descrição do Serviço</h2>
                    <p>O Doe + Brasil é uma plataforma social sem fins lucrativos desenvolvida para conectar pessoas que desejam doar móveis com pessoas e famílias que precisam destes itens. Não nos responsabilizamos pelo transporte, qualidade ou veracidade dos itens anunciados, atuando apenas como intermediadores da comunicação.</p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Responsabilidades do Usuário</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Fornecer informações verdadeiras, exatas e atualizadas em seu cadastro.</li>
                        <li>Anunciar apenas itens que lhe pertencem e que estão em condições de uso ou reparo.</li>
                        <li>Tratar outros usuários com respeito no chat interno.</li>
                        <li>Combinar a retirada de forma segura e responsável.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">4. Itens Proibidos</h2>
                    <p>É estritamente proibido anunciar a venda de itens (cobrança de valores), solicitar dinheiro para frete através da plataforma, ou anunciar produtos ilícitos, perigosos ou que não se enquadrem na categoria de móveis e utilidades domésticas.</p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Modificações na Plataforma</h2>
                    <p>O Doe + Brasil reserva-se o direito de modificar, suspender ou descontinuar qualquer recurso da plataforma a qualquer momento, bem como banir usuários que violem estes termos, sem aviso prévio.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
