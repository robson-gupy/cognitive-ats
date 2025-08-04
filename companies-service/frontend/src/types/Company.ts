export interface Company {
  id: string;
  name: string;
  corporateName: string;
  cnpj: string;
  businessArea: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  corporateName: string;
  cnpj: string;
  businessArea: string;
  description?: string;
}

export interface UpdateCompanyData {
  name?: string;
  corporateName?: string;
  cnpj?: string;
  businessArea?: string;
  description?: string;
} 