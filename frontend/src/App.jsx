import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignUpPage from './pages/auth/SignUpPage.jsx';
import { Toaster, toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from './lib/axios.js';
import {Loader} from "lucide-react";
export default function App() {
  const { data: authUser = null, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        return res.data.user;
      } catch (err) {
        if (err.response?.status === 401) return null;

        toast.error(err.response?.data?.message || 'Something went wrong');
        throw err;
      }
    },
    retry: false,
  });

  if (isLoading) return <Loader />;

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" replace /> : <SignUpPage />}
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" replace /> : <LoginPage />}
        />
      </Routes>
      <Toaster />
    </Layout>
  );
}
