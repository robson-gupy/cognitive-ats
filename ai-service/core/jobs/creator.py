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
        structured_prompt = self._create_job_prompt(prompt)
        
        try:
            # Gera o texto usando IA
            kwargs_without_temp = {k: v for k, v in kwargs.items() if k != 'temperature'}
            response = await self.ai_service.generate_text(
                structured_prompt,
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
        try:
            # Lê o prompt do arquivo de texto
            current_dir = os.path.dirname(os.path.abspath(__file__))
            prompt_file_path = os.path.join(current_dir, "job_creation.prompt")
            
            with open(prompt_file_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()
            
            # Substitui a variável {user_prompt} pelo prompt do usuário
            return prompt_template.format(user_prompt=user_prompt)
            
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
                prompt
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
                prompt
            )
            
            stages_data = extract_json_from_text(response)
            if not stages_data or "stages" not in stages_data:
                raise JobCreationError("Não foi possível extrair estágios válidos da resposta da IA")
            
            return stages_data["stages"]
            
        except Exception as e:
            raise JobCreationError(f"Erro ao gerar estágios: {str(e)}")
    
    def _create_questions_prompt(self, job: Dict[str, Any], num_questions: int) -> str:
        """Cria prompt para geração de perguntas"""
        try:
            # Lê o prompt do arquivo externo
            prompt_file_path = os.path.join(os.path.dirname(__file__), 'job_questions.prompt')
            
            with open(prompt_file_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()
            
            # Substitui as variáveis no template
            return prompt_template.format(
                num_questions=num_questions,
                job=job
            )
            
        except FileNotFoundError:
            raise JobCreationError("Arquivo de prompt 'job_questions.prompt' não encontrado")
        except Exception as e:
            raise JobCreationError(f"Erro ao ler arquivo de prompt: {str(e)}")
    
    def _create_stages_prompt(self, job: Dict[str, Any], num_stages: int) -> str:
        """Cria prompt para geração de estágios"""
        try:
            # Lê o prompt do arquivo externo
            prompt_file_path = os.path.join(os.path.dirname(__file__), 'job_stages.prompt')
            
            with open(prompt_file_path, 'r', encoding='utf-8') as filename:
                prompt_template = filename.read()
            
            # Substitui as variáveis no template
            return prompt_template.format(
                num_stages=num_stages,
                job=job
            )
            
        except FileNotFoundError:
            raise JobCreationError("Arquivo de prompt 'job_stages.prompt' não encontrado")
        except Exception as e:
            raise JobCreationError(f"Erro ao ler arquivo de prompt: {str(e)}")
