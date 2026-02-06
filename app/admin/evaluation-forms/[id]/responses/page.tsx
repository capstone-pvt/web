'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/app/components/ui/pagination';
import { useAlert } from '@/lib/contexts/AlertContext';
import { usePermission } from '@/lib/hooks/usePermission';
import { PERMISSIONS } from '@/config/permissions';
import { useParams } from 'next/navigation';
import { getEvaluationForm } from '@/lib/api/evaluation-forms.api';
import { getDepartments } from '@/lib/api/departments.api';
import {
  bulkUploadEvaluationFormResponses,
  downloadEvaluationFormResponsesExport,
  downloadEvaluationFormResponsesTemplate,
  getEvaluationFormResponsesReport,
  getEvaluationFormResponses,
} from '@/lib/api/evaluation-form-responses.api';
import type {
  BulkUploadResult,
  EvaluationFormResponse,
  EvaluationFormResponseReport,
} from '@/types/evaluation-form-response';
import type { EvaluationForm } from '@/types/evaluation-form';
import type { Department } from '@/types/department';

const ALL_OPTION_VALUE = '__all__';

const buildSemesterOptions = () => {
  const now = new Date();
  const academicYearStart =
    now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const years = Array.from({ length: 5 }, (_, idx) => academicYearStart - idx);
  const terms = ['1st Sem', '2nd Sem', 'Summer'];

  return years.flatMap((startYear) =>
    terms.map((term) => `${startYear}-${startYear + 1} ${term}`),
  );
};

