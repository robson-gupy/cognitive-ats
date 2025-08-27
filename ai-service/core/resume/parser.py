"""
Parser de currículos usando IA
"""
import PyPDF2
import tempfile
import os
import logging
from typing import Dict, Any, Optional
from datetime import date
from shared.exceptions import ResumeParsingError
from shared.utils import extract_json_from_text, sanitize_text
from core.ai.service import AIService

# Configurar logger
logger = logging.getLogger(__name__)


class ResumeParser:
    """Serviço responsável por fazer parsing de currículos usando IA"""
    
    def __init__(self, ai_service: AIService):
        """
        Inicializa o parser de currículos
        
        Args:
            ai_service: Instância do AIService configurado
        """
        self.ai_service = ai_service
    
    async def parse_resume_from_pdf(self, pdf_path: str, application_id: str) -> Dict[str, Any]:
        """
        Faz parsing de um currículo a partir de um arquivo PDF
        
        Args:
            pdf_path: Caminho para o arquivo PDF
            application_id: ID da aplicação
            
        Returns:
            Dict com os dados do currículo parseado
        """
        logger.info("⏳ Iniciando parsing do currículo...")
        try:
            # Extrai texto do PDF
            pdf_text = self._extract_text_from_pdf(pdf_path)
            
            if not pdf_text.strip():
                raise ResumeParsingError("Não foi possível extrair texto do PDF")
            
            # Cria prompt para parsing
            prompt = self._create_resume_parse_prompt(pdf_text)
            
            # Log antes de chamar o serviço de IA
            logger.info("⏳ Aguardando resposta do serviço de IA para parsing do currículo...")
            
            # Gera parsing usando IA
            response = await self.ai_service.generate_text(
                prompt
            )
            
            # Log após receber resposta da IA
            logger.info(
                "✅ Resposta recebida do serviço de IA para parsing do currículo"
            )
            
            # Extrai dados do JSON
            resume_data = self._parse_json_response(response)
            
            # Cria modelo do currículo
            resume = self._create_resume_model(resume_data, application_id)
            
            return resume
            
        except Exception as e:
            raise ResumeParsingError(f"Erro ao fazer parsing do currículo: {str(e)}")
    
    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extrai texto de um arquivo PDF
        
        Args:
            pdf_path: Caminho para o arquivo PDF
            
        Returns:
            Texto extraído do PDF
        """
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = " "
                
                for page in pdf_reader.pages:
                    text += page.extract_text() + " \n"
                
                return sanitize_text(text)
                
        except Exception as e:
            raise ResumeParsingError(f"Erro ao extrair texto do PDF: {str(e)}")
    
    def _create_resume_parse_prompt(self, pdf_text: str) -> str:
        """
        Cria prompt para parsing de currículo
        
        Args:
            pdf_text: Texto extraído do PDF
            
        Returns:
            Prompt estruturado para a IA
        """
        try:
            # Lê o prompt do arquivo externo
            prompt_file_path = os.path.join(os.path.dirname(__file__), 'resume_parse.prompt')
            
            with open(prompt_file_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()
            
            # Substitui apenas a variável {pdf_text} usando replace (mais seguro)
            # Isso evita problemas com chaves {} no JSON de exemplo
            return prompt_template.replace('{pdf_text}', pdf_text)
            
        except FileNotFoundError:
            raise ResumeParsingError("Arquivo de prompt 'resume_parse.prompt' não encontrado")
        except Exception as e:
            raise ResumeParsingError(f"Erro ao ler arquivo de prompt: {str(e)}")
    
    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """
        Extrai e valida JSON da resposta da IA
        
        Args:
            response: Resposta da IA
            
        Returns:
            Dict com os dados do currículo
        """
        resume_data = extract_json_from_text(response)
        
        if not resume_data:
            raise ResumeParsingError("Não foi possível extrair JSON válido da resposta da IA")
        
        return resume_data
    
    def _create_resume_model(self, resume_data: Dict[str, Any], application_id: str) -> Dict[str, Any]:
        """
        Cria modelo do currículo a partir dos dados parseados
        
        Args:
            resume_data: Dados parseados do currículo
            application_id: ID da aplicação
            
        Returns:
            Dict com o modelo do currículo
        """
        resume = {
            "applicationId": application_id,
            "summary": resume_data.get("summary"),
            "professionalExperiences": [],
            "academicFormations": [],
            "achievements": [],
            "languages": []
        }
        
        # Processa experiências profissionais
        if "professionalExperiences" in resume_data:
            for exp in resume_data["professionalExperiences"]:
                if exp.get("companyName") and exp.get("position"):
                    resume["professionalExperiences"].append({
                        "companyName": exp["companyName"],
                        "position": exp["position"],
                        "startDate": exp.get("startDate"),
                        "endDate": exp.get("endDate"),
                        "isCurrent": exp.get("isCurrent", False),
                        "description": exp.get("description"),
                        "responsibilities": exp.get("responsibilities"),
                        "achievements": exp.get("achievements")
                    })
        
        # Processa formações acadêmicas
        if "academicFormations" in resume_data:
            for formation in resume_data["academicFormations"]:
                if formation.get("institution") and formation.get("course"):
                    resume["academicFormations"].append({
                        "institution": formation["institution"],
                        "course": formation["course"],
                        "degree": formation.get("degree", ""),
                        "startDate": formation.get("startDate"),
                        "endDate": formation.get("endDate"),
                        "isCurrent": formation.get("isCurrent", False),
                        "status": formation.get("status", "completed"),
                        "description": formation.get("description")
                    })
        
        # Processa achievements
        if "achievements" in resume_data:
            for achievement in resume_data["achievements"]:
                if achievement.get("title"):
                    resume["achievements"].append({
                        "title": achievement["title"],
                        "description": achievement.get("description")
                    })
        
        # Processa idiomas
        if "languages" in resume_data:
            for language in resume_data["languages"]:
                if language.get("language"):
                    resume["languages"].append({
                        "language": language["language"],
                        "proficiencyLevel": language.get("proficiencyLevel", "intermediate")
                    })
        
        return resume
    
    def _parse_date(self, date_str: str) -> Optional[date]:
        """
        Converte string de data para objeto date
        
        Args:
            date_str: String da data
            
        Returns:
            Objeto date ou None se inválido
        """
        if not date_str:
            return None
        
        try:
            return date.fromisoformat(date_str)
        except ValueError:
            return None
