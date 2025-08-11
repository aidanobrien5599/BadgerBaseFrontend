import { FilterState, ApiResponse } from '../types/Course';

const API_BASE_URL = 'https://your-api-endpoint.com'; // Replace with your actual API endpoint
const CLIENT_SECRET = 'your-client-secret'; // Replace with your actual client secret

class ApiService {
  async searchCourses(filters: FilterState, page: number = 1): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());

      // Add all non-empty filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== false) {
          if (typeof value === 'boolean') {
            params.append(key, 'true');
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/query?${params.toString()}`, {
        headers: {
          'x-client-secret': CLIENT_SECRET,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('API Service Error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();