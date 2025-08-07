"""
Serviço para criação de jobs usando IA
"""
import json
from typing import Dict, Any, Optional, List
from shared.exceptions import JobCreationError
from shared.utils import extract_json_from_text, sanitize_text
from core.ai.service import AIService
from shared.config import AIProvider


class JobCreator:
    """Serviço responsável por criar jobs usando IA"""
    
    def __init__(self, ai_service: AIService):
        """
        Inicializa o serviço de criação de jobs
        
        Args:
            ai_service: Instância do AIService configurado
        """
        self.ai_service = ai_service
    
    async def create_job_from_prompt(self, prompt: str, generate_questions: bool = True, 
                                   generate_stages: bool = True, max_questions: int = 5, 
                                   max_stages: int = 3, **kwargs) -> Dict[str, Any]:
        """
        Cria um Job preenchido usando IA baseado em um prompt
        
        Args:
            prompt: Descrição do job que será usado para gerar os campos
            generate_questions: Se deve gerar perguntas automaticamente
            generate_stages: Se deve gerar estágios automaticamente
            max_questions: Número máximo de perguntas a gerar
            max_stages: Número máximo de estágios a gerar
            **kwargs: Parâmetros adicionais para a geração de texto
            
        Returns:
            Dict com os dados do job criado
        """
        # Prompt estruturado para a IA
        structured_prompt = self._create_job_prompt(prompt)
        
        try:
            # Gera o texto usando IA
            kwargs_without_temp = {k: v for k, v in kwargs.items() if k != 'temperature'}
            response = await self.ai_service.generate_text(
                structured_prompt,
                temperature=kwargs.get('temperature', 0.9),
                **kwargs_without_temp
            )
            
            # Tenta extrair JSON da resposta
            job_data = self._extract_json_from_response(response)
            
            # Valida e cria o modelo Job
            job = self._validate_and_create_job(job_data)
            
            # Gera questions se solicitado
            questions = None
            if generate_questions:
                try:
                    questions = await self.generate_job_questions(job, max_questions)
                except Exception as e:
                    print(f"Aviso: Erro ao gerar perguntas: {e}")

            # Gera stages se solicitado
            stages = None
            if generate_stages:
                try:
                    stages = await self.generate_job_stages(job, max_stages)
                except Exception as e:
                    print(f"Aviso: Erro ao gerar estágios: {e}")

            return {
                "job": job,
                "questions": questions,
                "stages": stages
            }
            
        except Exception as e:
            raise JobCreationError(f"Erro ao criar job a partir do prompt: {str(e)}")
    
    def _create_job_prompt(self, user_prompt: str) -> str:
        """
        Cria um prompt estruturado para a IA gerar dados de Job
        
        Args:
            user_prompt: Prompt do usuário
            
        Returns:
            str: Prompt estruturado para a IA
        """
        return f"""
Você é um especialista em recrutamento e seleção. Com base na seguinte descrição, crie um job completo com todos os campos necessários.

Descrição fornecida: {user_prompt}

Por favor, retorne apenas um JSON válido com os seguintes campos:
{{
    "title": "Título da vaga (máximo 255 caracteres)",
    "description": "Descrição detalhada da vaga",
    "requirements": "Requisitos e qualificações necessárias"
}}

Regras importantes:
1. O título deve ser claro e atrativo
2. A descrição deve ser detalhada e incluir responsabilidades
3. Os requisitos devem ser específicos e realistas
4. Retorne APENAS o JSON, sem texto adicional
5. Use aspas duplas no JSON
"""
    
    def _extract_json_from_response(self, response: str) -> Dict[str, Any]:
        """
        Extrai JSON da resposta da IA
        
        Args:
            response: Resposta da IA
            
        Returns:
            Dict com os dados do job
        """
        # Tenta extrair JSON usando utilitário
        job_data = extract_json_from_text(response)
        
        if not job_data:
            raise JobCreationError("Não foi possível extrair JSON válido da resposta da IA")
        
        return job_data
    
    def _validate_and_create_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida e cria o job a partir dos dados
        
        Args:
            job_data: Dados do job
            
        Returns:
            Dict com o job validado
        """
        required_fields = ["title", "description", "requirements"]
        
        for field in required_fields:
            if field not in job_data or not job_data[field]:
                raise JobCreationError(f"Campo obrigatório '{field}' não encontrado ou vazio")
        
        # Sanitiza os campos
        job_data["title"] = sanitize_text(job_data["title"])
        job_data["description"] = sanitize_text(job_data["description"])
        job_data["requirements"] = sanitize_text(job_data["requirements"])
        
        return job_data
    
    async def generate_job_questions(self, job: Dict[str, Any], num_questions: int = 5) -> List[Dict[str, Any]]:
        """
        Gera perguntas para um job usando IA
        
        Args:
            job: Dados do job
            num_questions: Número de perguntas a gerar
            
        Returns:
            Lista de perguntas geradas
        """
        prompt = self._create_questions_prompt(job, num_questions)
        
        try:
            response = await self.ai_service.generate_text(
                prompt,
                temperature=0.8,
                max_tokens=1000
            )
            
            questions_data = extract_json_from_text(response)
            if not questions_data or "questions" not in questions_data:
                raise JobCreationError("Não foi possível extrair perguntas válidas da resposta da IA")
            
            return questions_data["questions"]
            
        except Exception as e:
            raise JobCreationError(f"Erro ao gerar perguntas: {str(e)}")
    
    async def generate_job_stages(self, job: Dict[str, Any], num_stages: int = 3) -> List[Dict[str, Any]]:
        """
        Gera estágios para um job usando IA
        
        Args:
            job: Dados do job
            num_stages: Número de estágios a gerar
            
        Returns:
            Lista de estágios gerados
        """
        prompt = self._create_stages_prompt(job, num_stages)
        
        try:
            response = await self.ai_service.generate_text(
                prompt,
                temperature=0.8,
                max_tokens=1000
            )
            
            stages_data = extract_json_from_text(response)
            if not stages_data or "stages" not in stages_data:
                raise JobCreationError("Não foi possível extrair estágios válidos da resposta da IA")
            
            return stages_data["stages"]
            
        except Exception as e:
            raise JobCreationError(f"Erro ao gerar estágios: {str(e)}")
    
    def _create_questions_prompt(self, job: Dict[str, Any], num_questions: int) -> str:
        """Cria prompt para geração de perguntas"""
        return f"""
Com base no seguinte job, gere {num_questions} perguntas relevantes para avaliar candidatos:

Título: {job['title']}
Descrição: {job['description']}
Requisitos: {job['requirements']}

Retorne apenas um JSON válido com a seguinte estrutura:
{{
    "questions": [
        {{
            "question": "Pergunta aqui",
            "orderIndex": 1,
            "isRequired": true
        }}
    ]
}}

As perguntas devem ser específicas para o cargo e ajudar a avaliar se o candidato tem as competências necessárias.
"""
    
    def _create_stages_prompt(self, job: Dict[str, Any], num_stages: int) -> str:
        """Cria prompt para geração de estágios"""
        return f"""
Com base no seguinte job, gere {num_stages} estágios para o processo seletivo:

Título: {job['title']}
Descrição: {job['description']}
Requisitos: {job['requirements']}

Retorne apenas um JSON válido com a seguinte estrutura:
{{
    "stages": [
        {{
            "name": "Nome do estágio",
            "description": "Descrição do estágio",
            "orderIndex": 1
        }}
    ]
}}

Os estágios devem seguir um fluxo lógico de seleção, como: Triagem inicial, Entrevista técnica, Entrevista final, etc.
"""
