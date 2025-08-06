from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import os
import json
from enum import Enum
import PyPDF2
from datetime import date, datetime


class AIProvider(Enum):
    """Enumeração dos providers de IA suportados"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    AZURE = "azure"
    COHERE = "cohere"


class CandidateScoreModel():
    name: str

class BaseAIProvider(ABC):
    """Classe base abstrata para implementar diferentes providers de IA"""
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        self.api_key = api_key or self._get_api_key_from_env()
        self.config = kwargs
    
    @abstractmethod
    def _get_api_key_from_env(self) -> str:
        """Obtém a chave da API da variável de ambiente específica do provider"""
        pass
    
    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Gera texto usando o provider específico"""
        pass
    
    @abstractmethod
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Gera resposta de chat usando o provider específico"""
        pass
    
    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """Gera embeddings usando o provider específico"""
        pass


class OpenAIProvider(BaseAIProvider):
    """Implementação do provider OpenAI"""
    
    def _get_api_key_from_env(self) -> str:
        """Obtém a chave da API OpenAI da variável de ambiente"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("API key não encontrada. Configure a variável de ambiente OPENAI_API_KEY ou passe como parâmetro")
        return api_key
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(api_key, **kwargs)
        try:
            import openai
            import httpx
            
            # Configuração específica para evitar problemas de compatibilidade
            # Cria um cliente HTTP customizado sem configurações problemáticas
            http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
            )
            
            self.client = openai.AsyncOpenAI(
                api_key=self.api_key,
                http_client=http_client
            )
        except ImportError:
            raise ImportError("openai package is required. Install with: pip install openai")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        model = kwargs.get('model', 'gpt-4.1')
        max_tokens = kwargs.get('max_tokens', 1000)
        
        try:
            response = await self.client.responses.create(
                model='gpt-4.1',
                input=prompt
            )
            return response.output_text
        except Exception as e:
            raise Exception(f"Erro ao gerar texto com OpenAI: {str(e)}")
    
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        model = kwargs.get('model', 'gpt-3.5-turbo')
        max_tokens = kwargs.get('max_tokens', 1000)
        
        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Erro ao gerar chat com OpenAI: {str(e)}")
    
    async def generate_embedding(self, text: str) -> List[float]:
        model = self.config.get('embedding_model', 'text-embedding-ada-002')
        
        try:
            response = await self.client.embeddings.create(
                model=model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            raise Exception(f"Erro ao gerar embedding com OpenAI: {str(e)}")

class AIService:
    """Serviço principal de IA configurável"""
    
    def __init__(self, provider: AIProvider, api_key: Optional[str] = None, **kwargs):
        """
        Inicializa o serviço de IA
        
        Args:
            provider: Provider de IA a ser usado
            api_key: Chave da API (opcional - se None, tenta pegar da variável de ambiente)
            **kwargs: Configurações adicionais específicas do provider
        """
        self.provider_enum = provider
        self.provider_instance = self._create_provider(provider, api_key, **kwargs)
    
    def _create_provider(self, provider: AIProvider, api_key: Optional[str] = None, **kwargs) -> BaseAIProvider:
        """Cria a instância do provider específico"""
        provider_map = {
            AIProvider.OPENAI: OpenAIProvider
        }
        
        provider_class = provider_map.get(provider)
        if not provider_class:
            raise ValueError(f"Provider {provider.value} não implementado")
        
        return provider_class(api_key=api_key, **kwargs)
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Gera texto usando o provider configurado"""
        return await self.provider_instance.generate_text(prompt, **kwargs)
    
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Gera resposta de chat usando o provider configurado"""
        return await self.provider_instance.generate_chat(messages, **kwargs)
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Gera embedding usando o provider configurado"""
        return await self.provider_instance.generate_embedding(text)
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o provider atual"""
        return {
            "provider": self.provider_enum.value,
            "provider_class": self.provider_instance.__class__.__name__,
            "has_embeddings": hasattr(self.provider_instance, 'generate_embedding'),
            "api_key_configured": bool(self.provider_instance.api_key)
        }
    
    async def parse_resume_from_pdf(self, pdf_path: str, application_id: str) -> 'Resume':
        """
        Faz o parse de um arquivo PDF de currículo e retorna um objeto Resume
        
        Args:
            pdf_path: Caminho para o arquivo PDF do currículo
            application_id: ID da aplicação associada ao currículo
            
        Returns:
            Resume: Objeto Resume com os dados extraídos do PDF
        """
        try:
            # Extrai o texto do PDF
            pdf_text = self._extract_text_from_pdf(pdf_path)
            
            # Gera o prompt para a OpenAI
            prompt = self._create_resume_parse_prompt(pdf_text)
            
            # Chama a API da OpenAI para fazer o parse
            response = await self.generate_chat([
                {"role": "system", "content": "Você é um especialista em análise de currículos. Sua tarefa é extrair informações estruturadas de currículos e retornar em formato JSON válido."},
                {"role": "user", "content": prompt}
            ], model="gpt-4", max_tokens=4000)
            
            # Parse da resposta JSON
            resume_data = self._parse_json_response(response)
            
            # Converte para o modelo Resume
            return self._create_resume_model(resume_data, application_id)
            
        except Exception as e:
            raise Exception(f"Erro ao fazer parse do currículo: {str(e)}")
    
    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extrai texto de um arquivo PDF"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            raise Exception(f"Erro ao extrair texto do PDF: {str(e)}")
    
    def _create_resume_parse_prompt(self, pdf_text: str) -> str:
        """Cria o prompt para a OpenAI fazer o parse do currículo"""
        return f"""
Analise o seguinte currículo e extraia as informações em formato JSON estruturado.

Texto do currículo:
{pdf_text}

Extraia as seguintes informações e retorne APENAS um JSON válido (sem texto adicional):

{{
    "summary": "Resumo profissional ou objetivo",
    "professionalExperiences": [
        {{
            "companyName": "Nome da empresa",
            "position": "Cargo",
            "startDate": "YYYY-MM-DD",
            "endDate": "YYYY-MM-DD ou null se atual",
            "isCurrent": false,
            "description": "Descrição do cargo",
            "responsibilities": "Responsabilidades",
            "achievements": "Conquistas"
        }}
    ],
    "academicFormations": [
        {{
            "institution": "Nome da instituição",
            "course": "Nome do curso",
            "degree": "Grau (Bacharelado, Mestrado, etc.)",
            "startDate": "YYYY-MM-DD",
            "endDate": "YYYY-MM-DD ou null se atual",
            "isCurrent": false,
            "status": "completed",
            "description": "Descrição do curso"
        }}
    ],
    "achievements": [
        {{
            "title": "Título da conquista",
            "description": "Descrição da conquista"
        }}
    ],
    "languages": [
        {{
            "language": "Nome do idioma",
            "proficiencyLevel": "Nível de proficiência (Básico, Intermediário, Avançado, Nativo)"
        }}
    ]
}}

Regras importantes:
1. Retorne APENAS o JSON, sem texto adicional
2. Use null para datas não especificadas
3. Se uma informação não estiver presente, use string vazia ou array vazio
4. Para datas, use formato YYYY-MM-DD
5. Se não conseguir extrair uma data específica, use uma data aproximada ou null
"""
    
    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """Parse da resposta JSON da OpenAI"""
        try:
            # Remove possíveis textos antes e depois do JSON
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            return json.loads(response)
        except json.JSONDecodeError as e:
            raise Exception(f"Erro ao fazer parse da resposta JSON: {str(e)}")
    
    def _create_resume_model(self, resume_data: Dict[str, Any], application_id: str) -> 'Resume':
        """Cria o modelo Resume a partir dos dados extraídos"""
        from models import Resume, ResumeProfessionalExperience, ResumeAcademicFormation, ResumeAchievement, ResumeLanguage
        
        # Converte datas de string para objetos date
        def parse_date(date_str: str) -> Optional[date]:
            if not date_str or date_str == "null":
                return None
            try:
                return datetime.strptime(date_str, "%Y-%m-%d").date()
            except:
                return None
        
        # Processa experiências profissionais
        professional_experiences = []
        for exp in resume_data.get("professionalExperiences", []):
            professional_experiences.append(ResumeProfessionalExperience(
                company_name=exp.get("companyName", ""),
                position=exp.get("position", ""),
                start_date=parse_date(exp.get("startDate")) or date.today(),
                end_date=parse_date(exp.get("endDate")),
                is_current=exp.get("isCurrent", False),
                description=exp.get("description", ""),
                responsibilities=exp.get("responsibilities", ""),
                achievements=exp.get("achievements", "")
            ))
        
        # Processa formações acadêmicas
        academic_formations = []
        for formation in resume_data.get("academicFormations", []):
            academic_formations.append(ResumeAcademicFormation(
                institution=formation.get("institution", ""),
                course=formation.get("course", ""),
                degree=formation.get("degree", ""),
                start_date=parse_date(formation.get("startDate")) or date.today(),
                end_date=parse_date(formation.get("endDate")),
                is_current=formation.get("isCurrent", False),
                status=formation.get("status", "completed"),
                description=formation.get("description", "")
            ))
        
        # Processa conquistas
        achievements = []
        for achievement in resume_data.get("achievements", []):
            achievements.append(ResumeAchievement(
                title=achievement.get("title", ""),
                description=achievement.get("description", "")
            ))
        
        # Processa idiomas
        languages = []
        for language in resume_data.get("languages", []):
            languages.append(ResumeLanguage(
                language=language.get("language", ""),
                proficiency_level=language.get("proficiencyLevel", "")
            ))
        
        # Cria o objeto Resume
        return Resume(
            application_id=application_id,
            summary=resume_data.get("summary", ""),
            professional_experiences=professional_experiences,
            academic_formations=academic_formations,
            achievements=achievements,
            languages=languages
        ) 