
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
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
  Paintbrush,
  Palette,
  Eye,
  Settings,
  ChevronUp,
  X,
} from 'lucide-react';
import JSZip from 'jszip';
import { ScrollArea } from '@/components/ui/scroll-area';

const SIZES = [16, 32, 48, 64, 72, 96, 114, 120, 128, 144, 152, 167, 180, 192, 196, 256, 384, 512, 1024];


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
  const [showSizes, setShowSizes] = useState(false);
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
        setShowSizes(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = canvasColor;
      ctx.fillRect(0, 0, 1024, 1024);
    }
    const dataUrl = canvas.toDataURL();
    setFaviconSrc(dataUrl);
    setVariations([]);
    setGeneratedSizes([]);
    setShowSizes(false);
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
        setShowSizes(false);
        toast({
          title: 'Success!',
          description: 'New favicon variations have been generated.',
        });
      }
    });
  };

  const resizeImage = (src: string, size: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Ensure high-quality downscaling.
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, size, size);
                resolve(canvas.toDataURL('image/png'));
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = () => {
            reject(new Error('Failed to load image for resizing.'));
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

    try {
        // For best quality, we'll use a high-resolution version of the source image for resizing.
        // If the source is smaller than 1024, we'll use its natural size.
        const highResSrc = await resizeImage(faviconSrc, 1024);

        const resizedImages = await Promise.all(
          SIZES.map(async (size) => {
            const dataUrl = await resizeImage(highResSrc, size);
            return { size, dataUrl };
          })
        );
        setGeneratedSizes(resizedImages);
        setShowSizes(true);
        toast({
          title: 'Sizes Generated',
          description: `Successfully generated ${SIZES.length} high-quality favicon sizes.`,
        });
    } catch (error) {
        console.error("Error generating sizes:", error);
        toast({
            title: 'Error Generating Sizes',
            description: 'Could not generate all icon sizes. Please try again.',
            variant: 'destructive',
        });
    }
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

    const ToolPanel = () => (
        <>
            <div className="p-4 space-y-4">
                 <Button className="w-full" size="lg" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <div className="flex items-center gap-2">
                    <Label htmlFor="canvas-color" className="sr-only">Canvas Color</Label>
                    <Input id="canvas-color" type="color" value={canvasColor} onChange={(e) => setCanvasColor(e.target.value)} className="p-1 h-10 w-14 cursor-pointer" />
                    <Button className="w-full" variant="secondary" onClick={handleNewCanvas}>
                        <RefreshCw className="mr-2 h-4 w-4" /> New Blank Canvas
                    </Button>
                </div>
            </div>
            <Separator/>
            <Tabs defaultValue="ai" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mx-auto my-4 max-w-[calc(100%-2rem)]">
                    <TabsTrigger value="ai"><Sparkles className="mr-2 h-4 w-4"/> AI Tools</TabsTrigger>
                    <TabsTrigger value="editor"><Paintbrush className="mr-2 h-4 w-4"/> Editor</TabsTrigger>
                </TabsList>
                 <ScrollArea className="flex-1">
                    <TabsContent value="ai" className="p-4 m-0">
                         <div className="space-y-4">
                          <h3 className="text-lg font-medium">AI Variations</h3>
                          <p className="text-sm text-muted-foreground">
                            Generate unique variations of your icon using AI. Click a variation to start editing it.
                          </p>
                          <Button onClick={onGenerateVariations} disabled={isPending || !faviconSrc} className="w-full">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Variations
                          </Button>
                          {variations.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-4 rounded-lg p-2 bg-secondary/50 max-h-64">
                              {variations.map((v, i) => (
                                <button key={i} onClick={() => { setFaviconSrc(v); setGeneratedSizes([]); setShowSizes(false); }} className="rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary transition-all aspect-square">
                                  <Image src={v} alt={`Variation ${i + 1}`} width={96} height={96} className="object-cover w-full h-full bg-white" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                    </TabsContent>
                    <TabsContent value="editor" className="p-4 m-0">
                         <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Shapes & Text</h3>
                                 <p className="text-sm text-muted-foreground pb-4">
                                   Feature coming soon.
                                  </p>
                                <div className="flex justify-start gap-2">
                                    <Button variant="outline" size="icon" disabled><Square /></Button>
                                    <Button variant="outline" size="icon" disabled><Circle /></Button>
                                    <Button variant="outline" size="icon" disabled><Type /></Button>
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
                         </div>
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </>
    )

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold hidden sm:block">Favicon Forge</h1>
           <h1 className="text-xl font-bold sm:hidden">Forge</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleGenerateAllSizes} disabled={!faviconSrc} variant="outline" size="sm">
              <Eye className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Preview Sizes</span>
            </Button>
            <Button size="sm" onClick={handleDownloadZip} disabled={generatedSizes.length === 0}>
              <Package className="mr-0 sm:mr-2 h-4 w-4" />
               <span className="hidden sm:inline">Export All</span>
            </Button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[400px_1fr] gap-0">
        {/* Left Panel: Tools (Desktop) */}
        <aside className="border-r border-border flex-col hidden md:flex">
            <ToolPanel/>
        </aside>

        {/* Right Panel: Canvas & Previews */}
        <div className="flex flex-col bg-muted/20 relative">
             <div className="flex-1 flex flex-col p-4 sm:p-8">
              {showSizes && generatedSizes.length > 0 ? (
                 <Card className="flex-1 flex flex-col">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                           <Eye className="w-5 h-5 sm:w-6 sm:h-6"/> Previews
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowSizes(false)}>
                            <X className="w-5 h-5"/>
                            <span className="sr-only">Close Previews</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-full">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pr-4">
                              {generatedSizes.map(({ size, dataUrl }) => (
                                <div key={size} className="flex flex-col items-center gap-2 p-2 rounded-lg bg-secondary">
                                  <div className="w-20 h-20 bg-white rounded-md flex items-center justify-center p-1 shadow-inner">
                                    <Image src={dataUrl} alt={`Favicon ${size}x${size}`} width={size} height={size} className="object-contain" />
                                  </div>
                                  <span className="text-xs font-medium">{size}x{size}</span>
                                  <Button variant="ghost" size="sm" onClick={() => downloadImage(dataUrl, `favicon-${size}x${size}.png`)}>
                                    <Download className="mr-1.5 h-3 w-3" />
                                    Save
                                  </Button>
                                </div>
                              ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" size="lg" onClick={handleDownloadZip}>
                          <Package className="mr-2 h-4 w-4" />
                          Export All as .ZIP
                        </Button>
                    </CardFooter>
                </Card>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="relative aspect-square w-full max-w-[400px] bg-white p-4 shadow-2xl rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background" 
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
                    {faviconSrc ? (
                      <Image src={faviconSrc} alt="Favicon" layout="fill" objectFit="contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                        <Upload className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-muted-foreground/50" />
                        <h3 className="font-semibold text-lg">Create your icon</h3>
                        <p className="text-sm text-muted-foreground/80 mt-1 max-w-xs">Click here to upload an image or start with a blank canvas from the tools.</p>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>

             {/* Bottom Tools Panel (Mobile) */}
             <div className="md:hidden sticky bottom-0 bg-background border-t z-10">
                 <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tools">
                    <AccordionTrigger className="p-4 bg-background hover:no-underline">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Settings className="w-6 h-6"/>
                            <span>Tools</span>
                            <ChevronUp className="h-4 w-4 shrink-0 transition-transform duration-200 accordion-chevron" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                         <div className="max-h-[50vh] overflow-y-auto">
                            <ToolPanel/>
                         </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </div>
        </div>
      </main>
      <style jsx>{`
        .accordion-chevron {
            transition: transform 0.2s ease-in-out;
        }
        [data-state=open] .accordion-chevron {
            transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
}
