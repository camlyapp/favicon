
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Save,
    Square,
    Circle,
    Type,
    RefreshCw,
    Loader2,
    Palette
} from 'lucide-react';

export default function EditorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasColor, setCanvasColor] = useState('#ffffff');


  useEffect(() => {
    const imageToEdit = sessionStorage.getItem('faviconToEdit');
    if (imageToEdit) {
      setFaviconSrc(imageToEdit);
    } else {
      // If no image is found, redirect back to the home page
      toast({
        title: "No Image Found",
        description: "Please select an image to edit first.",
        variant: "destructive"
      });
      router.replace('/');
    }
    setIsLoading(false);
  }, [router, toast]);
  
  // Draw initial image to canvas
  useEffect(() => {
    if (faviconSrc && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
        };
        img.src = faviconSrc;
    }
  }, [faviconSrc]);

  const handleSave = () => {
    if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        sessionStorage.setItem('croppedImage', dataUrl);
        router.push('/');
    }
  };

  const handleNewCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 1024;
      canvas.height = 1024;
      ctx.fillStyle = canvasColor;
      ctx.fillRect(0, 0, 1024, 1024);
      const dataUrl = canvas.toDataURL();
      setFaviconSrc(dataUrl); // also update the src to re-trigger image drawing
    }
  };


  const handleDrawShape = (shape: 'square' | 'circle' | 'text') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We don't need to redraw the image, just draw shape on top
    ctx.fillStyle = '#6D28D9'; // A nice primary color
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 40;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (shape === 'square') {
      const size = canvas.width * 0.5;
      ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
      ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
    } else if (shape === 'circle') {
      const radius = canvas.width * 0.25;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
    } else if (shape === 'text') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 200px Inter, sans-serif';
      ctx.fillText('Aa', centerX, centerY);
      ctx.strokeText('Aa', centerX, centerY);
    }
    
    // update faviconSrc to reflect the change visually if needed, though canvas is the source of truth
    const dataUrl = canvas.toDataURL();
    setFaviconSrc(dataUrl); // This will cause a re-render showing the drawn shape
  };

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-20">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Editor</h1>
        <Button size="sm" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_350px] gap-0">
        <div className="flex items-center justify-center bg-muted/20 p-4">
            <div className="relative aspect-square w-full max-w-[600px] bg-white shadow-2xl rounded-2xl"
                 style={{
                    backgroundImage: `
                      linear-gradient(45deg, #eee 25%, transparent 25%),
                      linear-gradient(-45deg, #eee 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #eee 75%),
                      linear-gradient(-45deg, transparent 75%, #eee 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
            >
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-contain" />
            </div>
        </div>

        <aside className="border-l border-border flex flex-col p-4 space-y-6">
            <div>
                <Label>Canvas</Label>
                <div className="flex items-center gap-2 mt-2">
                    <Input id="canvas-color" type="color" value={canvasColor} onChange={(e) => setCanvasColor(e.target.value)} className="p-1 h-10 w-14 cursor-pointer" />
                    <Button className="w-full" variant="secondary" onClick={handleNewCanvas}>
                        <RefreshCw className="mr-2 h-4 w-4" /> New Blank Canvas
                    </Button>
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="text-lg font-medium">Shapes & Text</h3>
                 <p className="text-sm text-muted-foreground pb-4">
                   Click a button to add a basic shape or text to the canvas.
                  </p>
                <div className="flex justify-start gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDrawShape('square')}><Square /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDrawShape('circle')}><Circle /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDrawShape('text')}><Type /></Button>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-medium">Colors & Gradients</h3>
                 <p className="text-sm text-muted-foreground pb-4">
                   Feature coming soon.
                  </p>
                <div className="flex justify-start gap-2">
                    <Button variant="outline" size="icon" disabled><Palette /></Button>
                </div>
            </div>
        </aside>
      </main>
    </div>
  );
}
