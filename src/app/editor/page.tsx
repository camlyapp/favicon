
'use client';

import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    Save,
    Square,
    Circle,
    Type,
    RefreshCw,
    Loader2,
    Crop,
    Check,
    X
} from 'lucide-react';
import { AppHeader } from '@/components/header';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const EDITOR_RESOLUTION = 1024;

export default function EditorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [canvasColor, setCanvasColor] = useState('#ffffff');
  const [drawColor, setDrawColor] = useState('#A050C3');
  const [text, setText] = useState('A');

  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState<Rect>({ x: 50, y: 50, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const imageToEdit = sessionStorage.getItem('faviconToEdit');
    if (imageToEdit) {
      setFaviconSrc(imageToEdit);
    } else {
      router.replace('/');
      toast({
        title: "No Image Found",
        description: "Please select an image to edit first.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  }, [router, toast]);

  useEffect(() => {
    if (faviconSrc && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        img.onload = () => {
            if (ctx) {
                 const size = EDITOR_RESOLUTION;
                 canvas.width = size;
                 canvas.height = size;
                 ctx.fillStyle = canvasColor;
                 ctx.fillRect(0,0,size,size);

                 const imgAspectRatio = img.width / img.height;
                 let drawWidth = size;
                 let drawHeight = size;
                 
                 if (img.width > img.height) {
                    drawHeight = size / imgAspectRatio;
                 } else {
                    drawWidth = size * imgAspectRatio;
                 }

                 const xOffset = (size - drawWidth) / 2;
                 const yOffset = (size - drawHeight) / 2;
                 
                 ctx.imageSmoothingEnabled = true;
                 ctx.imageSmoothingQuality = 'high';
                 ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
                 
                 if (!isCropping) {
                    const initialSize = Math.min(canvas.width, canvas.height) * 0.8;
                    setCropRect({
                        x: (canvas.width - initialSize) / 2,
                        y: (canvas.height - initialSize) / 2,
                        width: initialSize,
                        height: initialSize,
                    });
                 }
            }
        };
        img.src = faviconSrc;
    }
  }, [faviconSrc, canvasColor, isCropping]);

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
      const size = EDITOR_RESOLUTION;
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = canvasColor;
      ctx.fillRect(0, 0, size, size);
      const dataUrl = canvas.toDataURL();
      setFaviconSrc(dataUrl);
    }
  };

  const handleDrawShape = (shape: 'square' | 'circle') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = drawColor;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1, canvas.width * 0.04);

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
    } 
    
    const dataUrl = canvas.toDataURL();
    setFaviconSrc(dataUrl);
  };

  const handleDrawText = () => {
     const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = drawColor;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1, canvas.width * 0.02);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const baseSize = canvas.width * 0.4;
    const fontSize = Math.min(baseSize, baseSize / (text.length / 1.5) );
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.fillText(text, centerX, centerY);
    ctx.strokeText(text, centerX, centerY);
    
    const dataUrl = canvas.toDataURL();
    setFaviconSrc(dataUrl);
  }
  
    const getHandleAt = (e: MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current) return null;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const { x, y, width, height } = cropRect;
        const handleSize = 10;

        // Scale mouse coords to canvas resolution
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (mouseX * scaleX > x - handleSize && mouseX * scaleX < x + handleSize && mouseY * scaleY > y - handleSize && mouseY * scaleY < y + handleSize) return 'tl';
        if (mouseX * scaleX > x + width - handleSize && mouseX * scaleX < x + width + handleSize && mouseY * scaleY > y - handleSize && mouseY * scaleY < y + handleSize) return 'tr';
        if (mouseX * scaleX > x - handleSize && mouseX * scaleX < x + handleSize && mouseY * scaleY > y + height - handleSize && mouseY * scaleY < y + height + handleSize) return 'bl';
        if (mouseX * scaleX > x + width - handleSize && mouseX * scaleX < x + width + handleSize && mouseY * scaleY > y + height - handleSize && mouseY * scaleY < y + height + handleSize) return 'br';

        if (mouseX * scaleX > x + handleSize && mouseX * scaleX < x + width - handleSize && mouseY * scaleY > y - handleSize && mouseY * scaleY < y + handleSize) return 't';
        if (mouseX * scaleX > x + handleSize && mouseX * scaleX < x + width - handleSize && mouseY * scaleY > y + height - handleSize && mouseY * scaleY < y + height + handleSize) return 'b';
        if (mouseX * scaleX > x - handleSize && mouseX * scaleX < x + handleSize && mouseY * scaleY > y + handleSize && mouseY * scaleY < y + height - handleSize) return 'l';
        if (mouseX * scaleX > x + width - handleSize && mouseX * scaleX < x + width + handleSize && mouseY * scaleY > y + handleSize && mouseY * scaleY < y + height - handleSize) return 'r';

        if (mouseX * scaleX > x && mouseX * scaleX < x + width && mouseY * scaleY > y && mouseY * scaleY < y + height) return 'move';
        return null;
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (!isCropping || !canvasRef.current) return;
        const handle = getHandleAt(e);
        if (handle) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            setIsDragging(true);
            setResizeHandle(handle);
            setDragStart({ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY });
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !isCropping || !resizeHandle || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const dx = mouseX - dragStart.x;
        const dy = mouseY - dragStart.y;
        
        let newRect = { ...cropRect };
        
        if (resizeHandle.includes('l')) {
            newRect.x += dx;
            newRect.width -= dx;
        }
        if (resizeHandle.includes('r')) {
            newRect.width += dx;
        }
        if (resizeHandle.includes('t')) {
            newRect.y += dy;
            newRect.height -= dy;
        }
        if (resizeHandle.includes('b')) {
            newRect.height += dy;
        }
        if (resizeHandle === 'move') {
            newRect.x += dx;
            newRect.y += dy;
        }

        if (newRect.width < 20) {
            newRect.width = 20;
            if (resizeHandle.includes('l')) newRect.x = cropRect.x + cropRect.width - 20;
        }
        if (newRect.height < 20) {
            newRect.height = 20;
            if (resizeHandle.includes('t')) newRect.y = cropRect.y + cropRect.height - 20;
        }

        if (newRect.x < 0) {
            if(resizeHandle.includes('l')) newRect.width += newRect.x;
            newRect.x = 0;
        }
        if (newRect.y < 0) {
            if(resizeHandle.includes('t')) newRect.height += newRect.y;
            newRect.y = 0;
        }

        if (newRect.x + newRect.width > canvas.width) {
           newRect.width = canvas.width - newRect.x;
           if (resizeHandle === 'move') newRect.x = canvas.width - newRect.width;
        }
        if (newRect.y + newRect.height > canvas.height) {
           newRect.height = canvas.height - newRect.y;
           if (resizeHandle === 'move') newRect.y = canvas.height - newRect.height;
        }

        setCropRect(newRect);
        setDragStart({ x: mouseX, y: mouseY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setResizeHandle(null);
    };

    const handleApplyCrop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y, width, height } = cropRect;
        const imageData = ctx.getImageData(x, y, width, height);

        const newCanvas = document.createElement('canvas');
        newCanvas.width = width;
        newCanvas.height = height;
        const newCtx = newCanvas.getContext('2d');
        if (newCtx) {
            newCtx.putImageData(imageData, 0, 0);
            const dataUrl = newCanvas.toDataURL('image/png');
            setFaviconSrc(dataUrl);
        }
        setIsCropping(false);
    };

    const startCropping = () => {
        setIsCropping(true);
        const canvas = canvasRef.current;
        if(canvas) {
          const initialSize = Math.min(canvas.width, canvas.height) * 0.8;
           setCropRect({
            x: (canvas.width - initialSize) / 2,
            y: (canvas.height - initialSize) / 2,
            width: initialSize,
            height: initialSize,
          });
        }
    };

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  const canvasDisplaySize = canvasContainerRef.current ? Math.min(canvasContainerRef.current.clientWidth, 400) : 300;


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader isEditorPage={true} onSave={handleSave} />
      <main className="flex-1 grid grid-cols-3 gap-0">
        <aside className="col-span-3 lg:col-span-1 border-r border-border flex flex-col p-4 space-y-4 overflow-y-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Canvas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                         <Label htmlFor="canvas-color" className="sr-only">Background</Label>
                        <Input id="canvas-color" type="color" value={canvasColor} onChange={(e) => setCanvasColor(e.target.value)} className="p-1 h-10 w-14 cursor-pointer" />
                        <Button className="w-full" variant="secondary" onClick={handleNewCanvas} disabled={isCropping}>
                            <RefreshCw className="mr-2 h-4 w-4" /> New Blank Canvas
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Crop</CardTitle>
                </CardHeader>
                <CardContent>
                 {isCropping ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="destructive" onClick={() => setIsCropping(false)}><X className="mr-2 h-4 w-4" /> Cancel</Button>
                    <Button onClick={handleApplyCrop}><Check className="mr-2 h-4 w-4" /> Apply</Button>
                  </div>
                ) : (
                  <Button className="w-full" variant="secondary" onClick={startCropping}>
                    <Crop className="mr-2 h-4 w-4" /> Crop Image
                  </Button>
                )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Drawing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="draw-color">Color</Label>
                        <Input id="draw-color" type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="p-1 h-10 w-full cursor-pointer mt-1" />
                    </div>
                    <div>
                        <Label>Shapes</Label>
                         <div className="flex justify-start gap-2 mt-1">
                            <Button variant="outline" size="icon" onClick={() => handleDrawShape('square')} disabled={isCropping}><Square /></Button>
                            <Button variant="outline" size="icon" onClick={() => handleDrawShape('circle')} disabled={isCropping}><Circle /></Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="text-input">Text</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input id="text-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={3} disabled={isCropping} />
                           <Button variant="outline" size="icon" onClick={handleDrawText} disabled={isCropping || !text}>
                              <Type />
                           </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </aside>
        <div 
          className="col-span-3 lg:col-span-2 flex items-center justify-center bg-muted/20 p-4 relative"
          ref={canvasContainerRef}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
            <div className="relative aspect-square w-full max-w-[400px] bg-white shadow-2xl rounded-2xl overflow-hidden"
                 style={{
                    backgroundImage: `
                      linear-gradient(45deg, #eee 25%, transparent 25%),
                      linear-gradient(-45deg, #eee 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #eee 75%),
                      linear-gradient(-45deg, transparent 75%, #eee 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    cursor: isDragging ? 'grabbing' : isCropping ? 'crosshair' : 'default',
                }}
                onMouseDown={handleMouseDown}
            >
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-contain" />
                  {isCropping && canvasRef.current && (
                    <>
                      {/* Overlay */}
                      <div className="absolute top-0 left-0 w-full h-full bg-black/50"
                          style={{
                              clipPath: `evenodd(
                                  M 0 0 H ${canvasDisplaySize} V ${canvasDisplaySize} H 0 Z
                                  M ${cropRect.x / (EDITOR_RESOLUTION/canvasDisplaySize)} ${cropRect.y / (EDITOR_RESOLUTION/canvasDisplaySize)} H ${ (cropRect.x + cropRect.width) / (EDITOR_RESOLUTION/canvasDisplaySize)} V ${(cropRect.y + cropRect.height) / (EDITOR_RESOLUTION/canvasDisplaySize)} H ${cropRect.x/(EDITOR_RESOLUTION/canvasDisplaySize)} Z
                              )`
                          }}
                      />
                      {/* Border */}
                      <div className="absolute border-2 border-dashed border-white pointer-events-none"
                          style={{
                              left: cropRect.x / (EDITOR_RESOLUTION / canvasDisplaySize),
                              top: cropRect.y / (EDITOR_RESOLUTION / canvasDisplaySize),
                              width: cropRect.width / (EDITOR_RESOLUTION / canvasDisplaySize),
                              height: cropRect.height / (EDITOR_RESOLUTION / canvasDisplaySize),
                          }}
                      />
                      {/* Handles */}
                      <div className="absolute w-3 h-3 bg-white border border-gray-500 rounded-full" style={{ left: cropRect.x / (EDITOR_RESOLUTION / canvasDisplaySize) - 6, top: cropRect.y / (EDITOR_RESOLUTION / canvasDisplaySize) - 6, cursor: 'nwse-resize' }} />
                      <div className="absolute w-3 h-3 bg-white border border-gray-500 rounded-full" style={{ left: (cropRect.x + cropRect.width) / (EDITOR_RESOLUTION / canvasDisplaySize) - 6, top: cropRect.y / (EDITOR_RESOLUTION / canvasDisplaySize) - 6, cursor: 'nesw-resize' }} />
                      <div className="absolute w-3 h-3 bg-white border border-gray-500 rounded-full" style={{ left: cropRect.x / (EDITOR_RESOLUTION / canvasDisplaySize) - 6, top: (cropRect.y + cropRect.height) / (EDITOR_RESOLUTION / canvasDisplaySize) - 6, cursor: 'nesw-resize' }} />
                      <div className="absolute w-3 h-3 bg-white border border-gray-500 rounded-full" style={{ left: (cropRect.x + cropRect.width) / (EDITOR_RESOLUTION / canvasDisplaySize) - 6, top: (cropRect.y + cropRect.height) / (EDITOR_RESOLUTION / canvasDisplaySize) - 6, cursor: 'nwse-resize' }} />

                      <div className="absolute w-3 h-1.5 bg-white border-y border-gray-500" style={{ left: `calc(${cropRect.x / (EDITOR_RESOLUTION/canvasDisplaySize)}px + ${cropRect.width/(EDITOR_RESOLUTION/canvasDisplaySize)/2}px - 6px)`, top: cropRect.y / (EDITOR_RESOLUTION/canvasDisplaySize) - 1.5, cursor: 'ns-resize' }} />
                      <div className="absolute w-3 h-1.5 bg-white border-y border-gray-500" style={{ left: `calc(${cropRect.x / (EDITOR_RESOLUTION/canvasDisplaySize)}px + ${cropRect.width/(EDITOR_RESOLUTION/canvasDisplaySize)/2}px - 6px)`, top: (cropRect.y + cropRect.height)/(EDITOR_RESOLUTION/canvasDisplaySize) - 1.5, cursor: 'ns-resize' }} />
                      <div className="absolute w-1.5 h-3 bg-white border-x border-gray-500" style={{ left: cropRect.x / (EDITOR_RESOLUTION/canvasDisplaySize) - 1.5, top: `calc(${cropRect.y/(EDITOR_RESOLUTION/canvasDisplaySize)}px + ${cropRect.height/(EDITOR_RESOLUTION/canvasDisplaySize)/2}px - 6px)`, cursor: 'ew-resize' }} />
                      <div className="absolute w-1.5 h-3 bg-white border-x border-gray-500" style={{ left: (cropRect.x + cropRect.width)/(EDITOR_RESOLUTION/canvasDisplaySize) - 1.5, top: `calc(${cropRect.y/(EDITOR_RESOLUTION/canvasDisplaySize)}px + ${cropRect.height/(EDITOR_RESOLUTION/canvasDisplaySize)/2}px - 6px)`, cursor: 'ew-resize' }} />
                    </>
                  )}
            </div>
        </div>
      </main>
    </div>
  );
}

    