#!/usr/bin/env python3
"""
Exemplo de uso do endpoint de avaliação de candidatos
"""
import requests
import json

# URL base do serviço (ajuste conforme necessário)
BASE_URL = "http://localhost:8000"

def evaluate_candidate_example():
    """Exemplo de avaliação de candidato"""
    
    # Dados do candidato
    resume_data = {
        "personal_info": {
            "name": "Ana Costa",
            "email": "ana.costa@email.com",
            "phone": "(11) 99999-9999"
        },
        "education": [
            {
                "degree": "Bacharelado em Ciência da Computação",
                "institution": "Universidade de São Paulo",
                "year": "2021",
                "gpa": "8.5"
            },
            {
                "degree": "MBA em Gestão de Projetos",
                "institution": "FGV",
                "year": "2023",
                "gpa": "9.0"
            }
        ],
        "experience": [
            {
                "title": "Desenvolvedora Full Stack Senior",
                "company": "Tech Solutions Ltda",
                "duration": "3 anos",
                "description": "Liderança de equipe de 5 desenvolvedores, desenvolvimento de aplicações web com React, Node.js e Python. Implementação de arquitetura microserviços."
            },
            {
                "title": "Desenvolvedora Frontend",
                "company": "StartupXYZ",
                "duration": "2 anos",
                "description": "Desenvolvimento de interfaces de usuário com React e TypeScript. Otimização de performance e acessibilidade."
            }
        ],
        "skills": [
            "JavaScript", "TypeScript", "React", "Node.js", "Python", 
            "Docker", "AWS", "Git", "Agile", "Scrum"
        ],
        "languages": [
            {"language": "Português", "level": "Nativo"},
            {"language": "Inglês", "level": "Avançado"},
            {"language": "Espanhol", "level": "Intermediário"}
        ],
        "achievements": [
            "Redução de 40% no tempo de carregamento das aplicações",
            "Implementação de CI/CD que reduziu deploys de 2 horas para 15 minutos",
            "Mentoria de 3 desenvolvedores juniores"
        ]
    }
    
    # Dados da vaga
    job_data = {
        "title": "Tech Lead Full Stack",
        "description": "Liderança técnica de equipe de desenvolvimento, arquitetura de sistemas, desenvolvimento de aplicações web escaláveis.",
        "requirements": [
            "Experiência com React, Node.js e Python",
            "Conhecimento em arquitetura de microserviços",
            "Experiência em liderança técnica",
            "Conhecimento em AWS e Docker",
            "Experiência com metodologias ágeis"
        ],
        "responsibilities": [
            "Liderar equipe de desenvolvimento",
            "Definir arquitetura técnica",
            "Code review e mentoria",
            "Participar de decisões técnicas",
            "Desenvolver features críticas"
        ],
        "education_required": "Bacharelado em Ciência da Computação ou áreas relacionadas",
        "experience_required": "5+ anos em desenvolvimento, 2+ anos em liderança",
        "skills_required": [
            "JavaScript", "TypeScript", "React", "Node.js", "Python",
            "Docker", "AWS", "Git", "Liderança técnica"
        ]
    }
    
    # Respostas das perguntas
    question_responses = [
        {
            "question": "Como você lidera uma equipe técnica?",
            "answer": "Promovo comunicação clara, estabeleço processos de code review, faço pair programming e incentivo o aprendizado contínuo. Uso metodologias ágeis e reuniões diárias para acompanhar o progresso."
        },
        {
            "question": "Qual sua experiência com arquitetura de microserviços?",
            "answer": "Implementei arquitetura de microserviços em 3 projetos, usando Docker e Kubernetes. Defini APIs RESTful e padrões de comunicação entre serviços. Trabalhei com service mesh e monitoramento distribuído."
        },
        {
            "question": "Como você lida com prazos apertados?",
            "answer": "Priorizo tarefas por impacto e urgência, divido projetos em sprints menores, comunico expectativas realistas e uso ferramentas de gestão de projeto. Mantenho a qualidade do código mesmo sob pressão."
        }
    ]
    
    # Monta a requisição
    request_data = {
        "resume": resume_data,
        "job": job_data,
        "question_responses": question_responses,
        "provider": "openai",  # ou "anthropic"
        "model": "gpt-4"  # ou outro modelo disponível
    }
    
    try:
        # Faz a requisição
        response = requests.post(
            f"{BASE_URL}/ai/evaluate-candidate",
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Avaliação realizada com sucesso!")
            print("\n📊 Resultados da Avaliação:")
            print(f"   Nota Geral: {result['overall_score']}/100")
            print(f"   Respostas das Perguntas: {result['question_responses_score']}/100")
            print(f"   Formação Acadêmica: {result['education_score']}/100")
            print(f"   Experiência Profissional: {result['experience_score']}/100")
            print(f"   Provider: {result['provider']}")
            print(f"   Modelo: {result.get('model', 'N/A')}")
            
            # Análise detalhada
            print("\n📋 Análise Detalhada:")
            if result['overall_score'] >= 80:
                print("   🟢 Excelente candidato - Altamente recomendado")
            elif result['overall_score'] >= 60:
                print("   🟡 Bom candidato - Recomendado com ressalvas")
            else:
                print("   🔴 Candidato não adequado - Não recomendado")
                
        else:
            print(f"❌ Erro na requisição: {response.status_code}")
            print(f"Resposta: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")


def evaluate_candidate_simple():
    """Exemplo simplificado de avaliação"""
    
    request_data = {
        "resume": {
            "personal_info": {"name": "João Silva"},
            "education": [
                {
                    "degree": "Técnico em Informática",
                    "institution": "Escola Técnica",
                    "year": "2020"
                }
            ],
            "experience": [
                {
                    "title": "Desenvolvedor Frontend",
                    "company": "Empresa ABC",
                    "duration": "1 ano",
                    "description": "Desenvolvimento com React"
                }
            ],
            "skills": ["HTML", "CSS", "JavaScript", "React"]
        },
        "job": {
            "title": "Desenvolvedor Frontend",
            "description": "Desenvolvimento de interfaces web",
            "requirements": ["React", "JavaScript"],
            "education_required": "Técnico em Informática",
            "experience_required": "1+ anos"
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ai/evaluate-candidate",
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Avaliação simples realizada!")
            print(f"Nota Geral: {result['overall_score']}/100")
        else:
            print(f"❌ Erro: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")


if __name__ == "__main__":
    print("🚀 Exemplo de Avaliação de Candidatos")
    print("=" * 50)
    
    print("\n1. Avaliação Completa:")
    evaluate_candidate_example()
    
    print("\n" + "=" * 50)
    print("\n2. Avaliação Simplificada:")
    evaluate_candidate_simple()
