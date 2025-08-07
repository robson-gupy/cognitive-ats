export interface Application {
  id: string;
  jobId: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  aiScore?: number;
  resumeUrl?: string;
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
