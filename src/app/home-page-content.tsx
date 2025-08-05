
'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateVariations } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    Upload,
    Loader2,
    Sparkles,
    Download,
    Package,
    Eye,
    X,
    Copy,
    Pencil
} from 'lucide-react';
import JSZip from 'jszip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { AppHeader } from '@/components/header';

const SIZES = [16, 32, 48, 64, 72, 96, 114, 120, 128, 144, 152, 167, 180, 192, 196, 256, 384, 512, 1024];

interface GeneratedSize {
  size: number;
  dataUrl: string;
}

interface ExportDialogProps {
  isExportDialogOpen: boolean;
  setIsExportDialogOpen: (isOpen: boolean) => void;
  faviconSrc: string | null;
  generatedSizes: GeneratedSize[];
  handleDownloadZip: () => void;
  getHtmlCode: () => string;
  copyToClipboard: (text: string) => void;
  getWebmanifestContent: () => string;
  handleDownloadIco: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isExportDialogOpen,
  setIsExportDialogOpen,
  faviconSrc,
  handleDownloadZip,
  getHtmlCode,
  copyToClipboard,
  getWebmanifestContent,
  handleDownloadIco
}) => (
   <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
    <DialogTrigger asChild>
        <Button size="sm" disabled={!faviconSrc}>
            <Package className="mr-0 sm:mr-2 h-4 w-4" />
             <span className="hidden sm:inline">Export All</span>
          </Button>
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
                          <Copy className="h-4 w-4"/>
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
                          <Copy className="h-4 w-4"/>
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
);

export default function HomePageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [generatedSizes, setGeneratedSizes] = useState<GeneratedSize[]>([]);
  const [showSizes, setShowSizes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    const croppedImage = sessionStorage.getItem('croppedImage');
    if (croppedImage) {
        setFaviconSrc(croppedImage);
        sessionStorage.removeItem('croppedImage');
        sessionStorage.removeItem('faviconToEdit'); 
        setVariations([]);
        setGeneratedSizes([]);
        setShowSizes(false);
    } else {
        const originalImage = sessionStorage.getItem('faviconToEdit');
        if (originalImage && !faviconSrc) {
            setFaviconSrc(originalImage);
        }
    }
  }, [faviconSrc]);

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
    if (generatedSizes.length === 0 && faviconSrc) {
       await handleGenerateAllSizes();
       await new Promise(resolve => setTimeout(resolve, 100));
    }
    
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
            return;
        }
    }

    if (currentGeneratedSizes.length === 0) {
        toast({
            title: 'No sizes generated',
            description: 'Could not generate sizes for the zip file. Please try generating them manually first.',
            variant: 'destructive'
        });
        return;
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

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'favicon_package.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        "name": "Favicon Forge: AI-Powered Favicon Generator",
        "short_name": "Favicon Forge",
        "icons": [
            {
                "src": "/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ],
        "theme_color": "#ffffff",
        "background_color": "#ffffff",
        "display": "standalone"
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
            onGenerateVariations={onGenerateVariations}
            isPending={isPending}
            faviconSrc={faviconSrc}
            isExportDialogOpen={isExportDialogOpen}
            setIsExportDialogOpen={setIsExportDialogOpen}
            handleDownloadZip={handleDownloadZip}
            getHtmlCode={getHtmlCode}
            copyToClipboard={copyToClipboard}
            getWebmanifestContent={getWebmanifestContent}
            handleDownloadIco={handleDownloadIco}
            ExportDialog={ExportDialog}
        />

      <main className="flex-1 grid grid-cols-1">
        <div className="flex flex-col bg-muted/20 relative">
             <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 pr-4">
                              {generatedSizes.map(({ size, dataUrl }) => (
                                <div key={size} className="flex flex-col items-center gap-2 p-2 rounded-lg bg-secondary">
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-md flex items-center justify-center p-1 shadow-inner">
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
                         <Button className="w-full" size="lg" onClick={() => setIsExportDialogOpen(true)}>
                          <Package className="mr-2 h-4 w-4" />
                          Export All
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
                     {variations.length > 0 && (
                        <div className="lg:col-span-1">
                            <h3 className="text-lg font-medium mb-4 text-center lg:text-left">AI Variations</h3>
                            <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 rounded-lg p-2 bg-secondary/50">
                              {variations.map((v, i) => (
                                <button key={i} onClick={() => { setFaviconSrc(v); setGeneratedSizes([]); setShowSizes(false); }} className="rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary transition-all aspect-square">
                                  <Image src={v} alt={`Variation ${i + 1}`} width={96} height={96} className="object-cover w-full h-full bg-white" />
                                </button>
                              ))}
                            </div>
                        </div>
                      )}
                </div>
              )}
            </div>
        </div>
      </main>
    </>
  );
}
