'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import Select from '@/components/common/Select';
import { Globe } from '@/components/visuals/Globe';
import { LogoCarousel } from '@/components/visuals/LogoCarousel';

const SignupPage = () => {
  const router = useRouter();
  const { signup, loading, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Phone number must be 10-15 digits';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const result = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/[\s-]/g, ''),
        role: formData.role,
        password: formData.password
      });
      
      if (result.success) {
        toast.success('Account created successfully! Redirecting...');
        router.push('/select-portal');
      } else {
        toast.error(result.error || 'Signup failed');
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

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-10 mt-10 text-neutral-900 whitespace-nowrap -ml-10">Get Started</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-neutral-700">
              Sign up to access your account
            </p>
          </div>

          <Card className="backdrop-blur-md mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                icon={<User className="w-4 h-4" />}
                placeholder="Enter your full name"
              />

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
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                icon={<Phone className="w-4 h-4" />}
                placeholder="Enter your phone number"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Role
                  <span className="text-danger-500 ml-1">*</span>
                </label>
                <Select
                  value={formData.role}
                  onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  error={errors.role}
                  required
                  options={[
                    { value: 'user', label: 'User' },
                    { value: 'admin', label: 'Admin' }
                  ]}
                />
                {errors.role && (
                  <div className="flex items-center text-sm text-red-600">
                    {errors.role}
                  </div>
                )}
              </div>

              <div className="relative">
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
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 flex items-center text-neutral-400 hover:text-neutral-600 z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  icon={<Lock className="w-4 h-4" />}
                  placeholder="Confirm your password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 flex items-center text-neutral-400 hover:text-neutral-600 z-10"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white"
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </form>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-neutral-700">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

