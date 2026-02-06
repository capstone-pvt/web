export type EvaluationAudience = 'teaching' | 'non-teaching';

export interface EvaluationScaleItem {
  value: number;
  label: string;
}

export interface EvaluationSection {
  title: string;
  items: string[];
}

export interface EvaluationForm {
  _id: string;
  name: string;
  audience: EvaluationAudience;
  description?: string;
  evaluatorOptions?: string[];
  scale?: EvaluationScaleItem[];
  sections?: EvaluationSection[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvaluationFormDto {
  name: string;
  audience: EvaluationAudience;
  description?: string;
  evaluatorOptions?: string[];
  scale?: EvaluationScaleItem[];
  sections?: EvaluationSection[];
}

export interface UpdateEvaluationFormDto
  extends Partial<CreateEvaluationFormDto> {}
