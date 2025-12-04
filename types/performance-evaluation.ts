import { Personnel } from './personnel';

export interface PerformanceEvaluation {
  _id: string;
  personnel: Personnel;
  evaluationDate: string;
  scores: Record<string, number>;
  feedback?: string;
  evaluatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePerformanceEvaluationDto {
  personnel: string;
  evaluationDate: string;
  scores: Record<string, number>;
  feedback?: string;
  evaluatedBy?: string;
}

export interface UpdatePerformanceEvaluationDto
  extends Partial<CreatePerformanceEvaluationDto> {}
