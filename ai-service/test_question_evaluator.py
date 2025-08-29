#!/usr/bin/env python3
"""
Teste simples para o QuestionEvaluator
"""
import asyncio
import os
import sys
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent))

from core.question_evaluator import QuestionEvaluator
from core.ai.service import AIService
from shared.config import AIProvider


async def test_question_evaluator():
    """Testa o QuestionEvaluator com dados de exemplo"""
    
    # Verificar se há API key configurada
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY não configurada")
        print("Configure a variável de ambiente OPENAI_API_KEY para testar")
        return
    
    try:
        # Configurar o serviço de IA
        print("🔧 Configurando AIService...")
        ai_service = AIService(
            provider=AIProvider.OPENAI,
            api_key=api_key
        )
        
        # Criar instância do avaliador
        print("🔧 Criando QuestionEvaluator...")
        evaluator = QuestionEvaluator(ai_service)
        
        # Dados de teste
        job_data = {
            "title": "Desenvolvedor Python",
            "description": "Desenvolvedor Python para criar APIs e sistemas web",
            "requirements": "Python, FastAPI, SQL, experiência com desenvolvimento web"
        }
        
        question_responses = [
            {
                "question": "Como você implementaria uma API REST?",
                "answer": "Usaria FastAPI para criar endpoints, definir modelos Pydantic para validação, implementar autenticação JWT e usar SQLAlchemy para banco de dados."
            },
            {
                "question": "Explique o que é um ORM",
                "answer": "ORM (Object-Relational Mapping) é uma técnica que permite trabalhar com banco de dados usando objetos Python ao invés de SQL direto, facilitando o desenvolvimento e manutenção."
            }
        ]
        
        print("🚀 Iniciando avaliação das respostas...")
        print(f"Vaga: {job_data['title']}")
        print(f"Número de perguntas: {len(question_responses)}")
        
        # Avaliar as respostas
        evaluation = await evaluator.evaluate_question_responses(
            question_responses=question_responses,
            job_data=job_data,
            temperature=0.3
        )
        
        print("\n✅ Avaliação concluída!")
        print("=" * 50)
        print(f"Score geral: {evaluation['score']}/100")
        print(f"Feedback: {evaluation['feedback']}")
        
        if evaluation.get('improvement_areas'):
            print(f"\nÁreas de melhoria:")
            for area in evaluation['improvement_areas']:
                print(f"  • {area}")
        
        if evaluation.get('details'):
            details = evaluation['details']
            print(f"\nDetalhes da avaliação:")
            if 'relevance_score' in details:
                print(f"  • Relevância: {details['relevance_score']}/100")
            if 'specificity_score' in details:
                print(f"  • Especificidade: {details['specificity_score']}/100")
            if 'alignment_score' in details:
                print(f"  • Alinhamento: {details['alignment_score']}/100")
        
        print(f"\nProvider: {evaluation.get('provider', 'N/A')}")
        print(f"Modelo: {evaluation.get('model', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("🧪 Testando QuestionEvaluator")
    print("=" * 50)
    
    # Executar o teste
    asyncio.run(test_question_evaluator())
