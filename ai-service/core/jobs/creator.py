"""
Serviço para criação de jobs usando IA
"""
import json
import os
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
        structured_prompt = self._create_job_prompt(prompt, max_questions, max_stages)

        try:
            # Gera o texto usando IA
            kwargs_without_temp = {k: v for k, v in kwargs.items() if k != 'temperature'}
            response = await self.ai_service.generate_text(
                structured_prompt,
                **kwargs_without_temp
            )

            # Tenta extrair JSON da resposta
            job_data = self._extract_json_from_response(response)

            print(f"job_data: {job_data}")

            # Valida e cria o modelo Job
            job = self._validate_and_create_job(job_data)
            print(f"job: {job}")

            return job

        except Exception as e:
            raise JobCreationError(f"Erro ao criar job a partir do prompt: {str(e)}")

    def _create_job_prompt(self, user_prompt: str, num_questions: int, num_stages: int) -> str:
        """
        Cria um prompt estruturado para a IA gerar dados de Job
        
        Args:
            user_prompt: Prompt do usuário
            
        Returns:
            str: Prompt estruturado para a IA
        """
        try:
            # Lê o prompt do arquivo de texto
            current_dir = os.path.dirname(os.path.abspath(__file__))
            prompt_file_path = os.path.join(current_dir, "job_creation.prompt")

            with open(prompt_file_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()

            # Substitui a variável {user_prompt} pelo prompt do usuário
            return prompt_template.format(
                user_prompt=user_prompt,
                num_questions=num_questions,
                num_stages=num_stages
            )

        except FileNotFoundError:
            raise JobCreationError("Arquivo de prompt não encontrado: job_creation.prompt")
        except Exception as e:
            raise JobCreationError(f"Erro ao ler arquivo de prompt: {str(e)}")

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
            if field not in job_data["job"] or not job_data["job"][field]:
                raise JobCreationError(f"Campo obrigatório '{field}' não encontrado ou vazio")

        # Sanitiza os campos
        job_data["job"]["title"] = sanitize_text(job_data["job"]["title"])
        job_data["job"]["description"] = sanitize_text(job_data["job"]["description"])
        job_data["job"]["requirements"] = sanitize_text(job_data["job"]["requirements"])

        for question in job_data["questions"]:
            question["question"] = sanitize_text(question["question"])

        for stage in job_data["stages"]:
            stage["name"] = sanitize_text(stage["name"])
            stage["description"] = sanitize_text(stage["description"])

        return job_data
