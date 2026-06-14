import { Scale, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
              <h1 className="text-3xl font-bold tracking-tight">شروط الخدمة</h1>
              <p className="text-muted-foreground mt-1">آخر تحديث: 12 يونيو 2026</p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground rtl">
            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">1. قبول الشروط</h2>
            <p>
              بوصولك إلى واستخدامك لمنصة "ملف برو" كخدمة (SaaS)، فإنك توافق على الامتثال لهذه الشروط التي تخضع للقوانين المنظمة لجمهورية مصر العربية، بما فيها قانون التوقيع الإلكتروني وتكنولوجيا المعلومات.
            </p>

            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">2. التزامات مكتب المحاماة</h2>
            <p>
              أنت تقر بصفتك مستخدم للمنصة أنك تتحمل المسؤولية الكاملة عن صحة ودقة البيانات المدخلة، وأن مكتبك يمتلك الحق العادل أو التفويض الصريح من موكليك باستخدام بياناتهم وتخزينها، طبقاً لقواعد مهنة المحاماة المصرية.
            </p>

            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">3. السرية المطلقة والتزام المنصة</h2>
            <p>
              توفر منصة "ملف برو" بنية تحتية مستقرة ومحكمة الأمان. لا نقوم بأي حال ببيع أو فحص أو تعديل بيانات قضاياك. تقتصر صلاحية التدخل الفني على الحالات الجسيمة وبموجب إذن صريح من مدير حسابكم.
            </p>

            <h2 className="text-foreground text-xl font-bold mt-8 mb-4">4. توافر الخدمة والنسخ الاحتياطي</h2>
            <p>
              نلتزم بضمان استمرارية الخدمة بنسبة 99.9% في الشهر (SLA). يتم أخذ نسخ احتياطية يومية من قاعدة البيانات لضمان عدم ضياع أي مستندات أو سجلات تقاضي بالغة الأهمية.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
