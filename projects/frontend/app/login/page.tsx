'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      router.push(loggedUser.role === 'employee' ? '/employee' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login buttons for bypass
  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    // Auto submit after a brief delay
    setTimeout(() => {
      login(userEmail, userPassword)
        .then((loggedUser) => router.push(loggedUser.role === 'employee' ? '/employee' : '/dashboard'))
        .catch((err) => setError(err.message || 'Login failed'));
    }, 100);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to HRMS Portal</CardTitle>
          <CardDescription>Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@vectorlytics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
            {/* Quick Login Buttons */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Quick Login (Bypass):</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('admin@vectorlytics.com', 'admin123')}
                  disabled={loading}
                  className="text-xs"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('hr@vectorlytics.com', 'hr123')}
                  disabled={loading}
                  className="text-xs"
                >
                  HR
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('manager@vectorlytics.com', 'manager123')}
                  disabled={loading}
                  className="text-xs"
                >
                  Manager
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('employee@vectorlytics.com', 'employee123')}
                  disabled={loading}
                  className="text-xs"
                >
                  Employee
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold">Demo Credentials:</p>
              <p>Admin: admin@vectorlytics.com / admin123</p>
              <p>HR: hr@vectorlytics.com / hr123</p>
              <p>Manager: manager@vectorlytics.com / manager123</p>
              <p>Employee: employee@vectorlytics.com / employee123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
