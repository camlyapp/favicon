
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Upload,
    Loader2,
    Sparkles,
    Eye,
    Pencil,
    ArrowLeft,
    Save,
    Package,
    Download,
    Copy
} from 'lucide-react';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from './theme-toggle';

interface GeneratedSize {
  size: number;
  dataUrl: string;
}
interface ExportDialogProps {
  faviconSrc: string | null;
  generatedSizes: GeneratedSize[];
  handleDownloadZip: () => void;
  getHtmlCode: () => string;
  copyToClipboard: (text: string) => void;
  getWebmanifestContent: () => string;
  handleDownloadIco: () => void;
  children: React.ReactNode;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  faviconSrc,
  handleDownloadZip,
  getHtmlCode,
  copyToClipboard,
  getWebmanifestContent,
  handleDownloadIco,
  children
}) => {
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    return (
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] w-[90vw] rounded-lg">
                <DialogHeader>
                    <DialogTitle>Export Options</DialogTitle>
                    <DialogDescription>
                        Download your favicons and get the code to add them to your site.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="zip" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="zip">Download .ZIP</TabsTrigger>
                        <TabsTrigger value="html">HTML Code</TabsTrigger>
                        <TabsTrigger value="manifest">Web Manifest</TabsTrigger>
                    </TabsList>
                    <TabsContent value="zip" className="py-4">
                        <div className="flex flex-col items-center justify-center space-y-4 p-4 sm:p-8 bg-secondary/50 rounded-lg">
                            <p className="text-center text-sm sm:text-base text-muted-foreground">Download all generated PNG icons, a `favicon.ico` file, `site.webmanifest`, and an example `index.html` in a single .zip file.</p>
                            <Button size="lg" onClick={handleDownloadZip}>
                                <Package className="mr-2 h-4 w-4" />
                                Download .ZIP
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="html" className="py-4">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Copy and paste this code into the `&lt;head&gt;` of your HTML document.</p>
                            <div className="relative">
                                <Textarea readOnly value={getHtmlCode()} className="h-40 font-mono text-xs bg-muted/50" />
                                <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => copyToClipboard(getHtmlCode())}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="manifest" className="py-4">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">This is the content for your `site.webmanifest` file.</p>
                            <div className="relative">
                                <Textarea readOnly value={getWebmanifestContent()} className="h-64 font-mono text-xs bg-muted/50" />
                                <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => copyToClipboard(getWebmanifestContent())}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button variant="secondary" onClick={handleDownloadIco} disabled={!faviconSrc} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" /> Download favicon.ico
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="w-full sm:w-auto">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};


interface AppHeaderProps {
    isEditorPage?: boolean;
    onSave?: () => void;
    onUploadClick?: () => void;
    onGoToEditor?: () => void;
    onGenerateAllSizes?: () => void;
    onGenerateVariations?: () => void;
    isPending?: boolean;
    faviconSrc?: string | null;
    handleDownloadZip?: () => void;
    getHtmlCode?: () => string;
    copyToClipboard?: (text: string) => void;
    getWebmanifestContent?: () => string;
    handleDownloadIco?: () => void;
    generatedSizes?: GeneratedSize[];
}

export function AppHeader({
    isEditorPage = false,
    onSave,
    onUploadClick,
    onGoToEditor,
    onGenerateAllSizes,
    onGenerateVariations,
    isPending,
    faviconSrc,
    handleDownloadZip,
    getHtmlCode,
    copyToClipboard,
    getWebmanifestContent,
    handleDownloadIco,
    generatedSizes = []
}: AppHeaderProps) {
    const router = useRouter();

    return (
        <header className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-20">
            <div className="flex items-center gap-1 sm:gap-3">
                {isEditorPage ? (
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                ) : (
                    <Link href="/" className="flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6">
                            <rect width="256" height="256" fill="none"></rect>
                            <path d="M148,224,82.4,140a32.1,32.1,0,0,1,0-44.8L148,16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></path>
                            <line x1="104" y1="128" x2="240" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                        </svg>
                        <h1 className="text-xl font-bold hidden sm:inline-block">Favicon</h1>
                    </Link>
                )}
                 {isEditorPage && <h1 className="text-xl font-bold">Editor</h1>}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
                {isEditorPage ? (
                    <Button size="sm" onClick={onSave}>
                        <Save className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Save</span>
                    </Button>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" onClick={onUploadClick}>
                            <Upload className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Upload</span>
                        </Button>
                        <Button onClick={onGoToEditor} disabled={!faviconSrc} variant="outline" size="sm">
                            <Pencil className="mr-0 sm:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button onClick={onGenerateAllSizes} disabled={!faviconSrc} variant="outline" size="sm">
                            <Eye className="mr-0 sm:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Preview</span>
                        </Button>
                        <Button onClick={onGenerateVariations} disabled={isPending || !faviconSrc} variant="outline" size="sm">
                            {isPending ? <Loader2 className="mr-0 sm:mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-0 sm:mr-2 h-4 w-4" />}
                            <span className="hidden sm:inline">Generate</span>
                        </Button>
                        {handleDownloadZip && getHtmlCode && copyToClipboard && getWebmanifestContent && handleDownloadIco && (
                             <ExportDialog
                                faviconSrc={faviconSrc}
                                generatedSizes={generatedSizes}
                                handleDownloadZip={handleDownloadZip}
                                getHtmlCode={getHtmlCode}
                                copyToClipboard={copyToClipboard}
                                getWebmanifestContent={getWebmanifestContent}
                                handleDownloadIco={handleDownloadIco}
                            >
                                <Button size="sm" disabled={!faviconSrc}>
                                    <Package className="mr-0 sm:mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Export All</span>
                                </Button>
                            </ExportDialog>
                        )}
                    </>
                )}
                <ThemeToggle />
            </div>
        </header>
    );
}
