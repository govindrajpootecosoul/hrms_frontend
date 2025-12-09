'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import { Globe } from '@/components/visuals/Globe';
import { LogoCarousel } from '@/components/visuals/LogoCarousel';

const LoginPage = () => {
  const router = useRouter();
  const { login, loading, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/select-portal');
    }
  }, [isAuthenticated, loading, router]);

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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          {/* Logo Carousel */}
          <div className="mb-8 flex justify-center">
            <LogoCarousel columnCount={1} />
          </div>
          
          {/* Globe Component */}
          <div className="relative w-full max-w-[500px] h-[450px] flex items-center justify-center mt-4">
            <Globe className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-10 mt-10 text-neutral-900 whitespace-nowrap -ml-10">Welcome Back</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Sign In</h2>
            <p className="text-neutral-700">
              Enter your credentials to access your account
            </p>
          </div>

          <Card className="backdrop-blur-md mx-auto w-full">
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
            <p className="text-neutral-700">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
