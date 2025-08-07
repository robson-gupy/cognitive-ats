# Models module

# Importa todos os modelos para facilitar o uso
from .ai import *
from .jobs import *
from .resume import *
from .models import *

# Re-exporta os principais modelos
__all__ = [
    # AI Models
    'TextGenerationRequest',
    'ChatRequest', 
    'EmbeddingRequest',
    'ProviderInfoResponse',
    'AIResponse',
    'EmbeddingResponse',
    # Job Models
    'Job',
    'JobQuestion',
    'JobCreationRequest',
    'JobEnhancementRequest',
    'JobQuestionsRequest',
    'JobStagesRequest',
    'JobResponse',
    # Resume Models
    'Resume',
    'ResumeProfessionalExperience',
    'ResumeAcademicFormation',
    'ResumeAchievement',
    'ResumeLanguage'
]
