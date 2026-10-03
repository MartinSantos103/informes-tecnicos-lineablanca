/**
 * Cliente HTTP ligero para invocar los endpoints de la API de Neon (/api/*)
 */
export const apiClient = {
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const fullUrl = new URL(url, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          fullUrl.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(fullUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error en la solicitud GET ${url} (${response.status})`);
    }

    return response.json();
  },

  async post<T>(url: string, body?: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error en la solicitud POST ${url} (${response.status})`);
    }

    return response.json();
  },

  async put<T>(url: string, body?: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error en la solicitud PUT ${url} (${response.status})`);
    }

    return response.json();
  },
};
