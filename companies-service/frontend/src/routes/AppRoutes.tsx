import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { Dashboard } from '../components/Dashboard';
import { UserManagement } from '../components/UserManagement';
import { CompanyManagement } from '../components/CompanyManagement';
import { DepartmentManagement } from '../components/DepartmentManagement';
import { UserProfile } from '../components/UserProfile';
import { JobList } from '../components/JobList';
import { JobForm } from '../components/JobForm';
import { JobView } from '../components/JobView';
import { JobLogs } from '../components/JobLogs';
import { JobStagesForm } from '../components/JobStagesForm';
import { CreateJobWithAi } from '../components/CreateJobWithAi';
import { DragTest } from '../components/DragTest';
import { AppLayout } from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, currentUser, isAdmin } = useAuthContext();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              currentUser={currentUser}
              isAdmin={isAdmin()}
            />
          } 
        />
        <Route 
          path="/users" 
          element={<UserManagement />} 
        />
        <Route 
          path="/company" 
          element={<CompanyManagement />} 
        />
        <Route 
          path="/departments" 
          element={
            <DepartmentManagement 
              currentUser={currentUser}
            />
          } 
        />
        <Route 
          path="/profile" 
          element={<UserProfile />} 
        />
        <Route 
          path="/jobs" 
          element={<JobList />} 
        />
        <Route 
          path="/jobs/new" 
          element={<JobForm />} 
        />
        <Route 
          path="/jobs/new-with-ai" 
          element={<CreateJobWithAi />} 
        />
        <Route 
          path="/jobs/:id" 
          element={<JobView />} 
        />
        <Route 
          path="/jobs/:id/edit" 
          element={<JobForm />} 
        />
        <Route 
          path="/jobs/:id/stages" 
          element={<JobStagesForm />} 
        />
        <Route 
          path="/jobs/:id/logs" 
          element={<JobLogs />} 
        />
        <Route 
          path="/test-drag" 
          element={<DragTest />} 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}; 