export default function EvaluationFormResponsesPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const canManageForms = usePermission(PERMISSIONS.EVALUATION_FORMS_MANAGE);
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const hasValidId = Boolean(id) && id !== 'undefined' && id !== 'null';

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [selectedResponse, setSelectedResponse] =
    useState<EvaluationFormResponse | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    semester: '',
    department: '',
  });
  const [reportSemester, setReportSemester] = useState('');
  const [reportRequest, setReportRequest] = useState(0);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: form, isLoading: isFormLoading } = useQuery<EvaluationForm>({
    queryKey: ['evaluation-forms', id],
    queryFn: () => getEvaluationForm(String(id)),
    enabled: hasValidId,
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
    enabled: hasValidId,
  });

  const {
    data: responses = [],
    isLoading: isResponsesLoading,
  } = useQuery<EvaluationFormResponse[]>({
    queryKey: ['evaluation-form-responses', id, filters],
    queryFn: () =>
      getEvaluationFormResponses(String(id), {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        semester: filters.semester || undefined,
        department: filters.department || undefined,
      }),
    enabled: hasValidId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => bulkUploadEvaluationFormResponses(String(id), file),
    onSuccess: (result) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['evaluation-form-responses', id] });
      if (result.errors.length === 0) {
        toast.success(`Uploaded ${result.successfulResponses} responses.`);
      } else {
        alert.showWarning(
          `Uploaded with ${result.errors.length} errors. Check details below.`,
          { title: 'Upload Warning' },
        );
      }
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to upload responses.',
        { title: 'Upload Failed' },
      );
    },
  });

  const sortedResponses = useMemo(
    () =>
      [...responses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [responses],
  );

  const paginatedResponses = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return sortedResponses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedResponses, page]);

  const totalPages = Math.ceil(sortedResponses.length / ITEMS_PER_PAGE);

  const {
    data: report,
    isLoading: isReportLoading,
  } = useQuery<EvaluationFormResponseReport>({
    queryKey: ['evaluation-form-responses-report', id, reportSemester, reportRequest],
    queryFn: () => getEvaluationFormResponsesReport(String(id), reportSemester || undefined),
    enabled: hasValidId && reportRequest > 0,
  });

  const reportSections = useMemo(() => {
    if (!report) return [];
    const sections = new Map<
      string,
      {
        name: string;
        items: EvaluationFormResponseReport['items'];
        totalScore: number;
        totalCount: number;
        sumAverage: number;
        sumPercentage: number;
      }
    >();

    report.items.forEach((item) => {
      const current =
        sections.get(item.section) || {
          name: item.section,
          items: [],
          totalScore: 0,
          totalCount: 0,
          sumAverage: 0,
          sumPercentage: 0,
        };
      current.items.push(item);
      current.totalScore += item.averageScore * item.respondentCount;
      current.totalCount += item.respondentCount;
      current.sumAverage += item.averageScore;
      current.sumPercentage += item.percentage;
      sections.set(item.section, current);
    });

    return Array.from(sections.values()).map((section) => {
      const averageScore =
        section.totalCount > 0 ? section.totalScore / section.totalCount : 0;
      return {
        ...section,
        averageScore,
        percentage: averageScore ? (averageScore / 5) * 100 : 0,
      };
    });
  }, [report]);

  const reportTotals = useMemo(() => {
    if (!reportSections.length) return null;
    const sumAverage = reportSections.reduce(
      (total, section) => total + section.sumAverage,
      0,
    );
    const sumPercentage = reportSections.reduce(
      (total, section) => total + section.sumPercentage,
      0,
    );
    const totalCount = reportSections.reduce(
      (total, section) => total + section.totalCount,
      0,
    );
    return { sumAverage, sumPercentage, totalCount };
  }, [reportSections]);

  const handleDownloadTemplate = async () => {
    if (!hasValidId) return;
    try {
      const blob = await downloadEvaluationFormResponsesTemplate(String(id));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'evaluation-form-responses-template.xlsx';
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('Template downloaded.');
    } catch (error) {
      alert.showError('Failed to download template.', { title: 'Download Failed' });
    }
  };

  const handleExportResponses = async () => {
    if (!hasValidId) return;
    try {
      const blob = await downloadEvaluationFormResponsesExport(String(id), {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        semester: filters.semester || undefined,
        department: filters.department || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'evaluation-form-responses.xlsx';
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('Responses exported.');
    } catch (error) {
      alert.showError('Failed to export responses.', { title: 'Export Failed' });
    }
  };

  const handleUpload = () => {
    if (!canManageForms) {
      alert.showWarning('You do not have permission to upload responses.');
      return;
    }
    if (!selectedFile) {
      alert.showWarning('Please select a file to upload.');
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  if (!hasValidId) {
    return <div className="p-4">Invalid form id.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Form Responses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and review answers for this evaluation form.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-muted-foreground">
            <Link href="/admin/evaluation-forms" className="hover:underline">
              Evaluation Forms
            </Link>{' '}
            / Responses
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
              Download template
            </Button>
            <Button type="button" variant="outline" onClick={handleExportResponses}>
              Export responses
            </Button>
            <Button type="button" onClick={() => setIsUploadOpen(true)}>
              Upload responses
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isFormLoading ? 'Loading form...' : form?.name || 'Evaluation Form'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Start date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, startDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">End date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, endDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Semester</label>
              <Select
                value={filters.semester || ALL_OPTION_VALUE}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    semester: value === ALL_OPTION_VALUE ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION_VALUE}>All semesters</SelectItem>
                  {buildSemesterOptions().map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Department</label>
              <Select
                value={filters.department || ALL_OPTION_VALUE}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    department: value === ALL_OPTION_VALUE ? '' : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION_VALUE}>All departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department._id} value={department.name}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {isResponsesLoading ? (
            <div className="text-sm text-muted-foreground">Loading responses...</div>
          ) : sortedResponses.length === 0 ? (
            <div className="text-sm text-muted-foreground">No responses uploaded yet.</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Respondent</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Total Score</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResponses.map((response) => (
                      <TableRow key={response._id}>
                        <TableCell>{response.respondentName || '—'}</TableCell>
                        <TableCell>{response.respondentEmail || '—'}</TableCell>
                        <TableCell>{response.respondentDepartment || '—'}</TableCell>
                        <TableCell>{response.semester || '—'}</TableCell>
                        <TableCell>{response.totalScore ?? '—'}</TableCell>
                        <TableCell>
                          {new Date(response.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResponse(response)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          aria-disabled={page === 1}
                          className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {page > 2 && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(1);
                            }}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {page > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {page > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(page - 1);
                            }}
                          >
                            {page - 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          {page}
                        </PaginationLink>
                      </PaginationItem>

                      {page < totalPages && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(page + 1);
                            }}
                          >
                            {page + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {page < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {page < totalPages - 1 && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(totalPages);
                            }}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages) setPage(page + 1);
                          }}
                          aria-disabled={page === totalPages}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Semester Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Semester</label>
              <Select
                value={reportSemester || ALL_OPTION_VALUE}
                onValueChange={(value) =>
                  setReportSemester(value === ALL_OPTION_VALUE ? '' : value)
                }
              >
                <SelectTrigger className="min-w-[220px]">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION_VALUE}>All semesters</SelectItem>
                  {buildSemesterOptions().map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReportRequest((current) => current + 1)}
            >
              Generate report
            </Button>
          </div>

          {reportRequest === 0 ? (
            <p className="text-sm text-muted-foreground">
              Select a semester and click Generate report.
            </p>
          ) : isReportLoading ? (
            <p className="text-sm text-muted-foreground">Generating report...</p>
          ) : report ? (
            <div className="space-y-4">
              {reportTotals && (
                <div className="rounded-lg border p-4 bg-muted/20">
                  <p className="text-xs text-muted-foreground">Grand Total Percentage</p>
                  <p className="text-3xl font-semibold mt-1">
                    {reportTotals.sumPercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sum of all item percentages across sections
                  </p>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Total responses: {report.totalResponses} · Overall average:{' '}
                {report.overallAverageScore.toFixed(2)} · Overall percentage:{' '}
                {report.overallPercentage.toFixed(2)}%
              </div>
              {report.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No responses found for the selected semester.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Responses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportSections.map((section) => (
                      <>
                        <TableRow key={`${section.name}-header`}>
                          <TableCell className="font-semibold" colSpan={5}>
                            {section.name}
                          </TableCell>
                        </TableRow>
                        {section.items.map((item) => (
                          <TableRow key={`${item.section}-${item.item}`}>
                            <TableCell className="whitespace-normal">
                              {item.section}
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              {item.item}
                            </TableCell>
                            <TableCell>{item.averageScore.toFixed(2)}</TableCell>
                            <TableCell>{item.percentage.toFixed(2)}%</TableCell>
                            <TableCell>{item.respondentCount}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow key={`${section.name}-subtotal`}>
                          <TableCell className="font-semibold">Subtotal</TableCell>
                          <TableCell />
                          <TableCell className="font-semibold">
                            {section.sumAverage.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {section.sumPercentage.toFixed(2)}%
                          </TableCell>
                          <TableCell className="font-semibold">
                            {section.totalCount}
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                    {reportTotals && (
                      <TableRow>
                        <TableCell className="font-semibold">Grand Total</TableCell>
                        <TableCell />
                        <TableCell className="font-semibold">
                          {reportTotals.sumAverage.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {reportTotals.sumPercentage.toFixed(2)}%
                        </TableCell>
                        <TableCell className="font-semibold">
                          {reportTotals.totalCount}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Unable to generate report.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Responses</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSelectedFile(file);
                setUploadResult(null);
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                Upload
              </Button>
            </div>
            {uploadResult && (
              <div className="text-sm text-muted-foreground">
                Uploaded {uploadResult.successfulResponses} responses with{' '}
                {uploadResult.errors.length} errors.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedResponse)} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-semibold">Respondent:</span>{' '}
                  {selectedResponse.respondentName || '—'}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{' '}
                  {selectedResponse.respondentEmail || '—'}
                </div>
                <div>
                  <span className="font-semibold">Department:</span>{' '}
                  {selectedResponse.respondentDepartment || '—'}
                </div>
                <div>
                  <span className="font-semibold">Semester:</span>{' '}
                  {selectedResponse.semester || '—'}
                </div>
                <div>
                  <span className="font-semibold">Evaluator:</span>{' '}
                  {selectedResponse.evaluator || '—'}
                </div>
                <div>
                  <span className="font-semibold">Submitted:</span>{' '}
                  {new Date(selectedResponse.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Total Score:</span>{' '}
                  {selectedResponse.totalScore ?? '—'}
                </div>
              </div>

              {selectedResponse.answers.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No answers provided.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedResponse.answers.map((answer, idx) => (
                      <TableRow key={`${answer.section}-${answer.item}-${idx}`}>
                        <TableCell className="whitespace-normal">
                          {answer.section}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {answer.item}
                        </TableCell>
                        <TableCell>{answer.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
