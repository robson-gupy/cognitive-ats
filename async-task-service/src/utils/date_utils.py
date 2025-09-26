"""
Utilitários para conversão e manipulação de datas
"""

from datetime import date, datetime
from typing import Any, Union, Dict, List


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


def parse_iso_date(date_string: str) -> Union[date, datetime, None]:
    """
    Converte string ISO para objeto date ou datetime
    
    Args:
        date_string: String no formato ISO
        
    Returns:
        Objeto date, datetime ou None se inválido
    """
    if not date_string:
        return None
    
    try:
        # Tenta parse como datetime primeiro
        return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
    except ValueError:
        try:
            # Tenta parse como date
            return date.fromisoformat(date_string)
        except ValueError:
            return None


def format_date_for_display(date_obj: Union[date, datetime]) -> str:
    """
    Formata data para exibição amigável
    
    Args:
        date_obj: Objeto date ou datetime
        
    Returns:
        String formatada para exibição
    """
    if isinstance(date_obj, datetime):
        return date_obj.strftime("%d/%m/%Y %H:%M")
    elif isinstance(date_obj, date):
        return date_obj.strftime("%d/%m/%Y")
    else:
        return str(date_obj)


def is_current_position(end_date: Union[str, date, datetime, None]) -> bool:
    """
    Verifica se uma posição é atual baseada na data de fim
    
    Args:
        end_date: Data de fim da posição
        
    Returns:
        True se a posição é atual
    """
    if end_date is None:
        return True
    
    if isinstance(end_date, str):
        end_date = parse_iso_date(end_date)
    
    if end_date is None:
        return True
    
    today = date.today()
    
    if isinstance(end_date, datetime):
        end_date = end_date.date()
    
    return end_date >= today
