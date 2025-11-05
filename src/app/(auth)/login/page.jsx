'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

const LoginPage = () => {
  const router = useRouter();
  const { login, loading } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login successful! Redirecting...');
        router.push('/select-portal');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen relative flex">
      <div className="fixed inset-0 -z-10 bg-white/60" />

      {/* Left side - Branding overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="relative z-10 flex flex-col justify-center items-center p-12">
          <div className="text-center mx-50">
            <h1 className="text-7xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-neutral-700 mb-8">
              Access your HRMS & Asset Tracker portals
            </p>
            <div className="w-24 h-1 bg-neutral-300 rounded-full mx-auto" />
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Sign In</h2>
            <p className="text-neutral-700">
              Enter your credentials to access your account
            </p>
          </div>

          <Card variant="glass" className="backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                icon={<Mail className="w-4 h-4" />}
                placeholder="Enter your email"
                variant="glass"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                icon={<Lock className="w-4 h-4" />}
                placeholder="Enter your password"
                variant="glass"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-primary-700 bg-white focus:ring-neutral-300"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-neutral-700 hover:text-neutral-900"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white"
                loading={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </form>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              Don't have an account?{' '}
              <a href="#" className="text-white hover:text-white font-medium underline underline-offset-4">
                Contact your administrator
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
