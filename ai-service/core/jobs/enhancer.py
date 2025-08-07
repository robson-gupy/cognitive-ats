"""
Serviço para melhoria de jobs usando IA
"""
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
        return f"""
Você é um especialista em recrutamento e seleção. Melhore a descrição do seguinte job com base na solicitação fornecida.

Job atual:
Título: {job.get('title', 'N/A')}
Descrição atual: {job.get('description', 'N/A')}
Requisitos: {job.get('requirements', 'N/A')}

Solicitação de melhoria: {enhancement_prompt}

Por favor, forneça uma descrição melhorada que atenda à solicitação. A descrição deve ser:
1. Clara e detalhada
2. Atraente para candidatos qualificados
3. Específica sobre responsabilidades
4. Profissional e bem estruturada

Retorne apenas a descrição melhorada, sem texto adicional.
"""
    
    def _create_requirements_enhancement_prompt(self, job: Dict[str, Any], enhancement_prompt: str) -> str:
        """Cria prompt para melhoria dos requisitos"""
        return f"""
Você é um especialista em recrutamento e seleção. Melhore os requisitos do seguinte job com base na solicitação fornecida.

Job atual:
Título: {job.get('title', 'N/A')}
Descrição: {job.get('description', 'N/A')}
Requisitos atuais: {job.get('requirements', 'N/A')}

Solicitação de melhoria: {enhancement_prompt}

Por favor, forneça requisitos melhorados que atenda à solicitação. Os requisitos devem ser:
1. Específicos e mensuráveis
2. Realistas para o cargo
3. Organizados por prioridade
4. Incluir tanto requisitos obrigatórios quanto desejáveis

Retorne apenas os requisitos melhorados, sem texto adicional.
"""
    
    def _create_title_enhancement_prompt(self, job: Dict[str, Any], enhancement_prompt: str) -> str:
        """Cria prompt para melhoria do título"""
        return f"""
Você é um especialista em recrutamento e seleção. Melhore o título do seguinte job com base na solicitação fornecida.

Job atual:
Título atual: {job.get('title', 'N/A')}
Descrição: {job.get('description', 'N/A')}
Requisitos: {job.get('requirements', 'N/A')}

Solicitação de melhoria: {enhancement_prompt}

Por favor, forneça um título melhorado que atenda à solicitação. O título deve ser:
1. Claro e atrativo
2. Específico para o cargo
3. Com no máximo 255 caracteres
4. Profissional e adequado ao mercado

Retorne apenas o título melhorado, sem texto adicional.
"""
