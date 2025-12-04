'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { CreatePerformanceEvaluationDto, PerformanceEvaluation } from '@/types/performance-evaluation';
import { Personnel } from '@/types/personnel';
import { useQuery } from '@tanstack/react-query';
import { getPersonnel } from '@/lib/api/personnel.api';

const formSchema = z.object({
  personnel: z.string().min(1, 'Personnel is required.'),
  evaluationDate: z.string().min(1, 'Evaluation date is required.'),
  overallScore: z.coerce.number().min(1).max(5, 'Score must be between 1 and 5.'), // Simplified for now
  feedback: z.string().optional(),
  evaluatedBy: z.string().optional(),
});

interface PerformanceEvaluationFormProps {
  onSubmit: (values: CreatePerformanceEvaluationDto) => void;
  defaultValues?: PerformanceEvaluation;
  isSubmitting: boolean;
}

export function PerformanceEvaluationForm({
  onSubmit,
  defaultValues,
  isSubmitting,
}: PerformanceEvaluationFormProps) {
  const { data: personnelList, isLoading: isLoadingPersonnel } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personnel: defaultValues?.personnel?._id || '',
      evaluationDate: defaultValues?.evaluationDate
        ? new Date(defaultValues.evaluationDate).toISOString().split('T')[0]
        : '',
      overallScore: defaultValues?.scores?.overallScore || 3, // Default to 3 if not set
      feedback: defaultValues?.feedback || '',
      evaluatedBy: defaultValues?.evaluatedBy || '',
    },
  });

  const handleSubmitInternal = (values: z.infer<typeof formSchema>) => {
    const dto: CreatePerformanceEvaluationDto = {
      personnel: values.personnel,
      evaluationDate: new Date(values.evaluationDate).toISOString(),
      scores: { overallScore: values.overallScore }, // Map to scores object
      feedback: values.feedback,
      evaluatedBy: values.evaluatedBy,
    };
    onSubmit(dto);
  };

  if (isLoadingPersonnel) {
    return <div>Loading personnel...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitInternal)} className="space-y-8">
        <FormField
          control={form.control}
          name="personnel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personnel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select personnel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {personnelList?.map((person) => (
                    <SelectItem key={person._id} value={person._id}>
                      {person.firstName} {person.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="evaluationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaluation Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="overallScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Score (1-5)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" min="1" max="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional feedback" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="evaluatedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaluated By</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Manager Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
