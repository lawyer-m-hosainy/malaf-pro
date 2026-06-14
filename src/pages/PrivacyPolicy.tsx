import { Scale, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="h-16 border-b flex items-center px-6 md:px-12 bg-card">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Scale className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">سياسة الخصوصية</h1>
              <p className="text-muted-foreground mt-1">آخر تحديث: 12 يونيو 2026</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground rtl">
            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">1. التزامنا الصارم بالخصوصية</h2>
            <p>
              تدرك منصة "ملف برو" حساسية البيانات القانونية. نحن نمتثل التزاماً تاماً لقانون حماية البيانات الشخصية المصري (رقم 151 لسنة 2020) وكذلك للمعايير الدولية مثل الـ GDPR. نضمن أن بيانات موكليك محمية بأقصى درجات الأمان.
            </p>

            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">2. التشفير الكامل (End-to-End Encryption)</h2>
            <p>
              يتم تشفير كافة البيانات الحساسة (أسماء الموكلين، تفاصيل القضايا، المبالغ المالية، المستندات المرفوعة) في حالة السكون (at rest) وفي حالة الانتقال (in transit). لا يملك فريق الدعم في منصة "ملف برو" قدرة على قراءة محتوى قضاياك.
            </p>

            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">3. العزل الشامل للبيانات (Row Level Security)</h2>
            <p>
              نستخدم سياسات الأمان على مستوى الصفوف (RLS) وقواعد البيانات المعزولة منطقياً لمنع أي تداخل بين مكاتب المحاماة. بياناتك تظهر فقط للمستخدمين المصرح لهم داخل مؤسستك.
            </p>

            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">4. سياسة الذكاء الاصطناعي (AI Data Usage)</h2>
            <p>
              جميع العمليات المتعلقة بمحلل المستندات أو الصياغة الآلية تتم عبر طبقات معزولة. <strong>نضمن بشكل قاطع عدم استخدام مستنداتك أو بيانات موكليك في تدريب نماذج الذكاء الاصطناعي العامة.</strong>
            </p>

            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">5. حق النسيان وتصدير البيانات</h2>
            <p>
              يحق لك كمشترك تصدير قاعدة بيانات مكتبك بالكامل في أي وقت. كما يحق لك المطالبة بحذف الحساب وجميع البيانات المرتبطة به نهائياً (الحذف الآمن) بما يتماشى مع الالتزامات القانونية.
            </p>

             <h2 className="text-foreground text-xl font-bold mt-8 mb-4">6. سجل المراجعة (Audit Log)</h2>
            <p>
              يوفر النظام سجل تدقيق غير قابل للتعديل (Append-Only) لتسجيل من قام بالوصول لأي ملف داخل المكتب الموكل، مما يسهل رصد أي تسريب داخلي لحماية خصوصية العملاء.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
