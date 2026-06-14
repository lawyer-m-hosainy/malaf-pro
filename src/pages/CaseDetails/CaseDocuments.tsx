import { FileArchive, Plus, FileText, ArrowDownToLine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CaseDocuments({ documents }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileArchive className="h-5 w-5 text-primary" /> أرشيف المستندات والمذكرات المرتبطة
        </h3>
        <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> رفع مستند</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((doc: any) => (
          <Card key={doc.id} className="group hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div>
                <h4 className="font-semibold text-sm line-clamp-2" title={doc.title}>{doc.title}</h4>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span className="bg-muted px-1.5 py-0.5 rounded">{doc.type}</span>
                  <span className="font-mono">{doc.size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
