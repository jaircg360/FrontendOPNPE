import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// URL base del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  signUp: async (email: string, password: string, fullName: string) => {
    const response = await apiClient.post('/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  signIn: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/signin', {
      email,
      password,
    });
    return response.data;
  },

  signOut: async () => {
    const response = await apiClient.post('/auth/signout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// ==================== CANDIDATES API ====================
export const candidatesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/candidates');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/candidates/${id}`);
    return response.data;
  },

  create: async (candidate: {
    name: string;
    party: string;
    description?: string;
    image_url?: string;
    proposals?: string[];
  }) => {
    const response = await apiClient.post('/candidates', candidate);
    return response.data;
  },

  getVoteCount: async (id: string) => {
    const response = await apiClient.get(`/candidates/${id}/votes/count`);
    return response.data;
  },
};

// ==================== VOTES API ====================
export const votesAPI = {
  create: async (vote: {
    candidate_id: string;
    full_name: string;
    dni: string;
    phone: string;
    department: string;
    province: string;
    district: string;
    address: string;
  }) => {
    const response = await apiClient.post('/votes', vote);
    return response.data;
  },

  checkUserVote: async () => {
    const response = await apiClient.get('/votes/check');
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get('/votes/all');
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/votes/statistics');
    return response.data;
  },

  getVoteCounts: async () => {
    const response = await apiClient.get('/votes/counts');
    return response.data;
  },
};

// ==================== DATA PROCESSING API ====================
export const dataAPI = {
  getElectoralDataStats: async () => {
    const response = await apiClient.get('/data/electoral-data/stats');
    return response.data;
  },

  cleanData: async (options: {
    handleNulls: boolean;
    normalizeData: boolean;
    encodeCategories: boolean;
    removeDuplicates: boolean;
  }) => {
    const response = await apiClient.post('/data/clean', options);
    return response.data;
  },

  processModel: async (config: {
    modelType: string;
    isProcessing: boolean;
    isComplete: boolean;
  }) => {
    const response = await apiClient.post('/data/process', config);
    return response.data;
  },

  getStatus: async () => {
    const response = await apiClient.get('/data/status');
    return response.data;
  },

  getPredictions: async () => {
    const response = await apiClient.get('/data/predictions');
    return response.data;
  },

  getElectoralYears: async () => {
    const response = await apiClient.get('/data/electoral-years');
    return response.data;
  },

  getRealVotesByYear: async (year: number) => {
    const response = await apiClient.get(`/data/real-votes/${year}`);
    return response.data;
  },

  getVotesByDepartment: async () => {
    const response = await apiClient.get('/data/votes-by-department');
    return response.data;
  },

  getParticipationByYear: async () => {
    const response = await apiClient.get('/data/participation-by-year');
    return response.data;
  },

  getVotesByParty: async () => {
    const response = await apiClient.get('/data/votes-by-party');
    return response.data;
  },

  getModelMetrics: async () => {
    const response = await apiClient.get('/data/model-metrics');
    return response.data;
  },

  getCurrentModelInfo: async () => {
    const response = await apiClient.get('/data/current-model-info');
    return response.data;
  },

  getModelsHistory: async (limit: number = 10) => {
    const response = await apiClient.get(`/data/models-history?limit=${limit}`);
    return response.data;
  },
};

export default apiClient;

