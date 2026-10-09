import { useState, useEffect, useCallback } from 'react';
import { TechnicalReport, FilterOptions, CreateReportDTO } from '../types';
import { reportService } from '../services/reportService';

export const useReports = (initialFilters?: Partial<FilterOptions>, initialPageSize: number = 8) => {
  const [reports, setReports] = useState<TechnicalReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(initialPageSize);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    equipment: 'ALL',
    sortBy: 'date_desc',
    ...initialFilters,
  });

  // Al cambiar los filtros, reseteamos a la página 1
  const updateFilters = useCallback((newFilters: React.SetStateAction<FilterOptions>) => {
    setPage(1);
    setFilters(newFilters);
  }, []);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await reportService.getPaginatedReports(page, pageSize, filters);
      setReports(res.data);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los informes');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const createReport = async (dto: CreateReportDTO): Promise<TechnicalReport> => {
    const created = await reportService.createReport(dto);
    setPage(1);
    await fetchReports();
    return created;
  };

  const deleteReport = async (id: string, requestorId: string): Promise<void> => {
    await reportService.deleteReport(id, requestorId);
    await fetchReports();
  };

  return {
    reports,
    totalCount,
    totalPages,
    page,
    pageSize,
    setPage,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    refreshReports: fetchReports,
    createReport,
    deleteReport,
  };
};
