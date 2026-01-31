import http from './axios';
import {
  CreateEvaluationFormDto,
  EvaluationForm,
  UpdateEvaluationFormDto,
} from '@/types/evaluation-form';

export const getEvaluationForms = async (): Promise<EvaluationForm[]> => {
  const response = await http.get('/evaluation-forms');
  return response.data;
};

export const getEvaluationForm = async (id: string): Promise<EvaluationForm> => {
  const response = await http.get(`/evaluation-forms/${id}`);
  return response.data;
};

export const createEvaluationForm = async (
  data: CreateEvaluationFormDto,
): Promise<EvaluationForm> => {
  const response = await http.post('/evaluation-forms', data);
  return response.data;
};

export const updateEvaluationForm = async (
  id: string,
  data: UpdateEvaluationFormDto,
): Promise<EvaluationForm> => {
  const response = await http.patch(`/evaluation-forms/${id}`, data);
  return response.data;
};

export const deleteEvaluationForm = async (id: string): Promise<void> => {
  await http.delete(`/evaluation-forms/${id}`);
};
