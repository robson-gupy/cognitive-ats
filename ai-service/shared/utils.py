"""
Utilitários compartilhados do AI Service
"""
import json
import re
from typing import Dict, Any, Optional
from datetime import date, datetime


def convert_dates_to_iso(data: Any) -> Any:
    """
    Converte objetos date e datetime para strings ISO para serialização JSON
    
    Args:
        data: Dados a serem convertidos (dict, list, ou valor primitivo)
        
    Returns:
        Dados convertidos com datas em formato ISO
    """
    if isinstance(data, dict):
        return {key: convert_dates_to_iso(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_dates_to_iso(item) for item in data]
    elif isinstance(data, (date, datetime)):
        return data.isoformat()
    else:
        return data


def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Extrai JSON de um texto que pode conter outros caracteres
    
    Args:
        text: Texto que pode conter JSON
        
    Returns:
        Dict com os dados JSON ou None se não encontrar
    """
    # Procura por padrões JSON no texto
    json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    for match in matches:
        try:
            return json.loads(match)
        except json.JSONDecodeError:
            continue
    
    return None


def sanitize_text(text: str) -> str:
    """
    Sanitiza texto removendo caracteres problemáticos
    
    Args:
        text: Texto a ser sanitizado
        
    Returns:
        Texto sanitizado
    """
    if not text:
        return ""
    
    # Remove caracteres de controle exceto quebras de linha
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Normaliza espaços em branco
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def validate_required_fields(data: Dict[str, Any], required_fields: list) -> bool:
    """
    Valida se todos os campos obrigatórios estão presentes
    
    Args:
        data: Dicionário com os dados
        required_fields: Lista de campos obrigatórios
        
    Returns:
        True se todos os campos estão presentes, False caso contrário
    """
    return all(field in data and data[field] is not None for field in required_fields)
