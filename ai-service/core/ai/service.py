"""
Serviço principal de IA que gerencia diferentes providers
"""
import logging
from typing import Dict, Any, Optional, List
from shared.config import AIProvider, Config
from shared.exceptions import AIProviderError
from .factory import AIProviderFactory
from .base import BaseAIProvider

# Configurar logger
logger = logging.getLogger(__name__)


class AIService:
    """Serviço principal para gerenciar diferentes providers de IA"""
    
    def __init__(self, provider: AIProvider, api_key: Optional[str] = None, **kwargs):
        """
        Inicializa o serviço de IA
        
        Args:
            provider: Provider de IA a ser usado
            api_key: API key opcional
            **kwargs: Parâmetros adicionais para o provider
        """
        self.provider = provider
        self.provider_instance = AIProviderFactory.create_provider(provider, api_key, **kwargs)
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """
        Gera texto usando o provider configurado
        
        Args:
            prompt: Prompt para geração
            **kwargs: Parâmetros adicionais
            
        Returns:
            Texto gerado
        """
        return await self.provider_instance.generate_text(prompt, **kwargs)
    
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Gera resposta de chat usando o provider configurado
        
        Args:
            messages: Lista de mensagens
            **kwargs: Parâmetros adicionais
            
        Returns:
            Resposta gerada
        """
        return await self.provider_instance.generate_chat(messages, **kwargs)
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Gera embedding usando o provider configurado
        
        Args:
            text: Texto para gerar embedding
            
        Returns:
            Lista de floats representando o embedding
        """
        return await self.provider_instance.generate_embedding(text)
    
    def get_provider_info(self) -> Dict[str, Any]:
        """
        Retorna informações sobre o provider atual
        
        Returns:
            Dict com informações do provider
        """
        info = self.provider_instance.get_provider_info()
        info["available_providers"] = AIProviderFactory.get_available_providers()
        return info
    
    @classmethod
    def get_all_providers_info(cls) -> Dict[str, Any]:
        """
        Retorna informações sobre todos os providers disponíveis
        
        Returns:
            Dict com informações de todos os providers
        """
        providers_info = {}
        for provider in AIProvider:
            providers_info[provider.value] = AIProviderFactory.get_provider_info(provider)
        
        return {
            "available_providers": AIProviderFactory.get_available_providers(),
            "providers_info": providers_info
        }

    async def evaluate_candidate(self, resume_data: Dict[str, Any], job_data: Dict[str, Any], 
                               question_responses: Optional[List[Dict[str, str]]] = None, 
                               **kwargs) -> Dict[str, Any]:
        """
        Avalia a aderência de um candidato a uma vaga
        
        Args:
            resume_data: Dados do currículo do candidato
            job_data: Dados da vaga
            question_responses: Respostas das perguntas (opcional)
            **kwargs: Parâmetros adicionais
            
        Returns:
            Dict com as notas de avaliação
        """
        logger.info("🚀 Iniciando avaliação de candidato")
        logger.info(f"📋 Provider: {self.provider.value}")
        logger.info(f"🎯 Vaga: {job_data.get('title', 'N/A')}")
        logger.info(f"👤 Candidato: {resume_data.get('personal_info', {}).get('name', 'N/A')}")
        
        # Log dos dados do resume
        logger.info("📄 Dados do currículo:")
        logger.info(f"   - Formação: {len(resume_data.get('education', []))} registros")
        logger.info(f"   - Experiência: {len(resume_data.get('experience', []))} registros")
        logger.info(f"   - Habilidades: {len(resume_data.get('skills', []))} habilidades")
        logger.info(f"   - Idiomas: {len(resume_data.get('languages', []))} idiomas")
        
        # Log dos dados da vaga
        logger.info("💼 Dados da vaga:")
        logger.info(f"   - Requisitos: {len(job_data.get('requirements', []))} requisitos")
        logger.info(f"   - Formação necessária: {job_data.get('education_required', 'N/A')}")
        logger.info(f"   - Experiência necessária: {job_data.get('experience_required', 'N/A')}")
        
        # Log das respostas das perguntas
        if question_responses:
            logger.info(f"❓ Respostas das perguntas: {len(question_responses)} respostas")
            for i, qr in enumerate(question_responses, 1):
                logger.info(f"   Pergunta {i}: {qr.get('question', 'N/A')[:50]}...")
        else:
            logger.info("❓ Nenhuma resposta de pergunta fornecida")
        
        # Constrói o prompt para avaliação
        logger.info("🔧 Construindo prompt para avaliação...")
        prompt = self._build_evaluation_prompt(resume_data, job_data, question_responses)
        logger.info(f"📝 Tamanho do prompt: {len(prompt)} caracteres")
        
        # Gera a avaliação usando o provider
        logger.info("🤖 Chamando provider de IA para avaliação...")
        try:
            evaluation_text = await self.generate_text(prompt, **kwargs)
            logger.info(f"✅ Resposta recebida do provider ({len(evaluation_text)} caracteres)")
        except Exception as e:
            logger.error(f"❌ Erro ao gerar avaliação: {str(e)}")
            raise
        
        # Extrai as notas da resposta
        logger.info("📊 Extraindo notas da resposta...")
        scores = self._parse_evaluation_response(evaluation_text)
        
        # Log dos resultados
        logger.info("📈 Resultados da avaliação:")
        logger.info(f"   - Nota Geral: {scores['overall_score']}/100")
        logger.info(f"   - Respostas das Perguntas: {scores['question_responses_score']}/100")
        logger.info(f"   - Formação Acadêmica: {scores['education_score']}/100")
        logger.info(f"   - Experiência Profissional: {scores['experience_score']}/100")
        
        # Análise qualitativa
        overall_score = scores['overall_score']
        if overall_score >= 80:
            logger.info("🟢 Excelente candidato - Altamente recomendado")
        elif overall_score >= 60:
            logger.info("🟡 Bom candidato - Recomendado com ressalvas")
        else:
            logger.info("🔴 Candidato não adequado - Não recomendado")
        
        logger.info("✅ Avaliação de candidato concluída com sucesso")
        
        return scores
    
    def _build_evaluation_prompt(self, resume_data: Dict[str, Any], job_data: Dict[str, Any], 
                                question_responses: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Constrói o prompt para avaliação do candidato
        """
        prompt = f"""
Você é um especialista em recursos humanos e precisa avaliar a aderência de um candidato a uma vaga.

VAGA:
Título: {job_data.get('title', 'N/A')}
Descrição: {job_data.get('description', 'N/A')}
Requisitos: {job_data.get('requirements', [])}
Responsabilidades: {job_data.get('responsibilities', [])}
Formação necessária: {job_data.get('education_required', 'N/A')}
Experiência necessária: {job_data.get('experience_required', 'N/A')}
Habilidades necessárias: {job_data.get('skills_required', [])}

CURRÍCULO DO CANDIDATO:
Informações pessoais: {resume_data.get('personal_info', {})}
Formação acadêmica: {resume_data.get('education', [])}
Experiência profissional: {resume_data.get('experience', [])}
Habilidades: {resume_data.get('skills', [])}
Idiomas: {resume_data.get('languages', [])}
Conquistas: {resume_data.get('achievements', [])}
"""

        if question_responses:
            prompt += "\nRESPOSTAS DAS PERGUNTAS:\n"
            for i, qr in enumerate(question_responses, 1):
                prompt += f"Pergunta {i}: {qr.get('question', 'N/A')}\n"
                prompt += f"Resposta {i}: {qr.get('answer', 'N/A')}\n"

        prompt += """
Avalie o candidato considerando os seguintes critérios e retorne APENAS um JSON válido com as seguintes chaves:

1. overall_score (0-100): Nota geral de aderência do candidato à vaga
2. question_responses_score (0-100): Aderência das respostas das perguntas ao que se espera para a vaga
3. education_score (0-100): Aderência da formação acadêmica aos requisitos da vaga
4. experience_score (0-100): Aderência da experiência profissional aos requisitos da vaga

Considere:
- Relevância da experiência para a vaga
- Adequação da formação acadêmica
- Qualidade das respostas às perguntas
- Alinhamento geral do perfil

Retorne APENAS o JSON, sem texto adicional:
"""

        return prompt
    
    def _parse_evaluation_response(self, response_text: str) -> Dict[str, Any]:
        """
        Extrai as notas da resposta do modelo de IA
        """
        import json
        import re
        
        try:
            # Tenta extrair JSON da resposta
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                scores = json.loads(json_str)
                
                # Valida e normaliza as notas
                scores = {
                    'overall_score': self._normalize_score(scores.get('overall_score', 0)),
                    'question_responses_score': self._normalize_score(scores.get('question_responses_score', 0)),
                    'education_score': self._normalize_score(scores.get('education_score', 0)),
                    'experience_score': self._normalize_score(scores.get('experience_score', 0))
                }
                
                return scores
            else:
                # Fallback: retorna notas padrão
                return {
                    'overall_score': 50,
                    'question_responses_score': 50,
                    'education_score': 50,
                    'experience_score': 50
                }
                
        except (json.JSONDecodeError, KeyError, TypeError):
            # Em caso de erro, retorna notas padrão
            return {
                'overall_score': 50,
                'question_responses_score': 50,
                'education_score': 50,
                'experience_score': 50
            }
    
    def _normalize_score(self, score: Any) -> int:
        """
        Normaliza uma nota para o intervalo 0-100
        """
        try:
            score = int(float(score))
            return max(0, min(100, score))
        except (ValueError, TypeError):
            return 50
