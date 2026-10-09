/**
 * Cliente HTTP ligero para invocar los endpoints de la API de Neon (/api/*)
 */
async function parseErrorMessage(response: Response, defaultMessage: string): Promise<string> {
  try {
    const errorData = await response.json();
    if (typeof errorData === 'string') {
      return errorData;
    }
    if (errorData && typeof errorData.error === 'string') {
      return errorData.error;
    }
    if (errorData?.error && typeof errorData.error === 'object') {
      return errorData.error.message || errorData.error.code || JSON.stringify(errorData.error);
    }
    if (typeof errorData?.message === 'string') {
      return errorData.message;
    }
  } catch {
    try {
      const text = await response.text();
      if (text) return text.substring(0, 150);
    } catch {
      // Ignorar fallback
    }
  }
  return `${defaultMessage} (${response.status})`;
}

function getAuthHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem('app_real_user');
    if (stored) {
      const user = JSON.parse(stored);
      const headers: Record<string, string> = {};
      if (user.id) headers['x-user-id'] = user.id;
      if (user.company_id) headers['x-company-id'] = user.company_id;
      return headers;
    }
  } catch {}
  return {};
}

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
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const msg = await parseErrorMessage(response, `Error en la solicitud GET ${url}`);
      throw new Error(msg);
    }

    return response.json();
  },

  async post<T>(url: string, body?: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const msg = await parseErrorMessage(response, `Error en la solicitud POST ${url}`);
      throw new Error(msg);
    }

    return response.json();
  },

  async put<T>(url: string, body?: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const msg = await parseErrorMessage(response, `Error en la solicitud PUT ${url}`);
      throw new Error(msg);
    }

    return response.json();
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const msg = await parseErrorMessage(response, `Error en la solicitud DELETE ${url}`);
      throw new Error(msg);
    }

    // Attempt to parse JSON response, but handle empty bodies
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch {
      return {} as T;
    }
  },
};
