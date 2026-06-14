import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Download, Eye, FileText, BookText, Upload, X, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

interface LibraryItem {
  id: string;
  title: string;
  category: string;
  type: 'pdf' | 'doc';
  size: string;
  downloads: number;
}

const initialMockItems: LibraryItem[] = [
  { id: '1', title: 'كتابة المذكرات القانونية (أسس وقواعد)', category: 'مذكرات', type: 'pdf', size: '2.5 MB', downloads: 142 },
  { id: '2', title: 'القانون المدني المصري والمذكرات الإيضاحية', category: 'أكواد وموسوعات', type: 'pdf', size: '15.1 MB', downloads: 890 },
  { id: '3', title: 'مبادئ محكمة النقض (الدائرة الجنائية 2023)', category: 'أحكام ومبادئ', type: 'pdf', size: '8.4 MB', downloads: 453 },
  { id: '4', title: 'صيغ صحيفة استئناف حكم مدني', category: 'صيغ ونماذج', type: 'doc', size: '1.2 MB', downloads: 215 },
  { id: '5', title: 'الدفوع الجنائية في قضايا المخدرات والتزوير', category: 'دفوع قانونية', type: 'pdf', size: '4.8 MB', downloads: 367 },
  { id: '6', title: 'قانون الإجراءات الجنائية معلقاً عليه بالفقه', category: 'أكواد وموسوعات', type: 'pdf', size: '12.0 MB', downloads: 610 },
  { id: '7', title: 'قانون مجلس الدولة', category: 'أكواد وموسوعات', type: 'pdf', size: '3.6 MB', downloads: 120 },
  { id: '8', title: 'موسوعة الشركات التجارية', category: 'موسوعات متخصصة', type: 'pdf', size: '22.0 MB', downloads: 189 },
];

