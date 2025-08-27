"""
Utilitários de validação para o consumer
"""

import json
from typing import Dict, Any, Optional
from consumer.models.message import ResumeMessage
from consumer.utils.logger import logger


def validate_json_message(body: str) -> Optional[Dict[str, Any]]:
    """
    Valida se o corpo da mensagem é um JSON válido
    
    Args:
        body: Corpo da mensagem como string
        
    Returns:
        Dict com os dados da mensagem ou None se inválido
    """
    try:
        data = json.loads(body)
        return data
    except json.JSONDecodeError as e:
        logger.error("Mensagem não é JSON válido", error=str(e), body=body)
        return None


def validate_resume_message(data: Dict[str, Any]) -> Optional[ResumeMessage]:
    """
    Valida se os dados da mensagem contêm os campos obrigatórios para processamento de currículo
    
    Args:
        data: Dados da mensagem como dict
        
    Returns:
        ResumeMessage validado ou None se inválido
    """
    try:
        # Verifica campos obrigatórios
        if 'resumeUrl' not in data:
            logger.error("Campo resumeUrl não encontrado na mensagem", data=data)
            return None
        
        if 'applicationId' not in data:
            logger.error("Campo applicationId não encontrado na mensagem", data=data)
            return None
        
        # Validações adicionais
        if not validate_pdf_url(data['resumeUrl']):
            logger.error("URL do currículo inválida", url=data['resumeUrl'])
            return None
        
        if not validate_application_id(data['applicationId']):
            logger.error("ID da aplicação inválido", application_id=data['applicationId'])
            return None
        
        # Cria e valida o objeto ResumeMessage
        resume_message = ResumeMessage(
            resume_url=data['resumeUrl'],
            application_id=data['applicationId'],
            timestamp=data.get('timestamp'),
            priority=data.get('priority')
        )
        
        return resume_message
        
    except ValueError as e:
        logger.error("Dados da mensagem inválidos", error=str(e), data=data)
        return None
    except Exception as e:
        logger.error("Erro inesperado na validação da mensagem", error=str(e), data=data)
        return None


def is_retry_limit_reached(receive_count: int, max_retries: int) -> bool:
    """
    Verifica se o limite de tentativas foi atingido
    
    Args:
        receive_count: Número de vezes que a mensagem foi recebida
        max_retries: Número máximo de tentativas permitidas
        
    Returns:
        True se o limite foi atingido
    """
    return receive_count >= max_retries


def should_process_message(data: Dict[str, Any]) -> bool:
    """
    Verifica se a mensagem deve ser processada baseada no conteúdo
    
    Args:
        data: Dados da mensagem
        
    Returns:
        True se a mensagem deve ser processada
    """
    required_fields = ['resumeUrl', 'applicationId']
    return all(field in data for field in required_fields)


def validate_pdf_url(url: str) -> bool:
    """
    Valida se a URL parece ser de um PDF
    
    Args:
        url: URL para validar
        
    Returns:
        True se parece ser um PDF
    """
    if not url:
        return False
    
    # Verifica se termina com .pdf
    if url.lower().endswith('.pdf'):
        return True
    
    # Verifica se contém 'pdf' no path
    if '/pdf' in url.lower():
        return True
    
    return True  # Por padrão, aceita qualquer URL


def validate_application_id(application_id: str) -> bool:
    """
    Valida se o ID da aplicação tem formato válido
    
    Args:
        application_id: ID da aplicação
        
    Returns:
        True se o formato é válido
    """
    if not application_id:
        return False
    
    # Verifica se tem pelo menos 3 caracteres
    if len(application_id) < 3:
        return False
    
    # Verifica se não contém caracteres inválidos
    invalid_chars = ['<', '>', '"', "'", '&']
    if any(char in application_id for char in invalid_chars):
        return False
    
    return True
