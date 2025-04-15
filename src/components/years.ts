
import { fetchTableData, createRecord, updateRecord, deleteRecord, DatabaseRecord, ApiResponse } from '../services/databaseApi';

export interface YearData extends DatabaseRecord {
  year: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

export const getAllYears = async (): Promise<ApiResponse<YearData[]>> => {
  const response = await fetchTableData<YearData[]>('years');
  
  // Sort years in descending order if data is available
  if (response.data) {
    response.data.sort((a, b) => {
      const yearA = parseInt(a.year);
      const yearB = parseInt(b.year);
      return yearB - yearA; // Descending order
    });
  }
  
  return response;
};

export const getYearByName = async (yearName: string): Promise<ApiResponse<YearData>> => {
  try {
    const response = await fetchTableData<YearData[]>('years');
    if (response.data) {
      const year = response.data.find(y => y.year === yearName);
      if (year) {
        return { data: year, error: null };
      }
      return { data: null, error: new Error('Year not found') };
    }
    return { data: null, error: response.error };
  } catch (error) {
    console.error('Error fetching year by name:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const createYear = async (yearData: Omit<YearData, 'id'>): Promise<ApiResponse<YearData>> => {
  return await createRecord<YearData>('years', yearData);
};

export const updateYear = async (id: string, yearData: Partial<YearData>): Promise<ApiResponse<YearData>> => {
  return await updateRecord<YearData>('years', id, yearData);
};

export const deleteYear = async (id: string): Promise<ApiResponse<void>> => {
  return await deleteRecord('years', id);
};
