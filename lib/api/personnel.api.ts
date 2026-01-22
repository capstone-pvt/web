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

export const getPersonnelWithPredictions = async (): Promise<Personnel[]> => {
  const response = await http.get('/personnel'); // Assuming this endpoint returns all personnel data
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

export const predictPersonnelPerformance = async (personnelId: string): Promise<{ prediction: number; trainedAt: Date }> => {
  const response = await http.post(`/ml/predict/${personnelId}`);
  return response.data;
};

export const classifyAllPersonnel = async (): Promise<{
  total: number;
  classified: number;
  skipped: number;
}> => {
  const response = await http.post('/personnel/classify-all');
  return response.data;
};
