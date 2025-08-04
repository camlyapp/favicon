'use client';

import React, { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';

const SIZES = [16, 32, 48, 64, 128];

export default function Home() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<number>(32);
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
        setFaviconSrc(e.target?.result as string);
        setVariations([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = canvasColor;
      ctx.fillRect(0, 0, 256, 256);
    }
    setFaviconSrc(canvas.toDataURL());
    setVariations([]);
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-headline">Favicon Forge</h1>
        </div>
        <Button size="lg" disabled={!faviconSrc}>
          <Download className="mr-2 h-4 w-4" />
          Export
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
              <Label>Shapes & Text</Label>
              <div className="flex justify-around">
                <Button variant="ghost" size="icon"><Square /></Button>
                <Button variant="ghost" size="icon"><Circle /></Button>
                <Button variant="ghost" size="icon"><Type /></Button>
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
                <div className="grid grid-cols-3 gap-2 mt-4 overflow-y-auto rounded-lg p-2 bg-secondary/50">
                  {variations.map((v, i) => (
                    <button key={i} onClick={() => setFaviconSrc(v)} className="rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary transition-all aspect-square">
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
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Preview & Export */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Preview & Export</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1">
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'secondary'}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}x{size}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-4 flex-1">
              <Label>Live Preview</Label>
              <div className="space-y-4">
                <div className="p-2 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 bg-background/50 p-2 rounded-t-md text-sm shadow-sm">
                    {faviconSrc && <Image src={faviconSrc} alt="preview" width={16} height={16} className="bg-white rounded-sm" />}
                    {!faviconSrc && <div className="w-4 h-4 bg-muted rounded-sm"></div>}
                    <span className="font-medium">Your Site</span>
                    <span className="ml-auto text-muted-foreground cursor-pointer">×</span>
                  </div>
                  <div className="h-12 bg-background/20 rounded-b-md flex items-center px-4">
                    <div className="w-full h-6 bg-background/50 rounded-full text-xs text-muted-foreground flex items-center px-3">your-website.com</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary text-sm">
                  <div className="flex items-center gap-2">
                    {faviconSrc && <Image src={faviconSrc} alt="preview" width={24} height={24} className="rounded-full bg-white"/>}
                    {!faviconSrc && <div className="w-6 h-6 bg-muted rounded-full"></div>}
                    <div>
                      <p className="font-medium">Favicon Forge</p>
                      <p className="text-xs text-muted-foreground">your-website.com</p>
                    </div>
                  </div>
                  <p className="mt-2 text-accent text-lg font-semibold">Your Awesome Website Title</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A brief description of your amazing website goes here, showing how the favicon looks in search results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
