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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-light text-gray-800 mb-3">
                        {companyName}
                    </h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Esta empresa ainda não possui vagas publicadas no momento.
                    </p>
                    <div className="text-sm text-gray-500">
                        Volte mais tarde para ver as oportunidades disponíveis.
                    </div>
                </div>
            </div>
        );
    }

    // Se há vagas, mostrar a lista
    return <JobsList jobs={companyJobs.data} companyName={companyName} companySlug={slug} />;
}
