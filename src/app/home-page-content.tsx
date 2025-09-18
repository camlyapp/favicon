
'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    Upload,
    Loader2,
    Sparkles,
    Download,
    Eye,
    X,
    Pencil,
    Package,
    ArrowDown,
    Share2
} from 'lucide-react';
import JSZip from 'jszip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppHeader } from '@/components/header';

const SIZES = [16, 32, 48, 64, 72, 96, 114, 120, 128, 144, 152, 167, 180, 192, 196, 256, 384, 512, 1024];

interface GeneratedSize {
  size: number;
  dataUrl: string;
}

export default function HomePageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [generatedSizes, setGeneratedSizes] = useState<GeneratedSize[]>([]);
  const [showSizes, setShowSizes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    const croppedImage = sessionStorage.getItem('croppedImage');
    if (croppedImage) {
        setFaviconSrc(croppedImage);
        sessionStorage.removeItem('croppedImage');
        sessionStorage.removeItem('faviconToEdit'); 
        setGeneratedSizes([]);
        setShowSizes(false);
    } else {
        const originalImage = sessionStorage.getItem('faviconToEdit');
        if (originalImage) {
            setFaviconSrc(originalImage);
        }
    }
  }, []);

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
        setGeneratedSizes([]);
        setShowSizes(false);
      };
      reader.readAsDataURL(file);
    }
     // Reset file input to allow uploading the same file again
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleGoToEditor = () => {
    if (!faviconSrc) {
        toast({ title: "No image", description: "Please upload an image first.", variant: "destructive" });
        return;
    }
    sessionStorage.setItem('faviconToEdit', faviconSrc);
    router.push('/editor');
  }

  const createZip = async () => {
    let currentGeneratedSizes = generatedSizes;
    if (currentGeneratedSizes.length === 0 && faviconSrc) {
        try {
            const highResSrc = await resizeImage(faviconSrc, 1024);
            currentGeneratedSizes = await Promise.all(
                SIZES.map(async (size) => {
                    const dataUrl = await resizeImage(highResSrc, size);
                    return { size, dataUrl };
                })
            );
        } catch (error) {
             toast({
                title: 'Error Generating Sizes',
                description: 'Could not generate sizes for the zip file.',
                variant: 'destructive'
            });
            return null;
        }
    }

    if (currentGeneratedSizes.length === 0) {
        toast({
            title: 'No sizes generated',
            description: 'Could not generate sizes for the zip file. Please try generating them manually first.',
            variant: 'destructive'
        });
        return null;
    }

    const zip = new JSZip();

    currentGeneratedSizes.forEach(({ size, dataUrl }) => {
      const base64Data = dataUrl.split(',')[1];
       if(size === 180) {
          zip.file(`apple-touch-icon.png`, base64Data, { base64: true });
       }
       if (size === 192) {
          zip.file(`android-chrome-192x192.png`, base64Data, { base64: true });
       }
       if (size === 512) {
          zip.file(`android-chrome-512x512.png`, base64Data, { base64: true });
       }
      zip.file(`favicon-${size}x${size}.png`, base64Data, { base64: true });
    });
    
    if (faviconSrc) {
        try {
            const icoUrl = await resizeImage(faviconSrc, 32);
            const base64Data = icoUrl.split(',')[1];
            zip.file(`favicon.ico`, base64Data, { base64: true });
        } catch (error) {
            console.error("Could not generate favicon.ico for the zip file.");
        }
    }

    zip.file('site.webmanifest', getWebmanifestContent());
    zip.file('index.html', getFullHtmlPage());

    return zip;
  }

  const handleShare = async () => {
    if (!faviconSrc) {
        toast({ title: "No image to share", description: "Please generate an image first.", variant: "destructive" });
        return;
    }
    
    if (generatedSizes.length === 0) {
       await handleGenerateAllSizes();
       await new Promise(resolve => setTimeout(resolve, 100));
    }

    const zip = await createZip();
    if (!zip) return;

    try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const file = new File([zipBlob], "favicon_package.zip", { type: "application/zip" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'My Favicon Package',
                text: 'Check out this favicon package I created!',
            });
            toast({ title: "Shared successfully!" });
        } else {
             handleDownloadZip();
        }
    } catch (error) {
        console.error("Sharing failed:", error);
        toast({ title: "Sharing failed", description: "Could not share the file.", variant: "destructive" });
    }
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

   const handleDownloadIco = async () => {
    if (!faviconSrc) {
      toast({ title: "No image", description: "Please create or upload an image first.", variant: "destructive" });
      return;
    }
    try {
      const icoUrl = await resizeImage(faviconSrc, 32);
      downloadImage(icoUrl, 'favicon.ico');
      toast({ title: "Downloaded", description: "favicon.ico has been downloaded." });
    } catch (error) {
       toast({ title: "Error", description: "Could not generate favicon.ico.", variant: "destructive" });
    }
  };
  
  const handleDownloadZip = async () => {
    const zip = await createZip();
    if (!zip) return;

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'favicon_package.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportDialogOpen(false);
  };

  const getHtmlCode = () => {
    return `
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
    `.trim();
  }

  const getFullHtmlPage = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>My Awesome App</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${getHtmlCode()}
