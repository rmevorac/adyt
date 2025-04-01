// Export all image-related types
export * from './image';

// Add user and project types from the API
export interface User {
  id: string;
  email: string;
  name: string | null;
  projects?: Project[];
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
} 