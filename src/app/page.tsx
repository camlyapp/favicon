
'use client';

import React, { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateVariations } from '@/app/actions';
import {
  Upload,
  RefreshCw,
  Square,
  Circle,
  Type,
  Loader2,
  Sparkles,
  Download,
  Package,
} from 'lucide-react';
import JSZip from 'jszip';

const SIZES = [16, 32, 48, 64, 128, 192, 256, 512];

interface GeneratedSize {
  size: number;
  dataUrl: string;
}

export default function Home() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [generatedSizes, setGeneratedSizes] = useState<GeneratedSize[]>([]);
  const [canvasColor, setCanvasColor] = useState('#ffffff');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a valid image file.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFaviconSrc(result);
        setVariations([]);
        setGeneratedSizes([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = canvasColor;
      ctx.fillRect(0, 0, 512, 512);
    }
    const dataUrl = canvas.toDataURL();
    setFaviconSrc(dataUrl);
    setVariations([]);
    setGeneratedSizes([]);
  };

  const onGenerateVariations = () => {
    if (!faviconSrc) {
      toast({
        title: 'No Favicon',
        description: 'Please upload an image or create a new canvas first.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('faviconDataUri', faviconSrc);
      const result = await handleGenerateVariations(formData);

      if (result.error) {
        toast({
          title: 'Error Generating Variations',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result.variations) {
        setVariations(result.variations);
        toast({
          title: 'Success!',
          description: 'New favicon variations have been generated.',
        });
      }
    });
  };

  const resizeImage = (src: string, size: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = src;
    });
  };

  const handleGenerateAllSizes = async () => {
    if (!faviconSrc) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image or create a canvas first.',
        variant: 'destructive',
      });
      return;
    }

    const resizedImages = await Promise.all(
      SIZES.map(async (size) => {
        const dataUrl = await resizeImage(faviconSrc, size);
        return { size, dataUrl };
      })
    );
    setGeneratedSizes(resizedImages);
    toast({
      title: 'Sizes Generated',
      description: `Successfully generated ${SIZES.length} favicon sizes.`,
    });
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadZip = async () => {
    if (generatedSizes.length === 0) {
      toast({
        title: 'No sizes generated',
        description: 'Please generate the sizes before exporting.',
        variant: 'destructive',
      });
      return;
    }

    const zip = new JSZip();
    generatedSizes.forEach(({ size, dataUrl }) => {
      const base64Data = dataUrl.split(',')[1];
      zip.file(`favicon-${size}x${size}.png`, base64Data, { base64: true });
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'favicons.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-headline">Favicon Forge</h1>
        </div>
        <Button size="lg" onClick={handleDownloadZip} disabled={generatedSizes.length === 0}>
          <Package className="mr-2 h-4 w-4" />
          Export All (ZIP)
        </Button>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[350px_1fr_350px] gap-6 p-6">
        {/* Left Panel: Tools */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Tools</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="space-y-4">
              <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload Image
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <div className="flex items-center gap-2">
                 <Input type="color" value={canvasColor} onChange={(e) => setCanvasColor(e.target.value)} className="p-1 h-10 w-14 cursor-pointer" />
                <Button className="w-full" variant="secondary" onClick={handleNewCanvas}>
                  <RefreshCw className="mr-2 h-4 w-4" /> New Canvas
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Shapes & Text (Coming Soon)</Label>
              <div className="flex justify-around">
                <Button variant="ghost" size="icon" disabled><Square /></Button>
                <Button variant="ghost" size="icon" disabled><Circle /></Button>
                <Button variant="ghost" size="icon" disabled><Type /></Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-4 flex-1 flex flex-col">
              <Label>AI Variations</Label>
              <Button onClick={onGenerateVariations} disabled={isPending || !faviconSrc}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Variations
              </Button>
              {variations.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4 overflow-y-auto rounded-lg p-2 bg-secondary/50 max-h-48">
                  {variations.map((v, i) => (
                    <button key={i} onClick={() => { setFaviconSrc(v); setGeneratedSizes([]); }} className="rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary transition-all aspect-square">
                      <Image src={v} alt={`Variation ${i + 1}`} width={96} height={96} className="object-cover w-full h-full bg-white" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Center Panel: Canvas */}
        <div className="flex items-center justify-center bg-card rounded-lg p-8 border-dashed border-2 border-border">
          <div className="relative aspect-square w-full max-w-md bg-white p-4 shadow-inner rounded-lg" style={{
            backgroundImage: `
              linear-gradient(45deg, #ccc 25%, transparent 25%),
              linear-gradient(-45deg, #ccc 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #ccc 75%),
              linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}>
            {faviconSrc ? (
              <Image src={faviconSrc} alt="Favicon" layout="fill" objectFit="contain" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                <Upload className="w-16 h-16 mb-4 text-muted-foreground/50" />
                <p className="font-medium">Upload an image or start with a new canvas</p>
                <p className="text-sm text-muted-foreground/80 mt-1">to begin forging your favicon</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Preview & Export */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Preview &amp; Export</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            <Button onClick={handleGenerateAllSizes} disabled={!faviconSrc}>
              Generate All Sizes
            </Button>
            <Separator />
            {generatedSizes.length > 0 ? (
              <div className="space-y-4 overflow-y-auto">
                <Label>Generated Sizes</Label>
                <div className="grid grid-cols-2 gap-4">
                  {generatedSizes.map(({ size, dataUrl }) => (
                    <div key={size} className="flex flex-col items-center gap-2 p-2 rounded-lg bg-secondary">
                      <div className="w-24 h-24 bg-white rounded-md flex items-center justify-center p-1 shadow-inner">
                        <Image src={dataUrl} alt={`Favicon ${size}x${size}`} width={size} height={size} className="object-contain" />
                      </div>
                      <span className="text-sm font-medium">{size}x{size}</span>
                      <Button variant="ghost" size="sm" onClick={() => downloadImage(dataUrl, `favicon-${size}x${size}.png`)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                  <Package className="w-12 h-12 mb-4 text-muted-foreground/50" />
                  <p className="font-medium">Generate all sizes</p>
                  <p className="text-sm">Click the button above to create favicons for all standard dimensions.</p>
                </div>
            )}
          </CardContent>
           {generatedSizes.length > 0 && (
             <CardFooter>
                 <Button className="w-full" size="lg" onClick={handleDownloadZip}>
                  <Package className="mr-2 h-4 w-4" />
                  Export All (ZIP)
                </Button>
             </CardFooter>
           )}
        </Card>
      </main>
    </div>
  );
}
