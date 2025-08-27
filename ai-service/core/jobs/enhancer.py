"""
Serviço para melhoria de jobs usando IA
"""
import os
from typing import Dict, Any, Optional
from shared.exceptions import JobCreationError
from shared.utils import sanitize_text
from core.ai.service import AIService


class JobEnhancer:
    """Serviço responsável por melhorar jobs usando IA"""
    
    def __init__(self, ai_service: AIService):
        """
        Inicializa o serviço de melhoria de jobs
        
        Args:
            ai_service: Instância do AIService configurado
        """
        self.ai_service = ai_service
    
    async def enhance_job_description(self, job: Dict[str, Any], enhancement_prompt: str) -> Dict[str, Any]:
        """
        Melhora a descrição de um job usando IA
        
        Args:
            job: Dados do job atual
            enhancement_prompt: Prompt específico para melhoria
            
        Returns:
            Job com descrição melhorada
        """
        try:
            # Cria prompt para melhoria
            prompt = self._create_enhancement_prompt(job, enhancement_prompt)
            
            # Gera texto melhorado
            enhanced_description = await self.ai_service.generate_text(
                prompt,
                temperature=0.7,
                max_tokens=1500
            )
            
            # Sanitiza e atualiza o job
            enhanced_job = job.copy()
            enhanced_job["description"] = sanitize_text(enhanced_description)
            
            return enhanced_job
            
        except Exception as e:
            raise JobCreationError(f"Erro ao melhorar descrição do job: {str(e)}")
    
    async def enhance_job_requirements(self, job: Dict[str, Any], enhancement_prompt: str) -> Dict[str, Any]:
        """
        Melhora os requisitos de um job usando IA
        
        Args:
            job: Dados do job atual
            enhancement_prompt: Prompt específico para melhoria
            
        Returns:
            Job com requisitos melhorados
        """
        try:
            # Cria prompt para melhoria
            prompt = self._create_requirements_enhancement_prompt(job, enhancement_prompt)
            
            # Gera texto melhorado
            enhanced_requirements = await self.ai_service.generate_text(
                prompt,
                temperature=0.7,
                max_tokens=1000
            )
            
            # Sanitiza e atualiza o job
            enhanced_job = job.copy()
            enhanced_job["requirements"] = sanitize_text(enhanced_requirements)
            
            return enhanced_job
            
        except Exception as e:
            raise JobCreationError(f"Erro ao melhorar requisitos do job: {str(e)}")
    
    async def enhance_job_title(self, job: Dict[str, Any], enhancement_prompt: str) -> Dict[str, Any]:
        """
        Melhora o título de um job usando IA
        
        Args:
            job: Dados do job atual
            enhancement_prompt: Prompt específico para melhoria
            
        Returns:
            Job com título melhorado
        """
        try:
            # Cria prompt para melhoria
            prompt = self._create_title_enhancement_prompt(job, enhancement_prompt)
            
            # Gera texto melhorado
            enhanced_title = await self.ai_service.generate_text(
                prompt,
                temperature=0.8,
                max_tokens=100
            )
            
            # Sanitiza e atualiza o job
            enhanced_job = job.copy()
            enhanced_job["title"] = sanitize_text(enhanced_title)
            
            return enhanced_job
            
        except Exception as e:
            raise JobCreationError(f"Erro ao melhorar título do job: {str(e)}")
    
    def _create_enhancement_prompt(self, job: Dict[str, Any], enhancement_prompt: str) -> str:
        """Cria prompt para melhoria da descrição"""
        try:
            # Lê o prompt do arquivo externo
            prompt_file_path = os.path.join(os.path.dirname(__file__), 'job_description_enhancement.prompt')
            
            with open(prompt_file_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()
            
            # Substitui as variáveis no template
            return prompt_template.format(
                job=job,
                enhancement_prompt=enhancement_prompt
            )
            
        except FileNotFoundError:
            raise JobCreationError("Arquivo de prompt 'job_description_enhancement.prompt' não encontrado")
        except Exception as e:
            raise JobCreationError(f"Erro ao ler arquivo de prompt: {str(e)}")
    
    def _create_requirements_enhancement_prompt(self, job: Dict[str, Any], enhancement_prompt: str) -> str:
        """Cria prompt para melhoria dos requisitos"""
        try:
            # Lê o prompt do arquivo externo
            prompt_file_path = os.path.join(os.path.dirname(__file__), 'job_requirements_enhancement.prompt')
            
            with open(prompt_file_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()
            
            # Substitui as variáveis no template
            return prompt_template.format(
                job=job,
                enhancement_prompt=enhancement_prompt
            )
            
        except FileNotFoundError:
            raise JobCreationError("Arquivo de prompt 'job_requirements_enhancement.prompt' não encontrado")
        except Exception as e:
            raise JobCreationError(f"Erro ao ler arquivo de prompt: {str(e)}")
    
    def _create_title_enhancement_prompt(self, job: Dict[str, Any], enhancement_prompt: str) -> str:
        """Cria prompt para melhoria do título"""
        try:
            # Lê o prompt do arquivo externo
            prompt_file_path = os.path.join(os.path.dirname(__file__), 'job_title_enhancement.prompt')
            
            with open(prompt_file_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()
            
            # Substitui as variáveis no template
            return prompt_template.format(
                job=job,
                enhancement_prompt=enhancement_prompt
            )
            
        except FileNotFoundError:
            raise JobCreationError("Arquivo de prompt 'job_title_enhancement.prompt' não encontrado")
        except Exception as e:
            raise JobCreationError(f"Erro ao ler arquivo de prompt: {str(e)}")
