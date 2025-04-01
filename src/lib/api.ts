/**
 * Utility functions for making API calls
 */

// Base API URL - will be relative in Next.js
const API_BASE = '/api';

// Generic fetch wrapper for API calls
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }
  
  return data;
}

// API functions for images
export const imagesAPI = {
  // Get all images or filtered by project
  getAll: async (projectId?: string) => {
    const endpoint = projectId ? `/images?projectId=${projectId}` : '/images';
    return fetchAPI<{ images: Image[] }>(endpoint);
  },
  
  // Get a single image by ID
  getById: async (id: string) => {
    return fetchAPI<{ image: Image }>(`/images/${id}`);
  },
  
  // Create a new image
  create: async (data: { url: string; projectId: string }) => {
    return fetchAPI<{ image: Image }>('/images', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update an image
  update: async (id: string, data: Partial<Image>) => {
    return fetchAPI<{ image: Image }>(`/images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Update image notes
  updateNotes: async (id: string, type: 'reviseNote' | 'rejectNote' | 'reelNote', content: string) => {
    return fetchAPI<{ image: Image }>(`/images/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify({ type, content }),
    });
  },
  
  // Delete an image
  delete: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/images/${id}`, {
      method: 'DELETE',
    });
  },
};

// API functions for projects
export const projectsAPI = {
  // Get all projects
  getAll: async () => {
    return fetchAPI<{ projects: Project[] }>('/projects');
  },
  
  // Get a project by ID with its images
  getById: async (id: string) => {
    return fetchAPI<{ project: Project }>(`/projects/${id}`);
  },
  
  // Create a new project
  create: async (data: { name: string; description?: string; userId: string }) => {
    return fetchAPI<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update a project
  update: async (id: string, data: { name: string; description?: string }) => {
    return fetchAPI<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete a project
  delete: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// API functions for users
export const usersAPI = {
  // Get all users
  getAll: async () => {
    return fetchAPI<{ users: User[] }>('/users');
  },
  
  // Get a user by ID
  getById: async (id: string) => {
    return fetchAPI<{ user: User }>(`/users/${id}`);
  },
  
  // Create a new user
  create: async (data: { email: string; name?: string }) => {
    return fetchAPI<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Update a user
  update: async (id: string, data: { name: string }) => {
    return fetchAPI<{ user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete a user
  delete: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Types for API responses
export interface Image {
  id: string;
  url: string;
  projectId: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
  reviseNote: string | null;
  rejectNote: string | null;
  reelNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// New concept-based representation for future API implementations
export interface ImageConcept {
  id: string;
  name: string;
  directoryPath: string;
  projectId: string;
  variations: ImageVariation[];
  createdAt: string;
  updatedAt: string;
}

export interface ImageVariation {
  id: string;
  url: string;
  conceptId: string;
  selected: boolean;
  revise: boolean;
  reject: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  images?: Image[];
  concepts?: ImageConcept[]; // For future implementations
  createdAt: string;
  updatedAt: string;
  _count?: {
    images: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  projects?: Project[];
  createdAt: string;
  updatedAt?: string;
} 