</head>
<body>
  <h1>Favicon Test Page</h1>
  <p>Your new favicons should be visible in the browser tab!</p>
</body>
</html>
    `.trim();
  };

  const getWebmanifestContent = () => {
    return JSON.stringify({
        "name": "Favicon: AI-Powered Favicon Generator",
        "short_name": "Favicon",
        "start_url": ".",
        "display": "standalone",
        "background_color": "#A050C3",
        "theme_color": "#A050C3",
        "description": "A modern, intuitive favicon creation app for generating pixel-perfect site icons.",
        "icons": [
            { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" },
            { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
            { "src": "/favicon-32x32.png", "sizes": "32x32", "type": "image/png" },
            { "src": "/favicon-16x16.png", "sizes": "16x16", "type": "image/png" }
        ]
    }, null, 2);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to clipboard!",
    });
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleScrollToUploader = () => {
    uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
       <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/png, image/jpeg, image/svg+xml, image/webp"
        />

        <AppHeader
            onUploadClick={handleUploadClick}
            onGoToEditor={handleGoToEditor}
            onGenerateAllSizes={handleGenerateAllSizes}
            faviconSrc={faviconSrc}
            handleDownloadZip={handleDownloadZip}
            getHtmlCode={getHtmlCode}
            copyToClipboard={copyToClipboard}
            getWebmanifestContent={getWebmanifestContent}
            handleDownloadIco={handleDownloadIco}
            generatedSizes={generatedSizes}
            isExportDialogOpen={isExportDialogOpen}
            setIsExportDialogOpen={setIsExportDialogOpen}
        />

      <main className="flex-1 flex flex-col">
          <section className="w-full py-20 md:py-32 lg:py-40 xl:py-48 text-center bg-gradient-to-br from-background via-yellow-50/50 to-background animate-gradient-xy">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
                    The Ultimate Favicon Generator
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                    Create the perfect icon for your brand. Upload an image, use AI to generate variations, customize in our editor, and export a complete package for your website in one click.
                </p>
                <Button size="lg" onClick={handleScrollToUploader}>
                    Get Started <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
                </div>
            </div>
          </section>

        <div className="flex flex-col bg-muted/20 relative" ref={uploaderRef}>
             <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
              {showSizes && generatedSizes.length > 0 ? (
                 <Card className="flex-1 flex flex-col max-w-7xl w-full mx-auto">
                    <CardHeader className="flex-row items-center justify-between border-b">
                        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                           <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/> Previews
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowSizes(false)}>
                            <X className="w-5 h-5"/>
                            <span className="sr-only">Close Previews</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 md:p-6">
                        <ScrollArea className="h-[60vh]">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pr-4">
                              {generatedSizes.map(({ size, dataUrl }) => (
                                <div key={size} className="flex flex-col items-center gap-3 p-3 rounded-lg bg-background border shadow-sm">
                                  <div className="w-20 h-20 bg-white rounded-md flex items-center justify-center p-1 shadow-inner overflow-hidden">
                                    <Image src={dataUrl} alt={`Favicon ${size}x${size}`} width={size} height={size} className="object-contain" />
                                  </div>
                                  <span className="text-xs font-semibold">{size}x{size}</span>
                                  <Button variant="outline" size="sm" onClick={() => downloadImage(dataUrl, `favicon-${size}x${size}.png`)} className="w-full">
                                    <Download className="mr-1.5 h-3 w-3" />
                                    Save
                                  </Button>
                                </div>
                              ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex items-center gap-2">
                        <Button className="w-full" size="lg" onClick={() => setIsExportDialogOpen(true)}>
                          <Package className="mr-2 h-4 w-4" />
                          Export All
                        </Button>
                        <Button onClick={handleShare} disabled={!faviconSrc} variant="outline" size="lg" className="h-11 w-11 p-0 flex-shrink-0">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </CardFooter>
                </Card>
              ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <div className="lg:col-span-3 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative aspect-square w-full max-w-[400px] bg-white p-4 shadow-2xl rounded-2xl focus:outline-none overflow-hidden"
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
                          <Image src={faviconSrc} alt="Favicon" fill={true} objectFit="contain" className="rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                            <Upload className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-muted-foreground/50" />
                            <h3 className="font-semibold text-lg sm:text-xl">Create your icon</h3>
                            <p className="text-sm text-muted-foreground/80 mt-1 max-w-xs">Click here to upload an image or start with a blank canvas from the tools.</p>
                          </div>
                        )}
                      </button>
                    </div>
                </div>
              )}
            </div>
        </div>
      </main>
    </>
  );
}

    