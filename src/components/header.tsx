
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Upload,
    Loader2,
    Sparkles,
    Eye,
    Pencil,
    ArrowLeft,
    Save
} from 'lucide-react';
import Link from 'next/link';

interface AppHeaderProps {
    isEditorPage?: boolean;
    onSave?: () => void;
    onUploadClick?: () => void;
    onGoToEditor?: () => void;
    onGenerateAllSizes?: () => void;
    onGenerateVariations?: () => void;
    isPending?: boolean;
    faviconSrc?: string | null;
    ExportDialog?: React.FC<any>;
    [key: string]: any; 
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
    ExportDialog,
    ...exportDialogProps
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
                        {ExportDialog && <ExportDialog {...exportDialogProps} />}
                    </>
                )}
            </div>
        </header>
    );
}
