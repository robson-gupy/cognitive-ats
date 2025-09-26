export interface Tag {
  id: string;
  label: string;
  companyId: string;
  color: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagData {
  label: string;
  color: string;
  textColor: string;
}

export interface UpdateTagData {
  label?: string;
  color?: string;
  textColor?: string;
}
