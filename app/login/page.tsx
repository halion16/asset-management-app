'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

// Mock users for demo
const mockUsers = [
  {
    email: 'admin@company.com',
    password: 'admin123',
    name: 'David Luchetta',
    role: 'Admin',
    department: 'IT Management'
  },
  {
    email: 'technician@company.com', 
    password: 'tech123',
    name: 'Marco Rossi',
    role: 'Technician',
    department: 'Maintenance'
  },
  {
    email: 'manager@company.com',
    password: 'manager123', 
    name: 'Laura Bianchi',
    role: 'Manager',
    department: 'Operations'
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (user) {
      // Store user session in localStorage (mock)
      localStorage.setItem('authUser', JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      }));

      // Redirect to dashboard
      router.push('/');
    } else {
      setError('Email o password non validi');
    }

    setLoading(false);
  };

  const handleDemoLogin = (userType: 'admin' | 'technician' | 'manager') => {
    const demoUser = mockUsers.find(u => u.email.includes(userType));
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">X</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Asset Manager
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Accedi al sistema di gestione degli asset
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="inserisci@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="inserisci password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-center text-sm text-gray-600 mb-3">
              Account demo per test:
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm"
              >
                <strong>Admin:</strong> admin@company.com / admin123
              </button>
              <button
                onClick={() => handleDemoLogin('technician')}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm"
              >
                <strong>Tecnico:</strong> technician@company.com / tech123
              </button>
              <button
                onClick={() => handleDemoLogin('manager')}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm"
              >
                <strong>Manager:</strong> manager@company.com / manager123
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}