export type UserRole = 'owner' | 'admin' | 'lawyer' | 'secretary' | 'client';

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
  nationalId: string;
  email?: string;
  phone?: string;
  address?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  clientId: string;
  status: 'Open' | 'Closed' | 'Pending' | 'Appealed';
  type: string;
  court: string;
  description: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
