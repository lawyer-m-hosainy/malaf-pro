import { cn } from '@/lib/utils';

export function PrintLayout({ caseData, litigationDegrees, sessions, tasks, documents, financials, printSections }: any) {
  return (
    <div className="hidden print:block w-full text-black bg-white select-text" dir="rtl">
        {printSections.cover && (
          <div className="mb-8 border-b-2 border-black pb-6 text-black break-after-auto">
            <div className="flex items-center justify-center mb-6 border-b border-gray-400 pb-4">
               <h1 className="text-3xl font-bold text-black border-2 border-black px-6 py-2 rounded-full uppercase tracking-widest whitespace-nowrap">غلاف تقرير ملف قضية</h1>
            </div>
            <div className="flex justify-between items-start mb-8 gap-6">
              <div className="flex-1 space-y-4">
                <div>
                   <p className="text-sm text-gray-600 font-bold mb-1">موضوع القضية</p>
                   <h2 className="text-2xl font-black text-black">{caseData.title}</h2>
                </div>
                <div>
                   <p className="text-lg font-bold text-black bg-gray-100 border border-black inline-block px-3 py-1 rounded shadow-sm">
                      رقم الأرشيف الداخلي למكتب: <span className="font-mono text-xl font-black tracking-wider text-indigo-900 mx-2">{caseData.internalId}</span>
                   </p>
                </div>
              </div>
              <div className="text-start border-2 border-black p-4 font-semibold text-lg text-black bg-gray-50 min-w-[280px] rounded-lg shadow-sm">
                <p className="border-b border-gray-300 pb-2 mb-2"><span className="text-gray-600 text-sm block">الجهة / التصنيف:</span> {caseData.jurisdiction}</p>
                <p className="border-b border-gray-300 pb-2 mb-2"><span className="text-gray-600 text-sm block">درجة التقاضي الحالية:</span> {caseData.degree}</p>
                <p className="border-b border-gray-300 pb-2 mb-2 font-mono text-xl font-bold" dir="rtl">رقم القضية: {caseData.currentCaseNumber} / {caseData.currentYear}</p>
                <p><span className="text-gray-600 text-sm block">المحكمة / الاستئنافية:</span> {caseData.court}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-lg border-2 border-black border-dashed p-5 font-semibold rounded text-black bg-white relative">
              <div className="absolute -top-3 right-6 bg-white px-2 text-sm font-bold text-gray-500">أطراف الخصومة</div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded">
                 <p className="text-sm text-emerald-800 font-bold mb-1">صفتنا (المكتب) في الدعوى</p>
                 <p className="text-xl text-black font-black">{caseData.clientRole}</p>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded">
                 <p className="text-sm text-rose-800 font-bold mb-1">الخصم / الخصوم</p>
                 <p className="text-xl text-black font-black">{caseData.opponent}</p>
              </div>
            </div>
          </div>
        )}

        {printSections.degrees && (
          <div className="mb-8 page-break-inside-avoid">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
              <span className="h-6 w-1 bg-black rounded-full block"></span> تسلسل ومسار درجات التقاضي
            </h3>
            <div className="space-y-3">
              {litigationDegrees.map((deg: any) => (
                <div key={deg.id} className={cn("border p-3 flex justify-between bg-white text-black relative items-center", deg.active ? "border-2 border-black" : "border-gray-400 border-dashed")}>
                   {deg.active && <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-full bg-black rounded-l"></div>}
                   <div className="w-1/3">
                     <p className="font-bold text-lg">{deg.type}</p>
                     <p className="text-gray-700 font-mono font-semibold">رقم: {deg.caseNumber} / {deg.year}</p>
                   </div>
                   <div className="text-right w-1/3 border-r border-gray-300 pr-4">
                     <p className="font-semibold text-gray-800">الجهة:</p>
                     <p className="font-bold text-md">{deg.court}</p>
                   </div>
                   <div className="text-right w-1/3 border-r border-gray-300 pr-4">
                     <p className="font-semibold text-gray-800">القرار / الحكم:</p>
                     <p className="font-bold text-md text-black">{deg.result}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {printSections.timeline && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
              <span className="h-6 w-1 bg-black rounded-full block"></span> الخط الزمني (سجل أحداث وسير الدعوى)
            </h3>
            <ul className="list-none space-y-4 font-medium text-black pr-2">
              {sessions.map((s: any) => (
                <li key={s.id} className="border-r-4 border-gray-400 pr-4 py-1">
                   <div className="flex gap-2 items-baseline mb-1">
                     <span className="font-bold font-mono text-sm bg-gray-200 border border-gray-400 px-2 py-0.5 rounded shadow-sm">{s.date}</span>
                     <span className="font-black text-lg underline decoration-gray-400 underline-offset-4">{s.type}</span>
                   </div>
                   <p className="text-base text-gray-900 border-b border-gray-200 pb-2 inline-block">القرار: <strong className="font-black text-black">{s.decision}</strong></p>
                   <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 p-2 rounded mt-2">
                     <span className="font-bold text-black border-l-2 border-gray-400 pl-2 ml-2">الإجراء المطلوب تنفيذه:</span> 
                     {s.requirements}
                   </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {printSections.sessions && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
              <span className="h-6 w-1 bg-black rounded-full block"></span> كشف رول الجلسات المنعقدة والقادمة
            </h3>
            <table className="w-full border-collapse border-2 border-black text-right text-black text-sm">
              <thead>
                 <tr className="bg-gray-200 border-b-2 border-black">
                   <th className="border border-black p-3 font-bold w-32 text-center">التاريخ</th>
                   <th className="border border-black p-3 font-bold w-1/4">النوع / الوصف</th>
                   <th className="border border-black p-3 font-bold">القرار وما تم في الجلسة</th>
                 </tr>
              </thead>
              <tbody>
                 {sessions.map((s: any) => (
                   <tr key={s.id} className="border-b border-black">
                      <td className="border border-black p-3 font-mono font-bold text-center bg-gray-50">{s.date}</td>
                      <td className="border border-black p-3 font-black text-base">{s.type}</td>
                      <td className="border border-black p-3 text-base font-semibold">{s.decision}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}

        {printSections.tasks && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
              <span className="h-6 w-1 bg-black rounded-full block"></span> سجل التكليفات والمهام الإدارية
            </h3>
            <table className="w-full border-collapse border border-black text-right text-black text-sm">
              <thead>
                 <tr className="bg-gray-100 border-b border-black">
                   <th className="border border-black p-2 font-bold w-32 border-b-2">تاريخ التكليف</th>
                   <th className="border border-black p-2 font-bold border-b-2">تفاصيل وعنوان المهمة</th>
                   <th className="border border-black p-2 font-bold border-b-2">جهة الاختصاص / المكلف</th>
                 </tr>
              </thead>
              <tbody>
                 {tasks.map((t: any) => (
                   <tr key={t.id} className="border-b border-gray-400">
                     <td className="border border-black p-2 font-mono font-semibold text-center">{t.date}</td>
                     <td className="border border-black p-2 font-bold text-base">{t.title}</td>
                     <td className="border border-black p-2 text-sm font-semibold text-gray-700">{t.assignee} ({t.type})</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}

        {printSections.docs && (
          <div className="mb-8">
             <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
               <span className="h-6 w-1 bg-black rounded-full block"></span> المرفقات وفهرس حافظة المستندات
             </h3>
             <table className="w-full border-collapse border border-black text-right text-black">
               <thead>
                 <tr className="bg-gray-100">
                   <th className="border border-black p-2 font-bold w-12 text-center">م</th>
                   <th className="border border-black p-2 font-bold w-1/4">نوع المستند</th>
                   <th className="border border-black p-2 font-bold">وصف / عنوان المستند</th>
                   <th className="border border-black p-2 font-bold w-32 text-center">تاريخ الإيداع</th>
                 </tr>
               </thead>
               <tbody>
                 {documents.map((d: any, index: number) => (
                   <tr key={d.id}>
                     <td className="border border-black p-2 text-center font-bold">{index + 1}</td>
                     <td className="border border-black p-2 font-bold text-gray-700">{d.type}</td>
                     <td className="border border-black p-2 font-semibold text-base">{d.title}</td>
                     <td className="border border-black p-2 font-mono text-sm text-center">{d.date}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {printSections.finance && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 bg-gray-100 p-2 text-black flex items-center gap-2">
               <span className="h-6 w-1 bg-black rounded-full block"></span> كشف الحساب والبيان المالي الخاص بالملف
            </h3>
            <table className="w-full border-collapse border-2 border-black text-right text-black text-sm mb-4">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-black">
                  <th className="border border-black p-3 font-bold w-32 text-center">تاريخ القيد</th>
                  <th className="border border-black p-3 font-bold text-center">المبلغ المستحق / المدفوع</th>
                  <th className="border border-black p-3 font-bold w-1/2">بيان الحركة / البند</th>
                  <th className="border border-black p-3 font-bold w-40">دائن / مدين (التصنيف)</th>
                </tr>
              </thead>
              <tbody>
                {financials.map((f: any) => (
                  <tr key={f.id} className="border-b border-gray-400">
                    <td className="border border-black p-3 font-mono font-semibold text-center">{f.date}</td>
                    <td className="border border-black p-3 font-mono font-black text-lg text-center bg-gray-50">{f.amount.toLocaleString()} <span className="text-xs font-bold text-gray-600">ج.م</span></td>
                    <td className="border border-black p-3 font-bold text-base">{f.title}</td>
                    <td className="border border-black p-3 text-sm font-bold text-gray-700">
                       {f.type === 'income_fee' ? 'وارد - أتعاب' : f.type === 'income_expense' ? 'وارد - أمانة مصروفات' : 'منصرف - مصروفات ورسوم'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-4 print:page-break-inside-avoid">
               <div className="flex-[2] border-2 border-black p-3 text-center bg-gray-50">
                  <p className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 text-gray-700">إجمالي الأتعاب المحصلة</p>
                  <p className="font-mono text-2xl font-black">{financials.filter((f: any) => f.type === 'income_fee' && f.status === 'paid').reduce((sum: number, f: any) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
               <div className="flex-1 border-2 border-black p-3 text-center">
                  <p className="text-sm font-bold border-b border-gray-400 pb-1 mb-2">أمانات محصلة</p>
                  <p className="font-mono text-xl font-black">{financials.filter((f: any) => f.type === 'income_expense' && f.status === 'paid').reduce((sum: number, f: any) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
               <div className="flex-1 border-2 border-black p-3 text-center">
                  <p className="text-sm font-bold border-b border-gray-400 pb-1 mb-2">المنصرف الفعلي</p>
                  <p className="font-mono text-xl font-black">{financials.filter((f: any) => f.type === 'expense' && f.status === 'paid').reduce((sum: number, f: any) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
               <div className="flex-1 border-2 border-black p-3 text-center bg-gray-200">
                  <p className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 text-gray-700">المتأخرات</p>
                  <p className="font-mono text-xl font-black">{financials.filter((f: any) => f.status === 'pending').reduce((sum: number, f: any) => sum + f.amount, 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
               </div>
            </div>
          </div>
        )}

        {/* Footer/Sign-off for printed reports */}
        <div className="mt-16 pt-8 border-t-2 border-black text-center text-sm font-bold text-gray-500 page-break-inside-avoid">
           <p>نهاية المستخرج والمطبوع من منصة إدارة مكتب المحاماة.</p>
           <p className="mt-1 font-mono text-xs" dir="ltr">Printed on: {new Date().toLocaleDateString('ar-EG')} / Reference: {caseData.internalId}</p>
        </div>
      </div>
  );
}