export default function Library() {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(initialMockItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const user = useAuthStore(state => state.user);
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState<'pdf' | 'doc'>('pdf');
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.title.includes(searchQuery) || item.category.includes(searchQuery);
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const categories = ['all', ...Array.from(new Set(libraryItems.map(item => item.category)))];

  const handleDownload = (title: string) => {
    toast.success(`جاري تحميل "${title}"...`);
  };

  const handlePreview = (item: LibraryItem) => {
    setPreviewItem(item);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCategory.trim() || !fileSelected) {
      toast.error('يرجى ملء جميع الحقول واختيار ملف');
      return;
    }

    const newItem: LibraryItem = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      type: newType,
      size: `${(fileSelected.size / (1024 * 1024)).toFixed(1)} MB`,
      downloads: 0
    };

    setLibraryItems([newItem, ...libraryItems]);
    toast.success('تم رفع المرجع بنجاح');
    
    setNewTitle('');
    setNewCategory('');
    setNewType('pdf');
    setFileSelected(null);
    setIsUploadModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">المكتبة القانونية</h2>
          <p className="text-muted-foreground text-sm">
            نظام إدارة المراجع والموسوعات القانونية وصيغ الدعاوى المدمج.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث عن المراجع أو الكتب أو القوانين..." 
              className="pl-4 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isAdminOrOwner && (
            <Button onClick={() => setIsUploadModalOpen(true)} className="w-full md:w-auto">
              <Upload className="ml-2 h-4 w-4" />
              رفع مرجع
            </Button>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="flex gap-2 justify-start overflow-x-auto overflow-y-hidden flex-nowrap pb-1 h-auto mb-4 border-b">
          <button 
            className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
            onClick={() => setActiveTab('all')}
          >
            جميع المراجع
          </button>
          {categories.filter(c => c !== 'all').map(category => (
            <button 
              key={category} 
              className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === category ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              onClick={() => setActiveTab(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {filteredItems.length === 0 ? (
             <div className="col-span-full py-12 text-center border rounded-lg bg-card text-muted-foreground">
               <BookText className="mx-auto h-12 w-12 opacity-20 mb-3" />
               <p>لا توجد مراجع تتطابق مع بحثك</p>
               <Button variant="link" onClick={() => {setSearchQuery(''); setActiveTab('all')}}>عرض كافة المراجع</Button>
             </div>
          ) : (
            filteredItems.map(item => (
              <Card key={item.id} className="group hover:-translate-y-1 transition-all duration-200">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {item.type === 'pdf' ? <BookOpen className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                    </div>
                    <span className="font-normal text-xs border px-2.5 py-0.5 rounded-full bg-background">{item.category}</span>
                  </div>
                  <CardTitle className="text-base mt-4 line-clamp-2 leading-tight">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 text-xs">
                    <span>{item.type.toUpperCase()}</span>
                    <span>•</span>
                    <span>{item.size}</span>
                    <span>•</span>
                    <span>{item.downloads} تحميل</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="default" className="w-full text-xs h-8" onClick={() => handleDownload(item.title)}>
                      <Download className="h-3.5 w-3.5 ml-1" />
                      تحميل
                    </Button>
                    <Button variant="secondary" className="w-full text-xs h-8" onClick={() => handlePreview(item)}>
                      <Eye className="h-3.5 w-3.5 ml-1" />
                      تصفح
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
        
      {/* Document Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 md:p-12">
          <div className="bg-background rounded-xl w-full max-w-5xl h-full max-h-[90vh] shadow-2xl border relative flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {previewItem.type === 'pdf' ? <BookOpen className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                <span className="line-clamp-1">{previewItem.title}</span>
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(previewItem.title)} className="hidden sm:flex">
                  <Download className="h-4 w-4 ml-2" /> تحميل
                </Button>
                <button 
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground mr-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-muted/30 p-4 sm:p-8 overflow-y-auto flex justify-center">
              {/* Simulated Document Pages */}
              <div className="bg-white text-black w-full max-w-3xl min-h-[1000px] shadow-sm border p-8 sm:p-12 mb-8">
                {previewItem.type === 'pdf' ? (
                  <div className="space-y-6">
                    <div className="text-center border-b pb-8 mb-8">
                      <h1 className="text-3xl font-bold mb-4">{previewItem.title}</h1>
                      <p className="text-muted-foreground">التصنيف: {previewItem.category}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      <div className="h-8"></div>
                      <h2 className="text-xl font-bold">الفصل الأول</h2>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-center underline mb-8">{previewItem.title}</h1>
                    <div className="space-y-6 text-right">
                      <p>إنه في يوم المـوافـق    /   /   202</p>
                      <p>بناء على طلب السيد / ..................... المقيم في ........................</p>
                      <p>أنا ..................... محضر محكمة ............ قد انتقلت وأعلنت:</p>
                      <p>السيد / ......................... المقيم في .......................</p>
                      <h3 className="font-bold text-center mt-8 mb-4">الموضوع</h3>
                      <p className="text-center italic opacity-70">(هذا النموذج للعرض فقط ويمكن تحميله لتعديله في برنامج مايكروسوفت وورد)</p>
                      <div className="mt-8 space-y-4 opacity-50">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md shadow-lg border relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 left-4 p-1 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              رفع مرجع جديد
            </h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان المرجع</label>
                <Input 
                  placeholder="أدخل عنوان الكتاب أو المرجع" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">التصنيف</label>
                <Input 
                  placeholder="مثال: مذكرات، أحكام ومبادئ، دفوع..." 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">نوع الملف</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'pdf' | 'doc')}
                >
                  <option value="pdf">PDF (كتاب/مرجع)</option>
                  <option value="doc">Word (نموذج/صيغة)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ملف المرجع</label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${fileSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept={newType === 'pdf' ? '.pdf' : '.doc,.docx'}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileSelected(e.target.files[0]);
                      }
                    }}
                  />
                  {fileSelected ? (
                    <>
                      <FileUp className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm font-medium">{fileSelected.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(fileSelected.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm">اضغط لاختيار ملف</p>
                      <p className="text-xs text-muted-foreground mt-1">الحد الأقصى للملف 50MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsUploadModalOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="flex-1">
                  حفظ ورفع
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
