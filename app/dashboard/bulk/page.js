'use client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Loader2 } from 'lucide-react'
export default function BulkPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold tracking-tight">Bulk Generator</h1><p className="text-muted-foreground mt-1">Batch generate hundreds of variations from a ZIP or CSV.</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-8 rounded-2xl glass text-center"><Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3"/><div className="font-medium">Upload ZIP</div><p className="text-xs text-muted-foreground mt-1">Drop a ZIP of reference images</p><Button className="mt-4 rounded-full" variant="secondary">Choose ZIP</Button></Card>
        <Card className="p-8 rounded-2xl glass text-center"><FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3"/><div className="font-medium">Upload CSV</div><p className="text-xs text-muted-foreground mt-1">One prompt per row for batch runs</p><Button className="mt-4 rounded-full" variant="secondary">Choose CSV</Button></Card>
      </div>
      <Card className="p-6 rounded-2xl glass"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4"/>Queue coming soon — architecture ready for batch workers, progress bars, and ZIP download.</div></Card>
    </div>
  )
}
