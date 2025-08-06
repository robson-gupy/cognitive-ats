#!/usr/bin/env python3
"""
Exemplo de uso da função parse_resume_from_pdf
"""

import asyncio
import os
from services.ai_service import AIService, AIProvider
from models import Resume


async def main():
    """
    Exemplo de como usar a função parse_resume_from_pdf
    """
    
    # Configura o serviço de IA
    ai_service = AIService(
        provider=AIProvider.OPENAI,
        api_key=os.getenv("OPENAI_API_KEY")  # Certifique-se de ter a variável de ambiente configurada
    )
    
    # Caminho para o arquivo PDF do currículo
    pdf_path = "/caminho/para/seu/curriculo.pdf"
    application_id = "123e4567-e89b-12d3-a456-426614174000"
    
    try:
        # Faz o parse do currículo
        resume = await ai_service.parse_resume_from_pdf(pdf_path, application_id)
        
        # Exibe os resultados
        print("=== RESUMO DO CURRÍCULO ===")
        print(f"Application ID: {resume.application_id}")
        print(f"Resumo: {resume.summary}")
        
        print("\n=== EXPERIÊNCIAS PROFISSIONAIS ===")
        for exp in resume.professional_experiences:
            print(f"- {exp.position} na {exp.company_name}")
            print(f"  Período: {exp.start_date} até {exp.end_date or 'Atual'}")
            print(f"  Descrição: {exp.description}")
            print()
        
        print("=== FORMAÇÕES ACADÊMICAS ===")
        for formation in resume.academic_formations:
            print(f"- {formation.degree} em {formation.course}")
            print(f"  Instituição: {formation.institution}")
            print(f"  Período: {formation.start_date} até {formation.end_date or 'Atual'}")
            print()
        
        print("=== CONQUISTAS ===")
        for achievement in resume.achievements:
            print(f"- {achievement.title}")
            if achievement.description:
                print(f"  {achievement.description}")
            print()
        
        print("=== IDIOMAS ===")
        for language in resume.languages:
            print(f"- {language.language}: {language.proficiency_level}")
        
        print("\n=== OBJETO RESUME COMPLETO ===")
        print(resume.model_dump_json(indent=2))
        
    except Exception as e:
        print(f"Erro ao processar o currículo: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main()) 