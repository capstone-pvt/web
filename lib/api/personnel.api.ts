import http from './axios';
import {
  Personnel,
  CreatePersonnelDto,
  UpdatePersonnelDto,
} from '@/types/personnel';

export const getPersonnel = async (): Promise<Personnel[]> => {
  const response = await http.get('/personnel');
  return response.data;
};

export const createPersonnel = async (
  data: CreatePersonnelDto,
): Promise<Personnel> => {
  const response = await http.post('/personnel', data);
  return response.data;
};

export const updatePersonnel = async (
  id: string,
  data: UpdatePersonnelDto,
): Promise<Personnel> => {
  const response = await http.patch(`/personnel/${id}`, data);
  return response.data;
};

export const deletePersonnel = async (id: string): Promise<void> => {
  await http.delete(`/personnel/${id}`);
};
