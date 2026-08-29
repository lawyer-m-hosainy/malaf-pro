import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Scale, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [officeName, setOfficeName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', { officeName, name, email, password });
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setAuth(user, accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
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
          <CardTitle className="text-2xl font-bold">إنشاء حساب مكتب جديد</CardTitle>
          <CardDescription>
            سجّل مكتبك على منصة ملف برو وابدأ إدارة قضاياك في دقائق
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="officeName">
                اسم المكتب
              </label>
              <Input
                id="officeName"
                placeholder="مكتب المحاماة والاستشارات القانونية"
                type="text"
                required
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                اسمك الكامل
              </label>
              <Input
                id="name"
                placeholder="محمد حساني"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">8 أحرف على الأقل</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء الحساب'
              )}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                تسجيل الدخول
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground pt-4 border-t w-full">
              بإنشاء الحساب، أنت توافق على{' '}
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
