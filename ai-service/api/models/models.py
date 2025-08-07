"""
Modelos Pydantic para o AI Service - Arquivo de exportação
"""
# Importa modelos de jobs
from .jobs import Job, JobQuestion, JobCreationRequest, JobEnhancementRequest, JobQuestionsRequest, JobStagesRequest, JobResponse

# Importa modelos de resume
from .resume import Resume, ResumeProfessionalExperience, ResumeAcademicFormation, ResumeAchievement, ResumeLanguage

# Re-exporta todos os modelos para manter compatibilidade
__all__ = [
    # Jobs
    'Job',
    'JobQuestion', 
    'JobCreationRequest',
    'JobEnhancementRequest',
    'JobQuestionsRequest',
    'JobStagesRequest',
    'JobResponse',
    # Resume
    'Resume',
    'ResumeProfessionalExperience',
    'ResumeAcademicFormation', 
    'ResumeAchievement',
    'ResumeLanguage'
]
