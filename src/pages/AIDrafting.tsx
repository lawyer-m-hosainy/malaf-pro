import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, MessageSquare, FileText, Lightbulb, Copy, CopyCheck, Scale, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type Tab = 'drafting' | 'summarize' | 'search';

const PROMPT_EXAMPLES = [
  {
    id: 1,
    title: "صياغة عقد تجاري مشدد",
    prompt: "أعمل كمستشار قانوني للشركات. أعد لي مسودة (عقد تطوير برمجيات) يحمي حقوق ملكيتي الفكرية بشكل مشدد كطرف أول مطور، ويضع شروطاً جزائية صارمة في حال تأخر الطرف الثاني عن السداد. قسم العقد لبنود واضحة بإسلوب قانوني رصين."
  },
  {
    id: 2,
    title: "استخراج دفوع طعن مدني",
    prompt: "استخرج لي الدفوع القانونية الجوهرية التي يمكن الاستناد عليها لإبطال عقد بيع تم تحت إكراه معنوي في القانون المدني، مقسماً إياها إلى دفوع شكلية وموضوعية مع ذكر الأسانيد والنصوص القانونية المؤيدة."
  },
  {
    id: 3,
    title: "صياغة دعوى عمالية",
    prompt: "إليك هذه الوقائع: (١- المدعي يعمل لدى الشركة كمدير فرع منذ ١٠ سنوات. ٢- تم فصله دون إنذار بعد مطالبته بأرباحه. ٣- لم يتسلم مكافأة نهاية الخدمة). بصفتك محامٍ عمالي خبير، صغ لي صحيفة دعوى عمالية مدعمة بأسانيد قوية بأسلوب قانوني رصين ومختصر، مطالباً بالتعويض."
  },
  {
    id: 4,
    title: "تحليل ثغرات عقد الإيجار",
    prompt: "قم بتحليل عقد الإيجار التالي واستخرج الثغرات القانونية التي قد تضر بموكلي (المستأجر)، واقترح تعديلات على البنود المجحفة لحمايته قانونياً بشكل يمنع الإخلاء السريع:\n[ضع نص العقد هنا]"
  },
  {
    id: 5,
    title: "صياغة إنذار رسمي بالفسخ",
    prompt: "بصفتك محامياً، اكتب لي صيغة إنذار رسمي على يد محضر موجه من (الطرف الأول: بائع) إلى (الطرف الثاني: مشتري) بفسخ عقد البيع المحرر بتاريخ [تاريخ] لعدم سداد باقي الثمن، مع التنبيه باتخاذ الإجراءات القانونية خلال أسبوع."
  },
  {
    id: 6,
    title: "تحليل عوار حكم جنائي نقض",
    prompt: "اقرأ حيثيات حكم الإدانة الجنائي التالي واستخرج لي أوجه القصور في التسبيب والفساد في الاستدلال التي يمكن أن أبني عليها مذكرة الطعن بالنقض:\n[ضع حيثيات الحكم هنا]"
  },
  {
    id: 7,
    title: "صياغة مذكرة دفاع بالرد",
    prompt: "أريد صياغة مذكرة بالرد في دعوى تعويض عن حوادث السيارات. موكلي هو (المدعى عليه/السائق). الدفع الأساسي هو: خطأ المضرور (المدعي) الذي عبر الطريق السريع من مكان غير مخصص للمشاة، مما يقطع رابطة السببية. صغ المذكرة بأسلوب قوي وقاطع."
  }
];

