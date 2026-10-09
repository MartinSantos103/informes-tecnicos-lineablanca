import { apiClient } from './apiClient';
import { Company, TechnicalReport, CreateReportDTO, FilterOptions, PaginatedResponse } from '../types';

export const reportService = {
  /**
   * Obtener datos de la empresa
   */
  async getCompany(): Promise<Company> {
    return apiClient.get<Company>('/api/company');
  },

  /**
   * Actualizar datos de la empresa
   */
  async updateCompany(companyData: Partial<Company>): Promise<Company> {
    return apiClient.put<Company>('/api/company', companyData);
  },


  /**
   * Generar o estimar siguiente número correlativo de informe (e.g. "000008")
   */
  async getNextReportNumber(): Promise<string> {
    const res = await apiClient.get<{ nextReportNumber: string }>('/api/reports', { action: 'next-number' });
    return res.nextReportNumber || '000001';
  },

  /**
   * Obtener todos los informes (sin paginar)
   */
  async getAllReports(): Promise<TechnicalReport[]> {
    return apiClient.get<TechnicalReport[]>('/api/reports', { all: 'true' });
  },

  /**
   * Obtener informes paginados con filtros
   */
  async getPaginatedReports(
    page: number = 1,
    pageSize: number = 8,
    filters: FilterOptions
  ): Promise<PaginatedResponse<TechnicalReport>> {
    const validPage = Math.max(1, page);

    return apiClient.get<PaginatedResponse<TechnicalReport>>('/api/reports', {
      page: validPage,
      pageSize,
      searchQuery: filters.searchQuery,
      equipment: filters.equipment,
      sortBy: filters.sortBy,
    });
  },

  /**
   * Obtener un informe por su ID
   */
  async getReportById(id: string): Promise<TechnicalReport | null> {
    try {
      return await apiClient.get<TechnicalReport>('/api/reports', { id });
    } catch {
      return null;
    }
  },

  /**
   * Crear un nuevo informe técnico (atómico en Neon con correlativo automático)
   */
  async createReport(dto: CreateReportDTO): Promise<TechnicalReport> {
    return apiClient.post<TechnicalReport>('/api/reports', dto);
  },

  /**
   * Eliminar un informe técnico por ID
   */
  async deleteReport(id: string, requestorId: string): Promise<void> {
    return apiClient.delete(`/api/reports?id=${id}&requestorId=${requestorId}`);
  },
};
