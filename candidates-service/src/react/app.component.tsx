// src/react/App.tsx
import React from 'react';

export function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">G</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-xl font-semibold text-gray-900">Gupy Candidates</h1>
                            </div>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Início</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Vagas</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Candidatos</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Sobre</a>
                        </nav>
                        <div className="flex items-center space-x-4">
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                                Entrar
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Encontre as Melhores
                        <span className="text-indigo-600 block">Oportunidades</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Conectamos candidatos talentosos com empresas inovadoras. 
                        Nossa plataforma utiliza inteligência artificial para criar 
                        matches perfeitos entre perfis e vagas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg">
                            Buscar Vagas
                        </button>
                        <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-indigo-600 shadow-lg">
                            Cadastrar CV
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Por que escolher a Gupy?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Nossa plataforma oferece recursos avançados para otimizar 
                            sua jornada profissional
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">IA Inteligente</h3>
                            <p className="text-gray-600">
                                Nossa IA analisa perfis e vagas para criar matches perfeitos, 
                                aumentando suas chances de sucesso.
                            </p>
                        </div>
                        
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Processo Rápido</h3>
                            <p className="text-gray-600">
                                Aplicações simplificadas e feedback em tempo real para 
                                acelerar sua busca por oportunidades.
                            </p>
                        </div>
                        
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Comunidade Ativa</h3>
                            <p className="text-gray-600">
                                Conecte-se com outros profissionais e receba dicas 
                                valiosas para sua carreira.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-indigo-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">50K+</div>
                            <div className="text-indigo-200">Candidatos Ativos</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">1K+</div>
                            <div className="text-indigo-200">Empresas Parceiras</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">10K+</div>
                            <div className="text-indigo-200">Vagas Disponíveis</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">95%</div>
                            <div className="text-indigo-200">Taxa de Sucesso</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Pronto para dar o próximo passo?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Junte-se a milhares de profissionais que já encontraram 
                        suas oportunidades ideais através da nossa plataforma.
                    </p>
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg">
                        Começar Agora
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-lg">G</span>
                                </div>
                                <span className="text-xl font-semibold">Gupy Candidates</span>
                            </div>
                            <p className="text-gray-400">
                                Conectando talentos com oportunidades através de tecnologia inovadora.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Produto</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 Gupy Candidates. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
