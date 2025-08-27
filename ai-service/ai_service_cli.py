#!/usr/bin/env python3
"""
CLI Genérico para o AI Service

Uso:
    python ai_service_cli.py resume --pdf caminho/para/arquivo.pdf --application-id ID123
    python ai_service_cli.py resume --pdf caminho/para/arquivo.pdf --application-id ID123 --output resultado.json
    python ai_service_cli.py --help
    python ai_service_cli.py resume --help
"""

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Optional, Dict, Any
from abc import ABC, abstractmethod

from dotenv import load_dotenv
load_dotenv()

# Adiciona o diretório atual ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from consumer.services.resume_orchestrator import ResumeOrchestrator
    from consumer.utils.logger import logger
except ImportError as e:
    print(f"❌ Erro ao importar módulos: {e}")
    print("Certifique-se de que está executando este script da raiz do projeto")
    sys.exit(1)



class BaseCommand(ABC):
    """Classe base para todos os comandos do CLI"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    @abstractmethod
    def add_arguments(self, parser: argparse.ArgumentParser):
        """Adiciona argumentos específicos do comando"""
        pass
    
    @abstractmethod
    async def execute(self, args: argparse.Namespace) -> Dict[str, Any]:
        """Executa o comando"""
        pass
    
    def get_help_text(self) -> str:
        """Retorna texto de ajuda específico do comando"""
        return self.description


class ResumeCommand(BaseCommand):
    """Comando para processamento de currículos"""
    
    def __init__(self):
        super().__init__(
            name="resume",
            description="Processa currículos em PDF usando IA"
        )
        self.resume_orchestrator = None
    
    def _initialize_processor(self):
        """Inicializa o orquestrador de currículos (lazy initialization)"""
        if self.resume_orchestrator is None:
            try:
                self.resume_orchestrator = ResumeOrchestrator()
                print("✅ Orquestrador de currículos inicializado")
            except Exception as e:
                print(f"❌ Erro ao inicializar orquestrador: {e}")
                raise
    
    def add_arguments(self, parser: argparse.ArgumentParser):
        """Adiciona argumentos específicos para processamento de currículos"""
        parser.add_argument(
            '--pdf', '-p',
            required=True,
            help='Caminho para o arquivo PDF do currículo'
        )
        
        parser.add_argument(
            '--application-id', '-a',
            required=True,
            help='ID da aplicação para o currículo'
        )
        
        parser.add_argument(
            '--output', '-o',
            help='Arquivo de saída para salvar o resultado (opcional)'
        )
        
        parser.add_argument(
            '--verbose', '-v',
            action='store_true',
            help='Modo verboso com mais detalhes'
        )
    
    def validate_pdf_file(self, pdf_path: str) -> bool:
        """Valida se o arquivo PDF existe e é válido"""
        if not os.path.exists(pdf_path):
            print(f"❌ Arquivo não encontrado: {pdf_path}")
            return False
        
        if not pdf_path.lower().endswith('.pdf'):
            print(f"❌ Arquivo deve ser um PDF: {pdf_path}")
            return False
        
        # Verifica se é um arquivo válido
        try:
            with open(pdf_path, 'rb') as f:
                header = f.read(4)
                if header != b'%PDF':
                    print(f"❌ Arquivo não é um PDF válido: {pdf_path}")
                    return False
        except Exception as e:
            print(f"❌ Erro ao ler arquivo: {e}")
            return False
        
        return True
    
    def create_temp_resume_message(self, pdf_path: str, application_id: str) -> dict:
        """Cria uma mensagem temporária para processamento"""
        resume_message = {
            'resume_url': pdf_path,
            'application_id': application_id,
            'timestamp': None,
            'priority': "high"
        }
        return resume_message
    
    async def execute(self, args: argparse.Namespace) -> Dict[str, Any]:
        """Executa o processamento de currículo"""
        try:
            print(f"🔄 Processando currículo: {args.pdf}")
            print(f"   Application ID: {args.application_id}")
            
            # Valida arquivo PDF
            if not self.validate_pdf_file(args.pdf):
                return {
                    "success": False,
                    "application_id": args.application_id,
                    "error": "Arquivo PDF inválido",
                    "message": "Falha na validação do arquivo"
                }
            
            # Inicializa o processador apenas quando necessário
            self._initialize_processor()
            
            # Para arquivos locais, usa process_resume_from_file diretamente
            if os.path.isabs(args.pdf) or os.path.exists(args.pdf):
                # É um arquivo local
                print(f"📁 Processando arquivo local: {args.pdf}")
                result = await self.resume_orchestrator.process_resume_from_file(args.pdf, args.application_id)
            else:
                # É uma URL, usa process_resume_from_message
                print(f"🌐 Processando URL: {args.pdf}")
                resume_message = self.create_temp_resume_message(args.pdf, args.application_id)
                message_id = f"cli_{args.application_id}"
                result = await self.resume_orchestrator.process_resume_from_message(resume_message, message_id)
            
            if result.success:
                print("✅ Currículo processado com sucesso!")
                print(f"   Tempo de processamento: {result.processing_time:.2f}s")
                
                return {
                    "success": True,
                    "application_id": args.application_id,
                    "processing_time": result.processing_time,
                    "timestamp": result.timestamp.isoformat() if result.timestamp else None,
                    "message": "Currículo processado com sucesso"
                }
            else:
                print(f"❌ Erro ao processar currículo: {result.error}")
                return {
                    "success": False,
                    "application_id": args.application_id,
                    "error": result.error,
                    "timestamp": result.timestamp.isoformat() if result.timestamp else None,
                    "message": "Erro ao processar currículo"
                }
                
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")
            return {
                "success": False,
                "application_id": args.application_id,
                "error": str(e),
                "message": "Erro inesperado"
            }


class JobsCommand(BaseCommand):
    """Comando para operações relacionadas a vagas (placeholder para futuro)"""
    
    def __init__(self):
        super().__init__(
            name="jobs",
            description="Operações relacionadas a vagas de emprego"
        )
    
    def add_arguments(self, parser: argparse.ArgumentParser):
        """Adiciona argumentos específicos para operações de vagas"""
        parser.add_argument(
            '--action',
            choices=['create', 'enhance', 'analyze'],
            default='analyze',
            help='Ação a ser executada (padrão: analyze)'
        )
        
        parser.add_argument(
            '--input', '-i',
            help='Arquivo de entrada para processamento'
        )
    
    async def execute(self, args: argparse.Namespace) -> Dict[str, Any]:
        """Executa operações relacionadas a vagas"""
        print(f"🚧 Comando 'jobs' ainda não implementado")
        print(f"   Ação solicitada: {args.action}")
        print(f"   Arquivo de entrada: {args.input}")
        
        return {
            "success": False,
            "message": "Comando jobs ainda não implementado",
            "action": args.action,
            "input_file": args.input
        }


class AICommand(BaseCommand):
    """Comando para operações gerais de IA (placeholder para futuro)"""
    
    def __init__(self):
        super().__init__(
            name="ai",
            description="Operações gerais de IA"
        )
    
    def add_arguments(self, parser: argparse.ArgumentParser):
        """Adiciona argumentos específicos para operações de IA"""
        parser.add_argument(
            '--model',
            default='gpt-3.5-turbo',
            help='Modelo de IA a ser usado'
        )
        
        parser.add_argument(
            '--prompt', '-p',
            help='Prompt para processamento'
        )
    
    async def execute(self, args: argparse.Namespace) -> Dict[str, Any]:
        """Executa operações gerais de IA"""
        print(f"🚧 Comando 'ai' ainda não implementado")
        print(f"   Modelo solicitado: {args.model}")
        print(f"   Prompt: {args.prompt}")
        
        return {
            "success": False,
            "message": "Comando ai ainda não implementado",
            "model": args.model,
            "prompt": args.prompt
        }


class GenericCLI:
    """CLI genérico que gerencia múltiplos comandos"""
    
    def __init__(self):
        self.commands: Dict[str, BaseCommand] = {}
        self._register_commands()
    
    def _register_commands(self):
        """Registra todos os comandos disponíveis"""
        self.commands["resume"] = ResumeCommand()
        self.commands["jobs"] = JobsCommand()
        self.commands["ai"] = AICommand()
    
    def get_available_commands(self) -> list:
        """Retorna lista de comandos disponíveis"""
        return list(self.commands.keys())
    
    def create_parser(self) -> argparse.ArgumentParser:
        """Cria o parser principal do CLI"""
        parser = argparse.ArgumentParser(
            description="CLI Genérico para o AI Service",
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
Comandos disponíveis:
  resume    Processa currículos em PDF
  jobs      Operações relacionadas a vagas
  ai        Operações gerais de IA

Exemplos de uso:
  python ai_service_cli.py resume --pdf curriculo.pdf --application-id ID123
  python ai_service_cli.py jobs --action create --input vaga.json
  python ai_service_cli.py ai --model gpt-4 --prompt "Analise este texto"

Para ajuda específica de um comando:
  python ai_service_cli.py [comando] --help
            """
        )
        
        parser.add_argument(
            'command',
            choices=self.get_available_commands(),
            help='Comando a ser executado'
        )
        
        return parser
    
    def create_command_parser(self, command_name: str) -> argparse.ArgumentParser:
        """Cria parser específico para um comando"""
        command = self.commands[command_name]
        
        parser = argparse.ArgumentParser(
            description=command.get_help_text(),
            formatter_class=argparse.RawDescriptionHelpFormatter
        )
        
        # Adiciona argumentos específicos do comando
        command.add_arguments(parser)
        
        return parser
    
    async def execute_command(self, command_name: str, args: argparse.Namespace) -> Dict[str, Any]:
        """Executa um comando específico"""
        if command_name not in self.commands:
            return {
                "success": False,
                "error": f"Comando '{command_name}' não encontrado"
            }
        
        command = self.commands[command_name]
        return await command.execute(args)
    
    def save_output(self, data: dict, output_file: str):
        """Salva o resultado em um arquivo JSON"""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"💾 Resultado salvo em: {output_file}")
        except Exception as e:
            print(f"⚠️ Erro ao salvar arquivo: {e}")
    
    def print_summary(self, data: dict, command_name: str):
        """Exibe um resumo da execução do comando"""
        print("\n" + "="*50)
        print(f"📋 RESUMO DO COMANDO: {command_name.upper()}")
        print("="*50)
        
        if data.get("success"):
            print(f"✅ Status: Sucesso")
            if "application_id" in data:
                print(f"🆔 Application ID: {data.get('application_id')}")
            if "processing_time" in data:
                print(f"⏱️  Tempo: {data.get('processing_time')}s")
            if "timestamp" in data:
                print(f"🕐 Timestamp: {data.get('timestamp')}")
        else:
            print(f"❌ Status: Falha")
            if "application_id" in data:
                print(f"🆔 Application ID: {data.get('application_id')}")
            if "error" in data:
                print(f"🚨 Erro: {data.get('error')}")
            if "timestamp" in data:
                print(f"🕐 Timestamp: {data.get('timestamp')}")
        
        print(f"📝 Mensagem: {data.get('message', 'N/A')}")
        print("="*50)


async def main():
    """Função principal"""
    cli = GenericCLI()
    
    # Cria parser principal
    main_parser = cli.create_parser()
    
    # Parse dos argumentos principais
    main_args, remaining_args = main_parser.parse_known_args()
    
    # Se não há comando, mostra ajuda
    if not main_args.command:
        main_parser.print_help()
        return
    
    # Cria parser específico do comando
    command_parser = cli.create_command_parser(main_args.command)
    
    # Parse dos argumentos do comando
    try:
        command_args = command_parser.parse_args(remaining_args)
    except SystemExit:
        # Se há erro nos argumentos, mostra ajuda do comando
        command_parser.print_help()
        return
    
    # Executa o comando
    result = await cli.execute_command(main_args.command, command_args)
    
    # Exibe resumo
    cli.print_summary(result, main_args.command)
    
    # Salva resultado se solicitado
    if hasattr(command_args, 'output') and command_args.output:
        cli.save_output(result, command_args.output)
    
    # Exit code baseado no sucesso
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️ Processamento interrompido pelo usuário")
        sys.exit(130)
    except Exception as e:
        print(f"❌ Erro fatal: {e}")
        sys.exit(1)
