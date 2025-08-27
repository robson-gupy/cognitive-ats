"""
Serviço de banco de dados para conectar diretamente ao PostgreSQL do companies-service
"""

import asyncpg
from datetime import datetime
from typing import Optional, List, Dict, Any
from consumer.config.settings import settings
from consumer.utils.logger import logger


class DatabaseService:
    """Serviço para conexão direta com o banco PostgreSQL do companies-service"""
    
    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None
        self._connection_params = {
            'host': settings.database.host,
            'port': settings.database.port,
            'user': settings.database.username,
            'password': settings.database.password,
            'database': settings.database.name,
            'min_size': 1,
            'max_size': 10
        }
    
    async def connect(self):
        """Estabelece conexão com o banco de dados"""
        try:
            if not self._pool:
                self._pool = await asyncpg.create_pool(**self._connection_params)
                logger.info("✅ Conectado ao banco de dados PostgreSQL")
        except Exception as e:
            logger.error(f"❌ Erro ao conectar ao banco: {e}")
            raise
    
    async def disconnect(self):
        """Fecha a conexão com o banco de dados"""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("🔌 Desconectado do banco de dados")
    
    async def execute_query(self, query: str, *args) -> List[Dict[str, Any]]:
        """
        Executa uma query e retorna os resultados
        
        Args:
            query: Query SQL para executar
            *args: Parâmetros da query
            
        Returns:
            Lista de resultados como dicionários
        """
        if not self._pool:
            await self.connect()
        
        try:
            async with self._pool.acquire() as connection:
                # Executa a query
                if query.strip().upper().startswith('SELECT'):
                    # Para SELECT, retorna os resultados
                    rows = await connection.fetch(query, *args)
                    return [dict(row) for row in rows]
                elif query.strip().upper().startswith('UPDATE') and 'RETURNING' in query.upper():
                    # Para UPDATE com RETURNING, retorna os resultados
                    rows = await connection.fetch(query, *args)
                    return [dict(row) for row in rows]
                else:
                    # Para INSERT, UPDATE, DELETE sem RETURNING, retorna o resultado da execução
                    result = await connection.execute(query, *args)
                    return [{'affected_rows': result.split()[-1]}]
                    
        except Exception as e:
            logger.error(f"❌ Erro ao executar query: {e}")
            logger.error(f"Query: {query}")
            logger.error(f"Args: {args}")
            logger.error(f"Tipos dos args: {[type(arg).__name__ for arg in args]}")
            logger.error(f"🔍 Detalhes do erro: {type(e).__name__}")
            import traceback
            logger.error(f"🔍 Traceback completo: {traceback.format_exc()}")
            raise
    
    async def update_application_scores(
        self, 
        application_id: str, 
        overall_score: Optional[float] = None,
        education_score: Optional[float] = None,
        experience_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Atualiza os scores de uma application diretamente no banco
        
        Args:
            application_id: ID da application
            overall_score: Score geral (opcional)
            education_score: Score de educação (opcional)
            experience_score: Score de experiência (opcional)
            
        Returns:
            Dicionário com o resultado da atualização
        """
        try:
            # Validar tipos dos scores antes de construir a query
            validated_scores = {}
            scores_to_validate = [
                ('overall_score', overall_score),
                ('education_score', education_score),
                ('experience_score', experience_score)
            ]
            
            logger.info(f"🔍 Validando scores: {scores_to_validate}")
            
            for score_name, score_value in scores_to_validate:
                if score_value is not None:
                    logger.info(f"🔍 Validando {score_name}: {score_value} (tipo: {type(score_value).__name__})")
                    if not isinstance(score_value, (int, float)):
                        logger.warning(f"⚠️ Score {score_name} não é numérico: {score_value} (tipo: {type(score_value).__name__})")
                        # Tenta converter para float
                        try:
                            if isinstance(score_value, str):
                                validated_scores[score_name] = float(score_value.replace(',', '.'))
                            else:
                                validated_scores[score_name] = float(score_value)
                            logger.info(f"✅ Score {score_name} convertido para: {validated_scores[score_name]}")
                        except (ValueError, TypeError):
                            raise ValueError(f"Score {score_name} não pode ser convertido para número: {score_value}")
                    else:
                        validated_scores[score_name] = score_value
                        logger.info(f"✅ Score {score_name} já é numérico: {validated_scores[score_name]}")
                else:
                    logger.info(f"⚠️ Score {score_name} é None")
            
            logger.info(f"📊 Scores validados no database_service: {validated_scores}")
            
            # Validar se pelo menos um score válido foi fornecido
            if not validated_scores:
                raise ValueError("Nenhum score válido foi fornecido para atualização")
            
            logger.info(f"✅ Validação dos scores concluída com sucesso")
            
            # Construir a query de atualização
            update_fields = []
            update_values = []
            param_count = 1
            
            logger.info(f"🔧 Iniciando construção da query de update...")
            
            if 'overall_score' in validated_scores:
                update_fields.append(f"overall_score = ${param_count}")
                update_values.append(validated_scores['overall_score'])
                param_count += 1
                logger.info(f"✅ Overall score adicionado: {validated_scores['overall_score']}")
            
            if 'education_score' in validated_scores:
                update_fields.append(f"education_score = ${param_count}")
                update_values.append(validated_scores['education_score'])
                param_count += 1
                logger.info(f"✅ Education score adicionado: {validated_scores['education_score']}")
            
            if 'experience_score' in validated_scores:
                update_fields.append(f"experience_score = ${param_count}")
                update_values.append(validated_scores['experience_score'])
                param_count += 1
                logger.info(f"✅ Experience score adicionado: {validated_scores['experience_score']}")
            
            # Sempre atualizar updated_at
            current_time = datetime.now()
            update_fields.append(f"updated_at = ${param_count}")
            update_values.append(current_time)
            param_count += 1
            logger.info(f"✅ Updated_at adicionado: {current_time}")
            
            # Adicionar o ID da application
            update_values.append(application_id)
            logger.info(f"✅ Application ID adicionado: {application_id}")
            
            if not update_fields:
                raise ValueError("Nenhum campo para atualizar foi fornecido")
            
            logger.info(f"🔧 Query de update construída: {update_fields}")
            logger.info(f"📝 Valores para update: {update_values}")
            logger.info(f"🔢 Contador de parâmetros: {param_count}")
            logger.info(f"🔢 Tipos dos valores: {[type(val).__name__ for val in update_values]}")
            
            query = f"""
                UPDATE public.applications 
                SET {', '.join(update_fields)}
                WHERE id = ${param_count}
                RETURNING id, overall_score, education_score, experience_score, updated_at
            """
            
            logger.info(f"📋 Query SQL final: {query}")
            logger.info(f"🔢 Número de parâmetros: {len(update_values)}")
            
            logger.info(f"🚀 Executando query...")
            result = await self.execute_query(query, *update_values)
            
            logger.info(f"📊 Resultado da execução da query: {result}")
            
            if not result:
                raise ValueError(f"Application com ID {application_id} não encontrada")
            
            logger.info(f"✅ Scores da application {application_id} atualizados com sucesso")
            logger.info(f"📊 Resultado da atualização: {result[0]}")
            
            return {
                'success': True,
                'application_id': application_id,
                'updated_fields': result[0],
                'message': 'Scores atualizados com sucesso'
            }
            
        except Exception as e:
            logger.error(f"❌ Erro ao atualizar scores da application {application_id}: {e}")
            logger.error(f"🔍 Detalhes do erro: {type(e).__name__}")
            import traceback
            logger.error(f"🔍 Traceback completo: {traceback.format_exc()}")
            return {
                'success': False,
                'application_id': application_id,
                'error': str(e)
            }
    
    async def get_application_by_id(self, application_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca uma application pelo ID
        
        Args:
            application_id: ID da application
            
        Returns:
            Dados da application ou None se não encontrada
        """
        try:
            query = """
                SELECT 
                    id, job_id, company_id, first_name, last_name, email, phone,
                    overall_score, education_score, experience_score, question_responses_score,
                    evaluation_provider, evaluation_model, evaluation_details, evaluated_at,
                    created_at, updated_at
                FROM public.applications 
                WHERE id = $1
            """
            
            result = await self.execute_query(query, application_id)
            return result[0] if result else None
            
        except Exception as e:
            logger.error(f"❌ Erro ao buscar application {application_id}: {e}")
            return None
    
    async def is_connected(self) -> bool:
        """Verifica se está conectado ao banco"""
        return self._pool is not None and not self._pool.is_closed()


# Instância global do serviço
database_service = DatabaseService()
