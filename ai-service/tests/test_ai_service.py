"""
Testes para o AI Service
"""
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


def test_generate_text():
    """Testa geração de texto"""
    response = client.post("/ai/generate-text", json={
        "prompt": "Olá, como você está?",
        "max_tokens": 50
    })
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert "provider" in data


def test_chat():
    """Testa chat"""
    response = client.post("/ai/chat", json={
        "messages": [{"role": "user", "content": "Olá"}],
        "max_tokens": 50
    })
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert "provider" in data


def test_embedding():
    """Testa geração de embedding"""
    response = client.post("/ai/embedding", json={
        "text": "Texto para embedding"
    })
    assert response.status_code == 200
    data = response.json()
    assert "embedding" in data
    assert "provider" in data


def test_get_providers():
    """Testa obtenção de providers"""
    response = client.get("/ai/providers")
    assert response.status_code == 200
    data = response.json()
    assert "available_providers" in data


def test_evaluate_candidate():
    """Testa avaliação de candidato"""
    request_data = {
        "resume": {
            "personal_info": {
                "name": "João Silva",
                "email": "joao@email.com"
            },
            "education": [
                {
                    "degree": "Bacharelado em Ciência da Computação",
                    "institution": "Universidade Federal",
                    "year": "2020"
                }
            ],
            "experience": [
                {
                    "title": "Desenvolvedor Full Stack",
                    "company": "Tech Corp",
                    "duration": "2 anos",
                    "description": "Desenvolvimento de aplicações web com React e Node.js"
                }
            ],
            "skills": ["JavaScript", "React", "Node.js", "Python"]
        },
        "job": {
            "title": "Desenvolvedor Full Stack Senior",
            "description": "Desenvolvimento de aplicações web modernas",
            "requirements": ["React", "Node.js", "TypeScript"],
            "education_required": "Bacharelado em Ciência da Computação",
            "experience_required": "3+ anos"
        },
        "question_responses": [
            {
                "question": "Como você lida com prazos apertados?",
                "answer": "Organizo as tarefas por prioridade e uso metodologias ágeis"
            }
        ]
    }
    
    response = client.post("/ai/evaluate-candidate", json=request_data)
    assert response.status_code == 200
    data = response.json()
    
    # Verifica se todas as notas estão presentes
    assert "overall_score" in data
    assert "question_responses_score" in data
    assert "education_score" in data
    assert "experience_score" in data
    assert "provider" in data
    
    # Verifica se as notas estão no intervalo correto
    assert 0 <= data["overall_score"] <= 100
    assert 0 <= data["question_responses_score"] <= 100
    assert 0 <= data["education_score"] <= 100
    assert 0 <= data["experience_score"] <= 100


def test_evaluate_candidate_without_questions():
    """Testa avaliação de candidato sem respostas de perguntas"""
    request_data = {
        "resume": {
            "personal_info": {
                "name": "Maria Santos",
                "email": "maria@email.com"
            },
            "education": [
                {
                    "degree": "Técnico em Informática",
                    "institution": "Escola Técnica",
                    "year": "2019"
                }
            ],
            "experience": [
                {
                    "title": "Desenvolvedor Frontend",
                    "company": "Startup XYZ",
                    "duration": "1 ano",
                    "description": "Desenvolvimento de interfaces com React"
                }
            ],
            "skills": ["HTML", "CSS", "JavaScript", "React"]
        },
        "job": {
            "title": "Desenvolvedor Frontend",
            "description": "Desenvolvimento de interfaces de usuário",
            "requirements": ["React", "JavaScript", "CSS"],
            "education_required": "Técnico ou Superior em Informática",
            "experience_required": "1+ anos"
        }
    }
    
    response = client.post("/ai/evaluate-candidate", json=request_data)
    assert response.status_code == 200
    data = response.json()
    
    # Verifica se todas as notas estão presentes
    assert "overall_score" in data
    assert "question_responses_score" in data
    assert "education_score" in data
    assert "experience_score" in data


def test_health_check():
    """Testa health check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"


def test_root():
    """Testa endpoint raiz"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
