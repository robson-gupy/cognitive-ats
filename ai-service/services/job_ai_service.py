import json
from typing import Optional, Dict, Any
from pydantic import ValidationError
from models import Job
from services.ai_service import AIService, AIProvider


class JobAIService:
    """Serviço responsável por lidar com Jobs usando IA"""
    
    def __init__(self, ai_service: AIService):
        """
        Inicializa o serviço de IA para Jobs
        
        Args:
            ai_service: Instância do AIService configurado
        """
        self.ai_service = ai_service
    
    async def create_job_from_prompt(self, prompt: str, generate_questions: bool = True, generate_stages: bool = True, max_questions: int = 5, max_stages: int = 3, **kwargs) -> Job:
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
            Job: Modelo Job preenchido com os dados gerados pela IA
        """
        # Prompt estruturado para a IA
        structured_prompt = self._create_job_prompt(prompt)
        
        try:
            # Gera o texto usando IA
            response = await self.ai_service.generate_text(
                structured_prompt,
                temperature=0.9,
                **kwargs
            )
            
            # Tenta extrair JSON da resposta
            job_data = self._extract_json_from_response(response)
            
            # Valida e cria o modelo Job
            job = self._validate_and_create_job(job_data)
            
            # Gera questions se solicitado
            if generate_questions:
                try:
                    questions_data = await self.generate_job_questions(job, max_questions)
                    job.questions = self._create_job_questions_from_data(questions_data)
                except Exception as e:
                    print(f"Aviso: Erro ao gerar perguntas: {e}")

            return job
            
        except Exception as e:
            raise Exception(f"Erro ao criar job a partir do prompt: {str(e)}")
    
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
    "requirements": "Requisitos e qualificações necessárias",
    "expiration_date": "YYYY-MM-DD (data de expiração, pode ser null)",
    "status": "DRAFT|PUBLISHED|CLOSED|PAUSED (padrão: DRAFT)"
}}

Regras importantes:
1. O título deve ser claro e atrativo
2. A descrição deve ser detalhada e incluir responsabilidades
3. Os requisitos devem ser específicos e realistas
4. Se não houver data de expiração específica, use null
5. O status padrão deve ser DRAFT
6. Retorne APENAS o JSON, sem texto adicional
7. Use aspas duplas no JSON
8. Para datas, use formato YYYY-MM-DD
"""
    
    def _extract_json_from_response(self, response: str) -> Dict[str, Any]:
        """
        Extrai JSON da resposta da IA
        
        Args:
            response: Resposta da IA
            
        Returns:
            Dict[str, Any]: Dados extraídos do JSON
        """
        try:
            # Remove possíveis textos antes e depois do JSON
            response = response.strip()
            
            # Tenta encontrar JSON na resposta
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("JSON não encontrado na resposta")
            
            json_str = response[start_idx:end_idx]
            return json.loads(json_str)
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Erro ao decodificar JSON da resposta: {str(e)}")
        except Exception as e:
            raise ValueError(f"Erro ao extrair JSON da resposta: {str(e)}")
    
    def _validate_and_create_job(self, job_data: Dict[str, Any]) -> Job:
        """
        Valida os dados e cria um modelo Job
        
        Args:
            job_data: Dados do job extraídos da IA
            
        Returns:
            Job: Modelo Job válido
        """
        try:
            # Mapeia os dados para o formato esperado pelo modelo
            mapped_data = {
                "title": job_data.get("title", ""),
                "description": job_data.get("description", ""),
                "requirements": job_data.get("requirements", ""),
                "expiration_date": job_data.get("expiration_date"),
                "status": job_data.get("status", "DRAFT"),
                "published_at": None,
                "closed_at": None,
                "created_at": None,  # Será preenchido pelo sistema
                "updated_at": None,  # Será preenchido pelo sistema
                "questions": [],
                "stages": []
            }
            
            # Cria o modelo Job
            job = Job(**mapped_data)
            return job
            
        except ValidationError as e:
            raise ValueError(f"Erro de validação do modelo Job: {str(e)}")
        except Exception as e:
            raise ValueError(f"Erro ao criar modelo Job: {str(e)}")
    
    async def enhance_job_description(self, job: Job, enhancement_prompt: str) -> Job:
        """
        Melhora a descrição de um job existente usando IA
        
        Args:
            job: Job existente
            enhancement_prompt: Prompt para melhorar a descrição
            
        Returns:
            Job: Job com descrição melhorada
        """
        prompt = f"""
Melhore a seguinte descrição de vaga com base no prompt fornecido.

Descrição atual: {job.description}

Prompt de melhoria: {enhancement_prompt}

Retorne apenas a nova descrição melhorada, sem formatação adicional.
"""
        
        try:
            improved_description = await self.ai_service.generate_text(
                prompt,
                max_tokens=1000,
                temperature=0.7
            )
            
            # Atualiza a descrição do job
            job.description = improved_description.strip()
            return job
            
        except Exception as e:
            raise Exception(f"Erro ao melhorar descrição do job: {str(e)}")
    
    async def generate_job_questions(self, job: Job, num_questions: int = 5) -> list:
        """
        Gera perguntas para um job usando IA
        
        Args:
            job: Job para o qual gerar perguntas
            num_questions: Número de perguntas a gerar
            
        Returns:
            list: Lista de perguntas geradas
        """
        prompt = f"""
Com base na seguinte vaga, gere {num_questions} perguntas relevantes para candidatos:

Título: {job.title}
Descrição: {job.description}
Requisitos: {job.requirements}

Retorne apenas um JSON com a seguinte estrutura:
{{
    "questions": [
        {{
            "question": "Texto da pergunta",
            "order_index": 1,
            "is_required": true
        }}
    ]
}}

As perguntas devem ser relevantes para avaliar se o candidato tem as qualificações necessárias.
"""
        
        try:
            response = await self.ai_service.generate_text(
                prompt,
                max_tokens=1500,
                temperature=0.7
            )
            
            data = self._extract_json_from_response(response)
            return data.get("questions", [])
            
        except Exception as e:
            raise Exception(f"Erro ao gerar perguntas para o job: {str(e)}")
    
    async def generate_job_stages(self, job: Job, num_stages: int = 3) -> list:
        """
        Gera estágios para um job usando IA
        
        Args:
            job: Job para o qual gerar estágios
            num_stages: Número de estágios a gerar
            
        Returns:
            list: Lista de estágios gerados
        """
        prompt = f"""
Com base na seguinte vaga, gere {num_stages} estágios do processo seletivo:

Título: {job.title}
Descrição: {job.description}
Requisitos: {job.requirements}

Retorne apenas um JSON com a seguinte estrutura:
{{
    "stages": [
        {{
            "name": "Nome do estágio",
            "description": "Descrição do que será avaliado neste estágio",
            "order_index": 1,
            "is_active": true
        }}
    ]
}}

Os estágios devem seguir um fluxo lógico de recrutamento como:
1. Triagem inicial
2. Entrevista técnica
3. Entrevista comportamental
4. Teste prático
5. Entrevista final
"""
        
        try:
            response = await self.ai_service.generate_text(
                prompt,
                max_tokens=1500,
                temperature=0.7
            )
            
            data = self._extract_json_from_response(response)
            return data.get("stages", [])
            
        except Exception as e:
            raise Exception(f"Erro ao gerar estágios para o job: {str(e)}")
    
    def _create_job_questions_from_data(self, questions_data: list) -> list:
        """
        Cria objetos JobQuestion a partir dos dados gerados pela IA
        
        Args:
            questions_data: Lista de dados de perguntas
            
        Returns:
            list: Lista de objetos JobQuestion
        """
        from models import JobQuestion
        
        questions = []
        for i, question_data in enumerate(questions_data, 1):
            try:
                question = JobQuestion(
                    id=None,  # Será gerado pelo sistema
                    question=question_data.get("question", ""),
                    order_index=question_data.get("order_index", i),
                    is_required=question_data.get("is_required", True),
                    job_id=None,  # Será definido quando o job for salvo
                    created_at=None,  # Será preenchido pelo sistema
                    updated_at=None   # Será preenchido pelo sistema
                )
                questions.append(question)
            except Exception as e:
                print(f"Aviso: Erro ao criar pergunta {i}: {e}")
        
        return questions
    
    def _create_job_stages_from_data(self, stages_data: list) -> list:
        """
        Cria objetos JobStage a partir dos dados gerados pela IA
        
        Args:
            stages_data: Lista de dados de estágios
            
        Returns:
            list: Lista de objetos JobStage
        """
        from models import JobStage
        
        stages = []
        for i, stage_data in enumerate(stages_data, 1):
            try:
                stage = JobStage(
                    id=None,  # Será gerado pelo sistema
                    name=stage_data.get("name", f"Estágio {i}"),
                    description=stage_data.get("description", ""),
                    order_index=stage_data.get("order_index", i),
                    is_active=stage_data.get("is_active", True),
                    job_id=None,  # Será definido quando o job for salvo
                    created_at=None,  # Será preenchido pelo sistema
                    updated_at=None   # Será preenchido pelo sistema
                )
                stages.append(stage)
            except Exception as e:
                print(f"Aviso: Erro ao criar estágio {i}: {e}")
        
        return stages 