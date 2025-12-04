'use client';

import { PerformanceEvaluation } from '@/types/performance-evaluation';
import { Button } from '@/app/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface PerformanceEvaluationsTableProps {
  evaluations: PerformanceEvaluation[];
  onEdit: (evaluation: PerformanceEvaluation) => void;
  onDelete: (evaluation: PerformanceEvaluation) => void;
}

export function PerformanceEvaluationsTable({
  evaluations,
  onEdit,
  onDelete,
}: PerformanceEvaluationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Personnel</TableHead>
          <TableHead>Semester</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>PAA</TableHead>
          <TableHead>KSM</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((evaluation) => (
          <TableRow key={evaluation._id}>
            <TableCell>{`${evaluation.personnel.firstName} ${evaluation.personnel.lastName}`}</TableCell>
            <TableCell>{evaluation.semester}</TableCell>
            <TableCell>{new Date(evaluation.evaluationDate).toLocaleDateString()}</TableCell>
            <TableCell>{evaluation.scores?.PAA || 'N/A'}</TableCell>
            <TableCell>{evaluation.scores?.KSM || 'N/A'}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(evaluation)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(evaluation)} className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
