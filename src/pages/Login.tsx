import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { User, UserRole } from '@/types';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let role: UserRole | null = null;

    if (email === 'admin@malafpro.com' && password === 'admin123') {
      role = 'admin';
    } else if (email === 'lawyer@malafpro.com' && password === 'lawyer123') {
      role = 'lawyer';
    } else if (email === 'client@malafpro.com' && password === 'client123') {
      role = 'client';
    }

    if (role) {
      const user: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0],
        email: email,
        role: role,
        organizationId: 'org-1'
      };
      login(user);
      navigate('/dashboard');
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Scale className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وكلمة المرور للولوج لمنصة ملف برو
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                البريد الإلكتروني
              </label>
              <Input 
                id="email" 
                placeholder="m.hosainy@lawfirm.com" 
                type="email" 
                required 
                dir="ltr"
                className="text-right"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  كلمة المرور
                </label>
                <a href="#" className="text-xs text-primary hover:underline">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit">
              تسجيل الدخول
            </Button>
            <div className="text-sm text-center text-muted-foreground pt-4 border-t w-full">
              بالنقر على تسجيل الدخول، أنت توافق على{' '}
              <Link to="/terms" className="underline hover:text-primary">
                شروط الخدمة
              </Link>{' '}
              و{' '}
              <Link to="/privacy" className="underline hover:text-primary">
                سياسة الخصوصية
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
