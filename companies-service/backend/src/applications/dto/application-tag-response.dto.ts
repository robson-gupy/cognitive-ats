export class ApplicationTagResponseDto {
  id: string;
  applicationId: string;
  tagId: string;
  addedByUserId: string;
  createdAt: Date;
  
  // Dados relacionados (opcional)
  tag?: {
    id: string;
    label: string;
    color: string;
    textColor: string;
  };
  
  application?: {
    id: string;
    candidateName?: string;
    jobTitle?: string;
  };
  
  addedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
