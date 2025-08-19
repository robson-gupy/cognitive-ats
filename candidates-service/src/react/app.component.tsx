// src/react/App.tsx
import React from 'react';
import { CompanyJobsResponse } from '../app.service';
import { JobsList } from './JobsList';

interface AppProps {
  slug?: string;
  companyJobs?: CompanyJobsResponse;
}

export function App({ slug, companyJobs }: AppProps) {
    const companyName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Gupy';
    const hasJobs = companyJobs && companyJobs.success && companyJobs.data.length > 0;

    // Se não há vagas, mostrar mensagem simples
    if (!hasJobs) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {companyName} - Vagas
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Esta empresa ainda não possui vagas publicadas.
                    </p>
                    <div className="text-sm text-gray-500">
                        Volte mais tarde para ver as oportunidades disponíveis.
                    </div>
                </div>
            </div>
        );
    }

    // Se há vagas, mostrar a lista
    return <JobsList jobs={companyJobs.data} companyName={companyName} />;
}
