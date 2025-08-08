export interface Application {
  id: string;
  jobId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  aiScore?: number;
  overallScore?: number;
  questionResponsesScore?: number;
  educationScore?: number;
  experienceScore?: number;
  evaluationProvider?: string;
  evaluationModel?: string;
  evaluationDetails?: any;
  evaluatedAt?: string;
  resumeUrl?: string;
  currentStageId?: string;
  currentStage?: {
    id: string;
    name: string;
    description?: string;
    orderIndex: number;
  };
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    companyId: string;
  };
  resume?: {
    id: string;
    summary?: string;
    professionalExperiences?: Array<{
      id: string;
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>;
    academicFormations?: Array<{
      id: string;
      institution: string;
      course: string;
      degree: string;
      startDate: string;
      endDate?: string;
    }>;
    achievements?: Array<{
      id: string;
      title: string;
      description?: string;
      year?: number;
    }>;
    languages?: Array<{
      id: string;
      language: string;
      level: string;
    }>;
  };
  questionResponses?: Array<{
    id: string;
    question: string;
    answer: string;
    createdAt: string;
  }>;
  stageHistory?: Array<{
    id: string;
    applicationId: string;
    jobId: string;
    companyId: string;
    fromStageId?: string;
    toStageId: string;
    changedById: string;
    notes?: string;
    createdAt: string;
    fromStage?: {
      id: string;
      name: string;
      description?: string;
    };
    toStage?: {
      id: string;
      name: string;
      description?: string;
    };
    changedBy?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export interface CreateApplicationData {
  jobId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
}

export interface UpdateApplicationData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface UpdateApplicationScoreData {
  aiScore: number;
}

export interface ChangeApplicationStageData {
  toStageId: string;
  notes?: string;
}
