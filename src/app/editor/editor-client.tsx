
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
    X,
    Trash2,
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold
} from 'lucide-react';
import { AppHeader } from '@/components/header';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch';


interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasElement {
    id: string;
    type: 'shape' | 'text' | 'image';
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    shape?: 'square' | 'circle';
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    img?: HTMLImageElement;
}


const EDITOR_RESOLUTION = 1024;

export default function EditorPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [canvasColor, setCanvasColor] = useState('#ffffff');
  
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [textInput, setTextInput] = useState('A');
  const [textColor, setTextColor] = useState('#A050C3');
  const [fontSize, setFontSize] = useState(128);
  const [fontFamily, setFontFamily] = useState('Space Grotesk');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold');

  const [shapeColor, setShapeColor] = useState('#A050C3');


  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0,0,canvas.width, canvas.height);

    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach(el => {
        if(el.type === 'image' && el.img) {
             const imgAspectRatio = el.img.width / el.img.height;
             let drawWidth = canvas.width;
             let drawHeight = canvas.height;
             
             if (el.img.width > el.img.height) {
                drawHeight = canvas.width / imgAspectRatio;
             } else {
                drawWidth = canvas.width * imgAspectRatio;
             }

             const xOffset = (canvas.width - drawWidth) / 2;
             const yOffset = (canvas.height - drawHeight) / 2;
             
             ctx.drawImage(el.img, xOffset, yOffset, drawWidth, drawHeight);
        } else if (el.type === 'shape' && el.color && el.shape) {
            ctx.fillStyle = el.color;
            if (el.shape === 'square') {
                ctx.fillRect(el.x, el.y, el.width, el.height);
            } else if (el.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(el.x + el.width/2, el.y + el.height/2, el.width/2, 0, 2 * Math.PI, false);
                ctx.fill();
            }
        } else if (el.type === 'text' && el.text && el.color && el.fontSize && el.fontFamily) {
            ctx.fillStyle = el.color;
            ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize}px "${el.fontFamily}", sans-serif`;
            ctx.textAlign = el.textAlign || 'left';
            ctx.textBaseline = 'top';

            let x = el.x;
            if (el.textAlign === 'center') {
                x = el.x + el.width / 2;
            } else if (el.textAlign === 'right') {
                x = el.x + el.width;
            }
            
            ctx.fillText(el.text, x, el.y);
        }
        
        if (el.id === selectedElementId) {
            ctx.strokeStyle = '#007BFF';
            ctx.lineWidth = 4;
            ctx.strokeRect(el.x-2, el.y-2, el.width+4, el.height+4);
        }
    });
  }

  useEffect(() => {
    const imageToEdit = sessionStorage.getItem('faviconToEdit');
    if (imageToEdit) {
      setFaviconSrc(imageToEdit);
       const img = new window.Image();
        img.onload = () => {
            const size = EDITOR_RESOLUTION;
             const newImageElement: CanvasElement = {
                id: `img_${Date.now()}`,
                type: 'image',
                x: 0,
                y: 0,
                width: size,
                height: size,
                img: img
             };
            setElements([newImageElement]);
        };
        img.src = imageToEdit;

    } else {
      handleNewCanvas();
    }
    setIsLoading(false);
  }, [router, toast]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if(canvas) {
        canvas.width = EDITOR_RESOLUTION;
        canvas.height = EDITOR_RESOLUTION;
        renderCanvas();
    }
  }, [elements, canvasColor, selectedElementId]);

  const handleSave = () => {
    if (canvasRef.current) {
        setSelectedElementId(null);
        setTimeout(() => {
             if (canvasRef.current) {
                const dataUrl = canvasRef.current.toDataURL('image/png');
                sessionStorage.setItem('croppedImage', dataUrl);
                router.push('/');
             }
        }, 100);
    }
  };

  const handleNewCanvas = () => {
    setElements([]);
    setSelectedElementId(null);
  };

  const addShape = (shape: 'square' | 'circle') => {
    const size = EDITOR_RESOLUTION * 0.4;
    const newShape: CanvasElement = {
        id: `${shape}_${Date.now()}`,
        type: 'shape',
        shape: shape,
        x: (EDITOR_RESOLUTION - size)/2,
        y: (EDITOR_RESOLUTION - size)/2,
        width: size,
        height: size,
        color: shapeColor,
    };
    setElements(prev => [...prev, newShape]);
    setSelectedElementId(newShape.id);
  }

  const addText = () => {
    if (!textInput) return;
    
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
    const textMetrics = ctx.measureText(textInput);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    const newText: CanvasElement = {
        id: `text_${Date.now()}`,
        type: 'text',
        x: (EDITOR_RESOLUTION - textWidth)/2,
        y: (EDITOR_RESOLUTION - textHeight)/2,
        width: textWidth,
        height: textHeight,
        text: textInput,
        fontSize: fontSize,
        fontFamily: fontFamily,
        textAlign: textAlign,
        fontWeight: fontWeight,
        color: textColor
    };
    setElements(prev => [...prev, newText]);
    setSelectedElementId(newText.id);
  };

  const deleteSelectedElement = () => {
    if(!selectedElementId) return;
    setElements(prev => prev.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
  }

  const getElementAt = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (el.type === 'image') continue; 
        if (mouseX >= el.x && mouseX <= el.x + el.width && mouseY >= el.y && mouseY <= el.y + el.height) {
            return el;
        }
    }
    return null;
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const element = getElementAt(e);
    if(element) {
        setSelectedElementId(element.id);
        setIsDragging(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        setDragStart({ x: mouseX - element.x, y: mouseY - element.y });
    } else {
        setSelectedElementId(null);
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectedElementId || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    setElements(prev => prev.map(el => {
        if (el.id === selectedElementId) {
            return {
                ...el,
                x: mouseX - dragStart.x,
                y: mouseY - dragStart.y
            };
        }
        return el;
    }));
  }

  const handleMouseUp = () => {
    setIsDragging(false);
  }
  
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  useEffect(() => {
    if (selectedElement && selectedElement.type === 'text') {
        setElements(prev => prev.map(el => {
            if (el.id === selectedElementId && el.type === 'text') {
                const canvas = canvasRef.current;
                if(!canvas) return el;
                const ctx = canvas.getContext('2d');
                if(!ctx) return el;
                ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
                const textMetrics = ctx.measureText(el.text!);
                
                return {
                    ...el,
                    fontSize,
                    fontFamily,
                    textAlign,
                    fontWeight,
                    color: textColor,
                    width: textMetrics.width,
                    height: fontSize
                };
            }
            return el;
        }))
    }
  }, [fontSize, fontFamily, textAlign, fontWeight, textColor, selectedElementId]);

  useEffect(() => {
    if (selectedElement && selectedElement.type === 'shape') {
        setElements(prev => prev.map(el => {
            if (el.id === selectedElementId && el.type === 'shape') {
                return {
                    ...el,
                    color: shapeColor,
                };
            }
            return el;
        }))
    }
  }, [shapeColor, selectedElementId])


  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader isEditorPage={true} onSave={handleSave} />
      <main className="flex-1 grid grid-cols-3 gap-0">
        <aside className="col-span-3 lg:col-span-1 border-r border-border flex flex-col p-4 space-y-4 overflow-y-auto">
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Canvas</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2">
                         <Label htmlFor="canvas-color" className="sr-only">Background</Label>
                        <Input id="canvas-color" type="color" value={canvasColor} onChange={(e) => setCanvasColor(e.target.value)} className="p-1 h-9 w-12 cursor-pointer" />
                        <Button size="sm" className="w-full" variant="secondary" onClick={handleNewCanvas}>
                            <RefreshCw className="mr-2 h-4 w-4" /> New
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Shapes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                     <div className="flex items-center gap-2">
                        <Label htmlFor="shape-color">Color</Label>
                        <Input id="shape-color" type="color" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)} className="p-1 h-10 w-full cursor-pointer mt-1" />
                    </div>
                    <div className="flex justify-start gap-2 mt-1">
                        <Button variant="outline" size="icon" onClick={() => addShape('square')}><Square /></Button>
                        <Button variant="outline" size="icon" onClick={() => addShape('circle')}><Circle /></Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Text</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="text-input">Content</Label>
                            <Input id="text-input" value={textInput} onChange={(e) => setTextInput(e.target.value)} maxLength={5} />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="text-color">Color</Label>
                            <Input id="text-color" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="p-1 h-10 w-full cursor-pointer" />
                        </div>
                    </div>
                     <Button className="w-full" variant="outline" onClick={addText} disabled={!textInput}>
                        <Type className="mr-2 h-4 w-4" />
                        Add Text
                    </Button>
                </CardContent>
            </Card>
            
            {selectedElement?.type === 'text' && (
             <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">Typography</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                     <div>
                        <Label>Font Family</Label>
                        <Select value={fontFamily} onValueChange={setFontFamily}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Font Size: {fontSize}px</Label>
                        <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={16} max={512} step={2}/>
                    </div>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Label>Align</Label>
                            <div className="flex gap-1">
                                <Button variant={textAlign === 'left' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTextAlign('left')}><AlignLeft className="h-4 w-4"/></Button>
                                <Button variant={textAlign === 'center' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTextAlign('center')}><AlignCenter className="h-4 w-4"/></Button>
                                <Button variant={textAlign === 'right' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTextAlign('right')}><AlignRight className="h-4 w-4"/></Button>
                            </div>
                         </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="font-weight" checked={fontWeight === 'bold'} onCheckedChange={(c) => setFontWeight(c ? 'bold' : 'normal')} />
                            <Label htmlFor="font-weight">Bold</Label>
                        </div>
                    </div>
                </CardContent>
             </Card>
            )}

            {selectedElementId && (
                <Button variant="destructive" onClick={deleteSelectedElement}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                </Button>
            )}

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
                    cursor: isDragging ? 'grabbing' : 'default',
                }}
                onMouseDown={handleMouseDown}
            >
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-contain" />
            </div>
        </div>
      </main>
    </div>
  );
}

    