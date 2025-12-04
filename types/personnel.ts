import { Department } from './department';

export interface Personnel {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  department: Department;
  jobTitle?: string;
  hireDate?: string;
  phoneNumber?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonnelDto {
  firstName: string;
  lastName:string;
  middleName?: string;
  email: string;
  department: string;
  jobTitle?: string;
  hireDate?: string;
  phoneNumber?: string;
  gender?: string;
}

export interface UpdatePersonnelDto extends Partial<CreatePersonnelDto> {}
