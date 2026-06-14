import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale, ShieldCheck, Zap, Server, BrainCircuit } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-20 border-b flex items-center justify-between px-6 md:px-12 bg-card">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary">
          <Scale className="h-8 w-8" />
          <span>ملف برو</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">تسجيل الدخول</Button>
          </Link>
          <Link to="/login">
             <Button>ابدأ مجاناً</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="py-24 px-6 md:px-12 text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
            المنصة القانونية المتكاملة رقم 1 في مصر
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            أدر مكتب المحاماة الخاص بك <br className="hidden md:block"/> بكفاءة وأمان
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            منصة SaaS شاملة لإدارة القضايا، الموكلين، الفواتير الإلكترونية (مصلحة الضرائب)، 
            معززة بالذكاء الاصطناعي وبنية تحتية عالية التشفير تضمن خصوصية الموكلين التامة.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/login">
              <Button size="lg" className="h-12 px-8 text-lg">
                تجربة النظام
              </Button>
            </Link>
            <Link to="/privacy">
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                اعرف المزيد عن الأمان
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-24 bg-muted/30 px-6 md:px-12">
          <div className="max-w-6xl mx-auto text-center space-y-16">
             <h2 className="text-3xl font-bold">لماذا ملف برو؟</h2>
             
             <div className="grid md:grid-cols-3 gap-8 text-right">
                <div className="bg-card p-8 rounded-xl shadow-sm border border-border/50 space-y-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">خصوصية فائقة</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    تشفير كامل للبيانات الحساسة، عزل تام لبيانات كل مكتب (RLS)، وامتثال كامل لقانون حماية البيانات الشخصية رقم 151 لسنة 2020. لا نشارك بيانات موكليك مع أي طرف ثالث.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-xl shadow-sm border border-border/50 space-y-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">ذكاء اصطناعي آمن</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    من خلال تحليل المستندات والصياغة القانونية وفحص التعارض الآلي، نساعدك في تسريع وتيرة عملك مع ضمان عدم استخدام بيانات قضاياك في تدريب النماذج العامة.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-xl shadow-sm border border-border/50 space-y-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Server className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">تكامل مع الأنظمة المصرية</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    رط مباشر مع الفواتير الإلكترونية لمصلحة الضرائب المصرية (ETA)، ووحدات متابعة متخصصة للمحاكم الاقتصادية ومجلس الدولة.
                  </p>
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-6 md:px-12 bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Scale className="h-6 w-6" />
            <span>ملف برو</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">شروط الخدمة</Link>
            <span>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
