// Mock implementation of PrismaClient for deployments without a database
const mockPrismaClient = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    update: async (data: any) => ({ id: 'mock-id', ...data.data }),
    delete: async () => ({}),
    count: async () => 0,
  },
  image: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    update: async (data: any) => ({ id: 'mock-id', ...data.data }),
    delete: async () => ({}),
    count: async () => 0,
  },
  project: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    update: async (data: any) => ({ id: 'mock-id', ...data.data }),
    delete: async () => ({}),
    count: async () => 0,
  },
  // Add more models as needed
};

export { mockPrismaClient }; 