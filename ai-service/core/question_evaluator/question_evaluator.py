"""
Serviço para avaliação de respostas de perguntas usando IA
"""
import json
import os
from typing import Dict, Any, Optional, List
from shared.exceptions import QuestionEvaluationError
from shared.utils import extract_json_from_text, sanitize_text
from core.ai.service import AIService
from shared.config import AIProvider


class QuestionEvaluator:
    """Serviço responsável por avaliar respostas de perguntas usando IA"""

    def __init__(self, ai_service: AIService):
        """
        Inicializa o serviço de avaliação de perguntas
        
        Args:
            ai_service: Instância do AIService configurado
        """
        self.ai_service = ai_service

    async def evaluate_question_responses(
        self, 
        question_responses: List[Dict[str, str]], 
        job_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Avalia as respostas das perguntas usando IA para gerar um score de 0 a 100
        
        Args:
            question_responses: Lista de respostas das perguntas
            job_data: Dados da vaga (título, descrição, requisitos, etc.)
            **kwargs: Parâmetros adicionais para a geração de texto
            
        Returns:
            Dict com o score das respostas e detalhes da avaliação
        """
        # Prompt estruturado para a IA
        structured_prompt = self._create_evaluation_prompt(question_responses, job_data)

        try:
            # Gera o texto usando IA
            kwargs_without_temp = {k: v for k, v in kwargs.items() if k != 'temperature'}
            response = await self.ai_service.generate_text(
                structured_prompt,
                **kwargs_without_temp
            )

            # Tenta extrair JSON da resposta
            evaluation_data = self._extract_json_from_response(response)

            print(f"evaluation_data: {evaluation_data}")

            # Valida e retorna os dados da avaliação
            validated_evaluation = self._validate_evaluation_data(evaluation_data)
            print(f"validated_evaluation: {validated_evaluation}")

            return validated_evaluation

        except Exception as e:
            raise QuestionEvaluationError(f"Erro ao avaliar respostas das perguntas: {str(e)}")

    def _create_evaluation_prompt(
        self, 
        question_responses: List[Dict[str, str]], 
        job_data: Dict[str, Any]
    ) -> str:
        """
        Cria um prompt estruturado para a IA avaliar as respostas
        
        Args:
            question_responses: Lista de respostas das perguntas
            job_data: Dados da vaga
            
        Returns:
            str: Prompt estruturado para a IA
        """
        try:
            # Lê o prompt do arquivo de texto
            current_dir = os.path.dirname(os.path.abspath(__file__))
            prompt_file_path = os.path.join(current_dir, "question_evaluation.prompt")

            with open(prompt_file_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()

            # Formata as respostas das perguntas
            formatted_responses = []
            for i, response in enumerate(question_responses, 1):
                formatted_responses.append(
                    f"Pergunta {i}: {response.get('question', 'N/A')}\n"
                    f"Resposta {i}: {response.get('answer', 'N/A')}\n"
                )

            # Substitui as variáveis no template
            return prompt_template.format(
                job_title=job_data.get('title', 'N/A'),
                job_description=job_data.get('description', 'N/A'),
                job_requirements=job_data.get('requirements', 'N/A'),
                question_responses='\n'.join(formatted_responses),
                num_questions=len(question_responses)
            )

        except FileNotFoundError:
            raise QuestionEvaluationError("Arquivo de prompt não encontrado: question_evaluation.prompt")
        except Exception as e:
            raise QuestionEvaluationError(f"Erro ao ler arquivo de prompt: {str(e)}")

    def _extract_json_from_response(self, response: str) -> Dict[str, Any]:
        """
        Extrai JSON da resposta da IA
        
        Args:
            response: Resposta da IA
            
        Returns:
            Dict com os dados extraídos
        """
        try:
            # Tenta extrair JSON usando a função utilitária
            json_data = extract_json_from_text(response)
            return json_data
        except Exception as e:
            # Fallback: tenta extrair manualmente
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                raise QuestionEvaluationError("Não foi possível extrair JSON da resposta da IA")

    def _validate_evaluation_data(self, evaluation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida e normaliza os dados da avaliação
        
        Args:
            evaluation_data: Dados da avaliação
            
        Returns:
            Dict com dados validados
        """
        try:
            # Valida o score principal
            score = evaluation_data.get('score', 0)
            if not isinstance(score, (int, float)) or score < 0 or score > 100:
                score = 50  # Score padrão se inválido

            # Valida os detalhes da avaliação
            details = evaluation_data.get('details', {})
            if not isinstance(details, dict):
                details = {}

            # Valida o feedback
            feedback = evaluation_data.get('feedback', '')
            if not isinstance(feedback, str):
                feedback = ''

            # Valida as áreas de melhoria
            improvement_areas = evaluation_data.get('improvement_areas', [])
            if not isinstance(improvement_areas, list):
                improvement_areas = []

            return {
                'score': int(score),
                'details': details,
                'feedback': feedback,
                'improvement_areas': improvement_areas,
                'evaluated_at': evaluation_data.get('evaluated_at', ''),
                'provider': evaluation_data.get('provider', ''),
                'model': evaluation_data.get('model', '')
            }

        except Exception as e:
            raise QuestionEvaluationError(f"Erro ao validar dados da avaliação: {str(e)}")

    async def evaluate_single_response(
        self, 
        question: str, 
        answer: str, 
        job_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Avalia uma única resposta de pergunta
        
        Args:
            question: Pergunta feita
            answer: Resposta do candidato
            job_data: Dados da vaga
            **kwargs: Parâmetros adicionais
            
        Returns:
            Dict com a avaliação da resposta
        """
        return await self.evaluate_question_responses(
            [{'question': question, 'answer': answer}], 
            job_data, 
            **kwargs
        )
