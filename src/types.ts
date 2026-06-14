export type UserRole = 'owner' | 'admin' | 'lawyer' | 'secretary' | 'client' | 'OWNER' | 'ADMIN' | 'LAWYER' | 'SECRETARY' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface Client {
  id: string;
  name: string;
  type: string;
  nationality: string;
  identityLabel: string;
  identityNumber: string;
  phone: string;
  email: string;
  cases: number;
}

export interface Case {
  id: string;
  internalId: string;
  year: string;
  caseNumber: string;
  jurisdiction: string;
  branch: string;
  degree: string;
  title: string;
  clientName: string;
  clientRole: string;
  opponent: string;
  status: string;
  nextSession: string;
}

export interface FinanceItem {
  id: string;
  caseId: string;
  client: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  status: string;
  note: string;
}
