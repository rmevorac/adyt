# Image Management System

A web application for managing and reviewing images. This system allows users to select, revise, or reject images, add notes, and organize images in projects.

## Features

- Image organization in projects
- Image selection workflow (Select/Buy, Revise/Edit, Reject)
- Note-taking for each selection state
- User and project management

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM

## Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Database Setup

1. Install PostgreSQL and create a database:

```bash
# Using PostgreSQL commands
createdb image_manager

# Or using psql
psql
CREATE DATABASE image_manager;
\q
```

2. Update the `.env` file with your database connection string:

```
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/image_manager?schema=public"
```

Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials.

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up the database:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed

# Or run all database setup steps at once
npm run db:setup
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## API Documentation

The application provides the following API endpoints:

### Images

- `GET /api/images` - Get all images
- `GET /api/images?projectId=<id>` - Get images by project
- `GET /api/images/:id` - Get a specific image
- `POST /api/images` - Create a new image
- `PUT /api/images/:id` - Update an image
- `PUT /api/images/:id/notes` - Update image notes
- `DELETE /api/images/:id` - Delete an image

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a specific project with its images
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project and its images

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user with their projects
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user and all associated data

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
