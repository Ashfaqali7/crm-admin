# CRM Admin Dashboard

A modern, responsive CRM (Customer Relationship Management) dashboard built with React, TypeScript, and Ant Design.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Components](#components)
- [Services](#services)
- [Data Models](#data-models)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure login and signup with role-based access control
- **Dashboard Analytics**: Visualize key metrics with interactive charts
- **Lead Management**: Track and manage potential customers
- **Deal Pipeline**: Drag-and-drop interface for managing sales deals
- **Task Management**: Assign and track tasks with due dates
- **User Management**: Admin panel for managing team members
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between color schemes with custom theme tokens
- **Protected Routes**: Role-based route protection for admin/user access control

## Tech Stack

- **Frontend**: [React 19](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Ant Design 5](https://ant.design/)
- **State Management**: React Context API with custom hooks
- **Charts**: [@ant-design/charts](https://charts.ant.design/)
- **Drag & Drop**: [@dnd-kit](https://docs.dndkit.com/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: [Supabase](https://supabase.io/)
- **Styling**: CSS Modules and Ant Design's built-in styling with custom theme tokens
- **Icons**: [@ant-design/icons](https://github.com/ant-design/ant-design-icons)

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd crm-admin
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── assets/               # Static assets (images, icons, etc.)
├── components/           # Reusable UI components
├── constants/            # Application constants
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── services/             # API services and data fetching
├── types/                # TypeScript types and interfaces
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Previews the production build locally
- `npm run lint` - Runs ESLint to check for code issues

## Components

### AppLayout
The main layout component that includes the sidebar and navbar.

### ProtectedRoute
A wrapper component that protects routes based on authentication status and user roles.

### ThemeToggle
A component that allows users to switch between light and dark themes.

### DealCard
Displays individual deal information in the deals pipeline.

### DealColumn
Represents a column in the deals pipeline (e.g., New, In Progress, Won, Lost).

### StatusTag
A tag component for displaying status with color coding.

### Navbar
The top navigation bar component.

### Sidebar
The side navigation menu component.

## Services

### BaseService
A generic service that provides CRUD operations for all entities.

### leadsService
Handles API calls related to leads management.

### dealsService
Handles API calls related to deals management.

### tasksService
Handles API calls related to tasks management.

### usersService
Handles API calls related to user management.

### supabaseClient
The Supabase client instance used for authentication and database operations.

## Data Models

### Profile
```typescript
interface Profile {
  id: string;
  role: 'admin' | 'sales';
  full_name: string;
  phone: string;
  created_at: string;
}
```

### Lead
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  assigned_to: string | null;
  created_at: string;
  company?: string;
}
```

### Deal
```typescript
interface Deal {
  id: string;
  lead_id: string;
  title: string;
  value: number;
  stage: 'New' | 'In Progress' | 'Won' | 'Lost';
  assigned_to: string | null;
  created_at: string;
}
```

### Task
```typescript
interface Task {
  id: string;
  lead_id: string;
  description: string;
  due_date: string;
  status: 'Pending' | 'Done';
  created_at: string;
  title: string;
}
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The build output will be in the `dist/` directory, which can be deployed to any static hosting service.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.