export default function AIDrafting() {
  const [activeTab, setActiveTab] = useState<Tab>('drafting');
  const [inputState, setInputState] = useState('');
  const [outputState, setOutputState] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (e: React.MouseEvent, id: number, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = () => {
    if (!inputState.trim()) return;
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      let result = '';
      if (activeTab === 'drafting') {
        result = `إنه في يوم المـوافـق    /   /   202 \n\nبناء على طلب السيد / ..................... المقيم في ........................ \nأنا ..................... محضر محكمة ............ قد انتقلت وأعلنت:\n\nالسيد / ......................... المقيم في .......................\n\nبالموضوع\n(هذه مسودة أولية تم إنشاؤها بناءً على المعطيات المدخلة، يرجى المراجعة والتدقيق القانوني وإضافة الأسانيد اللازمة)`;
      } else if (activeTab === 'summarize') {
        result = `ملخص المستند:\n1. التزامات الطرف الأول: تسليم العين بموعد أقصاه الأول من مارس.\n2. التزامات الطرف الثاني: سداد الدفعة المقدمة وقدرها 50% من إجمالي القيمة.\n3. الشروط الجزائية: يطبق غرامة تأخير قدرها ألف جنيه عن كل يوم.\n\nتنبيه: يتضمن البند الخامس شرط تحكيم قد يحرم موكلك من اللجوء للقضاء العادي.`;
      } else {
        result = `وفقاً لقانون المرافعات، ميعاد الاستئناف في الأحكام المدنية والتجارية هو (40) يوماً ما لم ينص القانون على غير ذلك، ويبدأ الميعاد من تاريخ إعلان الحكم. \n\nالسند القانوني: المادة 227 من قانون المرافعات.`;
      }
      setOutputState(result);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            المساعد القانوني (الذكاء الاصطناعي)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">صياغة مسودات، تلخيص مستندات، وبحث قانوني ذكي مدعوم بالذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-primary/20 shadow-sm overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('drafting')}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                  activeTab === 'drafting' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <FileText className="h-4 w-4" />
                صياغة العقود والصحف
              </button>
              <button
                onClick={() => setActiveTab('summarize')}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                  activeTab === 'summarize' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                تلخيص وتدقيق
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={cn(
                  "flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                  activeTab === 'search' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <Scale className="h-4 w-4" />
                بحث واستشارة
              </button>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {activeTab === 'drafting' && "المعطيات (نوع المستند، الأطراف، طلباتك الأساسية)"}
                    {activeTab === 'summarize' && "النص المراد تلخيصه أو مراجعته واستخراج الثغرات"}
                    {activeTab === 'search' && "اطرح سؤالك القانوني أو المسألة التي تبحث عن أسانيد لها"}
                  </label>
                  <textarea 
                    className="w-full text-base min-h-[150px] p-4 rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={
                      activeTab === 'drafting' ? "مثال: أريد صياغة صحيفة دعوى إخلاء لعدم سداد الأجرة وتوقيع الحجز التحفظي. المدعي: شركة الأمل، المدعى عليه: أحمد سيد. الإيجار الشهري 5000 ولم يسدد آخر 4 شهور..." :
                      activeTab === 'summarize' ? "انسخ النص هنا والمساعد سيقوم باستخراج الالتزامات والشروط الجزائية والثغرات..." :
                      "مثال: متى يسقط حق المضرور في رفع دعوى التعويض عن العمل غير المشروع؟ مع ذكر السند القانوني."
                    }
                    value={inputState}
                    onChange={(e) => setInputState(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    className="gap-2 shrink-0 min-w-[150px]" 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !inputState.trim()}
                  >
                    {isGenerating ? (
                      <>جاري المعالجة...</>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {activeTab === 'drafting' ? 'توليد الصياغة' : activeTab === 'summarize' ? 'تحليل النص' : 'ابحث الآن'}
                      </>
                    )}
                  </Button>
                </div>

                {outputState && (
                  <div className="mt-8 pt-6 border-t animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-primary">النتيجة:</h3>
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                        <Copy className="h-4 w-4" /> نسخ النص
                      </Button>
                    </div>
                    <div className="bg-muted/30 border rounded-lg p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {outputState}
                    </div>
                    
                    {activeTab === 'drafting' && (
                      <div className="mt-4 flex items-start gap-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 p-4 border border-amber-500/20 rounded-lg">
                        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">إخلاء مسؤولية مهنية</p>
                          <p className="text-xs mt-1 leading-relaxed">
                            هذه مسودة أولية تم إنشاؤها وتخيلها آلياً، يجب مراجعتها وتدقيقها وإعطاؤها الصبغة القانونية النهائية من قبل محامٍ مختص قبل الطباعة أو تقديمها للمحكمة. الذكاء الاصطناعي لا يغني عن الخبرة البشرية والأسانيد المحدثة.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Instructions / Prompt Engineering Guide */}
        <div className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-sm">
            <CardHeader className="pb-3 border-b border-emerald-500/10">
              <CardTitle className="text-emerald-700 flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5" />
                هندسة الأوامر القـانونيـة
              </CardTitle>
              <CardDescription className="text-emerald-700/80">
                كيف تحصل على أفضل صياغة من المساعد الذكي؟
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              
              <div className="space-y-3 shrink-0">
                <div className="flex gap-3">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">التعيين وتحديد الدور</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">لا تسأل عشوائياً. ابدأ دائماً بـ: <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">أطلب منك أن تعمل كمحامي نقض خبير للترافع في قضايا الجنايات...</span> أو <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">تصرف كمستشار قانوني للشركات...</span></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">السياق هو الملك (Context)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">الذكاء الاصطناعي ليس عرافاً! أعطه الحقائق واضحة مرتبة، وحدد القضاء المختص (مدني، تجاري، عمالي، إداري).</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">زوده بالقوالب (Few-Shot)</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">إذا كان لديك أسلوب تفضله، ضعه له وقل: <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">صغ لي الصحيفة مستخدماً نفس هذا الأسلوب: [ضع أسلوبك هنا]</span> ليحاكي طريقتك.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">التوجيه السلبي والموضوعية</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">أخبره بما لا تريد: <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">لا تستخدم لغة صحفية أو عامية، استخدم مصطلحات قانونية قاطعة، مبنية على الدليل.</span></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">5</div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">تقسيم المهام المعقدة</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">لا تطلب صحيفة كاملة من 20 صفحة مرة واحدة. اطلب أولاً: (الوقائع)، ثم (الأسانيد القانونية)، ثم (الطلبات الختامية).</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">6</div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">طلب البدائل وإعادة الصياغة</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">إذا لم تعجبك إجابته، قل له: <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">أعد صياغة هذا الدفع ليكون أكثر صرامة واختصاراً</span> أو <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">اقترح 3 دفوع بديلة لهذه الواقعة.</span></p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm">أمثلة رائعة للأوامر (Prompts)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {PROMPT_EXAMPLES.map((example) => (
                <div 
                  key={example.id}
                  className="bg-muted p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors group relative"
                  onClick={() => setInputState(example.prompt)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-primary">{example.title}</span>
                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 left-2 shrink-0 bg-background/50 hover:bg-background"
                      onClick={(e) => handleCopy(e, example.id, example.prompt)}
                      title="نسخ الأمر"
                    >
                      {copiedId === example.id ? (
                        <CopyCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                         <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs leading-relaxed font-mono text-muted-foreground">
                    "{example.prompt}"
                  </div>
                </div>
              ))}
              
              <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1 mt-4">
                <CheckCircle2 className="h-3 w-3" />
                اضغط على أي مثال للتجربة في الصندوق، أو انسخه
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
