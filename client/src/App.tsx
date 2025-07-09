import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormBuilderProvider } from './contexts/FormBuilderContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormView from './pages/FormView';
import Submissions from './pages/Submissions';
import NotFound from './pages/NotFound';

function App() {
  return (
    <FormBuilderProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="forms/new" element={<FormBuilder />} />
          <Route path="forms/:id/edit" element={<FormBuilder />} />
          <Route path="forms/:id/submissions" element={<Submissions />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/form/:id" element={<FormView />} />
      </Routes>
    </FormBuilderProvider>
  );
}

export default App;