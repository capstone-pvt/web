'use client';

import { Personnel } from '@/types/personnel';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
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

interface PersonnelTableProps {
  personnel: Personnel[];
  onEdit: (person: Personnel) => void;
  onDelete: (person: Personnel) => void;
}

export function PersonnelTable({ personnel, onEdit, onDelete }: PersonnelTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Job Title</TableHead>
          <TableHead>Performance Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personnel.map((person) => (
          <TableRow key={person._id}>
            <TableCell>{`${person.firstName} ${person.lastName}`}</TableCell>
            <TableCell>{person.email}</TableCell>
            <TableCell>{person.department?.name}</TableCell>
            <TableCell>{person.jobTitle}</TableCell>
            <TableCell>
              {person.performanceStatus ? (
                <Badge
                  variant={person.performanceStatus === 'Performing' ? 'default' : 'destructive'}
                >
                  {person.performanceStatus}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Not classified</span>
              )}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(person)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(person)} className="text-red-600">
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
