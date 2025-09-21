
'use client';

import React, { useState, useRef, useEffect, MouseEvent, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Save,
    Square,
    Circle,
    Type,
    RefreshCw,
    Loader2,
    Trash2,
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    ArrowUp,
    ArrowDown,
    Plus,
    Minus,
    Undo,
    Redo,
    Pencil,
    Eraser
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


interface CanvasElement {
    id: string;
    type: 'shape' | 'text' | 'image' | 'path';
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
    opacity?: number;
    strokeWidth?: number;
    strokeColor?: string;
    points?: {x: number, y: number}[];
}

interface HistoryState {
    elements: CanvasElement[];
}

const EDITOR_RESOLUTION = 1024;
const HANDLE_SIZE = 16;
type Handle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

export default function EditorPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  const [elements, setElements] = useState<CanvasElement[]>([]);
  
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState<Handle>(null);
  
  const [textInput, setTextInput] = useState('A');
  const [textColor, setTextColor] = useState('#A050C3');
  const [fontSize, setFontSize] = useState(128);
  const [fontFamily, setFontFamily] = useState('Space Grotesk');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold');

  const [shapeColor, setShapeColor] = useState('#A050C3');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);
  
  const [drawColor, setDrawColor] = useState('#000000');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState(10);
  const [activeTool, setActiveTool] = useState<'select' | 'pencil' | 'eraser'>('select');
  const [isDrawing, setIsDrawing] = useState(false);

  const [elementOpacity, setElementOpacity] = useState(1);
  
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const saveStateToHistory = useCallback(() => {
    const currentState: HistoryState = { elements };
    
    const newHistory = history.slice(0, historyIndex + 1);
    
    setHistory([...newHistory, currentState]);
    setHistoryIndex(newHistory.length);
  }, [elements, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevState = history[newIndex];
      setElements(prevState.elements);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setElements(nextState.elements);
    }
  };


  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0,0,canvas.width, canvas.height);

    elements.forEach(el => {
        ctx.globalAlpha = el.opacity ?? 1;

        if(el.type === 'image' && el.img) {
             ctx.drawImage(el.img, el.x, el.y, el.width, el.height);
        } else if (el.type === 'shape' && el.color && el.shape) {
            ctx.fillStyle = el.color;
             if (el.strokeWidth && el.strokeWidth > 0 && el.strokeColor) {
                ctx.strokeStyle = el.strokeColor;
                ctx.lineWidth = el.strokeWidth;
            } else {
                ctx.strokeStyle = 'transparent';
                ctx.lineWidth = 0;
            }

            if (el.shape === 'square') {
                ctx.fillRect(el.x, el.y, el.width, el.height);
                if (el.strokeWidth && el.strokeWidth > 0) ctx.strokeRect(el.x, el.y, el.width, el.height);
            } else if (el.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(el.x + el.width/2, el.y + el.height/2, el.width/2, 0, 2 * Math.PI, false);
                ctx.fill();
                if (el.strokeWidth && el.strokeWidth > 0) ctx.stroke();
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
        } else if (el.type === 'path' && el.points && el.points.length > 0) {
            ctx.strokeStyle = el.color || '#000000';
            ctx.lineWidth = el.strokeWidth || 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(el.points[0].x, el.points[0].y);
            for(let i = 1; i < el.points.length; i++) {
                ctx.lineTo(el.points[i].x, el.points[i].y);
            }
            ctx.stroke();
        }
        
        if (el.id === selectedElementId) {
            ctx.strokeStyle = '#007BFF';
            ctx.lineWidth = 4;
            ctx.strokeRect(el.x-2, el.y-2, el.width+4, el.height+4);

            if (el.type === 'shape' || el.type === 'image') {
                ctx.fillStyle = '#007BFF';
                ctx.fillRect(el.x - HANDLE_SIZE/2, el.y - HANDLE_SIZE/2, HANDLE_SIZE, HANDLE_SIZE);
                ctx.fillRect(el.x + el.width - HANDLE_SIZE/2, el.y - HANDLE_SIZE/2, HANDLE_SIZE, HANDLE_SIZE);
                ctx.fillRect(el.x - HANDLE_SIZE/2, el.y + el.height - HANDLE_SIZE/2, HANDLE_SIZE, HANDLE_SIZE);
                ctx.fillRect(el.x + el.width - HANDLE_SIZE/2, el.y + el.height - HANDLE_SIZE/2, HANDLE_SIZE, HANDLE_SIZE);
            }
        }

        ctx.globalAlpha = 1; // Reset for next element
    });
  }

  useEffect(() => {
    const imageToEdit = sessionStorage.getItem('faviconToEdit');
    const initialElements: CanvasElement[] = [];
    if (imageToEdit) {
      setFaviconSrc(imageToEdit);
       const img = new window.Image();
        img.onload = () => {
            const canvasSize = EDITOR_RESOLUTION;
            let width = img.width;
            let height = img.height;
            const imgAspectRatio = width / height;

            if (width > height) {
                if (width > canvasSize) {
                    width = canvasSize;
                    height = width / imgAspectRatio;
                }
            } else {
                if (height > canvasSize) {
                    height = canvasSize;
                    width = height * imgAspectRatio;
                }
            }

            const x = (canvasSize - width) / 2;
            const y = (canvasSize - height) / 2;
            
             const newImageElement: CanvasElement = {
                id: `img_${Date.now()}`,
                type: 'image',
                x: x,
                y: y,
                width: width,
                height: height,
                img: img,
                opacity: 1,
             };
            setElements([newImageElement]);
            const initialState: HistoryState = { elements: [newImageElement] };
            setHistory([initialState]);
            setHistoryIndex(0);
        };
        img.src = imageToEdit;

    } else {
       const initialState: HistoryState = { elements: [] };
       setHistory([initialState]);
       setHistoryIndex(0);
    }
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if(canvas) {
        canvas.width = EDITOR_RESOLUTION;
        canvas.height = EDITOR_RESOLUTION;
        renderCanvas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, selectedElementId]);

  useEffect(() => {
    if (selectedElement) {
        setElementOpacity(selectedElement.opacity ?? 1);
        if (selectedElement.type === 'shape') {
            setShapeColor(selectedElement.color ?? '#A050C3');
            setStrokeColor(selectedElement.strokeColor ?? '#000000');
            setStrokeWidth(selectedElement.strokeWidth ?? 0);
        } else if (selectedElement.type === 'text') {
            setTextColor(selectedElement.color ?? '#A050C3');
            setFontFamily(selectedElement.fontFamily ?? 'Space Grotesk');
            setFontSize(selectedElement.fontSize ?? 128);
            setTextAlign(selectedElement.textAlign ?? 'center');
            setFontWeight(selectedElement.fontWeight ?? 'bold');
        }
    }
  }, [selectedElementId, selectedElement]);

  const updateSelectedElement = (props: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, ...props } : el));
  };


  const handleSave = () => {
    if (canvasRef.current) {
        setSelectedElementId(null);
        setActiveTool('select');
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
    saveStateToHistory();
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
        opacity: 1,
        strokeColor: '#000000',
        strokeWidth: 0,
    };
    setElements(prev => [...prev, newShape]);
    setSelectedElementId(newShape.id);
    setActiveTool('select');
  }

  const addText = () => {
    if (!textInput) return;
    
    const newText: CanvasElement = {
        id: `text_${Date.now()}`,
        type: 'text',
        x: EDITOR_RESOLUTION / 2,
        y: EDITOR_RESOLUTION / 2,
        width: 0,
        height: 0,
        text: textInput,
        fontSize: fontSize,
        fontFamily: fontFamily,
        textAlign: textAlign,
        fontWeight: fontWeight,
        color: textColor,
        opacity: 1,
    };
    setElements(prev => [...prev, newText]);
    setSelectedElementId(newText.id);
    setActiveTool('select');
  };

  const deleteSelectedElement = () => {
    if(!selectedElementId) return;
    setElements(prev => prev.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
  }

   const getHandleAt = (x: number, y: number, el: CanvasElement): Handle => {
      const halfHandle = HANDLE_SIZE / 2;
      if (x >= el.x - halfHandle && x <= el.x + halfHandle && y >= el.y - halfHandle && y <= el.y + halfHandle) return 'top-left';
      if (x >= el.x + el.width - halfHandle && x <= el.x + el.width + halfHandle && y >= el.y - halfHandle && y <= el.y + halfHandle) return 'top-right';
      if (x >= el.x - halfHandle && x <= el.x + halfHandle && y >= el.y + el.height - halfHandle && y <= el.y + el.height + halfHandle) return 'bottom-left';
      if (x >= el.x + el.width - halfHandle && x <= el.x + el.width + halfHandle && y >= el.y + el.height - halfHandle && y <= el.y + el.height + halfHandle) return 'bottom-right';
      return null;
    }


  const getElementAt = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return {element: null, handle: null};
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    if (selectedElement && (selectedElement.type === 'shape' || selectedElement.type === 'image')) {
        const handle = getHandleAt(mouseX, mouseY, selectedElement);
        if (handle) {
            return { element: selectedElement, handle };
        }
    }

    // Check path elements with a small tolerance
    for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
         if (el.type === 'path' && el.points) {
            for(let j = 0; j < el.points.length-1; j++) {
                // simple line collision check for now
                const p1 = el.points[j];
                const p2 = el.points[j+1];
                const dist = Math.abs((p2.y - p1.y) * mouseX - (p2.x - p1.x) * mouseY + p2.x * p1.y - p2.y * p1.x) / Math.sqrt(Math.pow(p2.y-p1.y, 2) + Math.pow(p2.x - p1.x, 2));
                if (dist < (el.strokeWidth || 5) / 2 + 5) { // 5px tolerance
                     return { element: el, handle: null };
                }
            }
        }
    }

    for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (el.type !== 'path' && mouseX >= el.x && mouseX <= el.x + el.width && mouseY >= el.y && mouseY <= el.y + el.height) {
            return { element: el, handle: null };
        }
    }
    return { element: null, handle: null };
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'pencil') {
        setIsDrawing(true);
        const newPath: CanvasElement = {
            id: `path_${Date.now()}`,
            type: 'path',
            x: mouseX,
            y: mouseY,
            width: 0,
            height: 0,
            points: [{x: mouseX, y: mouseY}],
            color: drawColor,
            strokeWidth: drawStrokeWidth,
            opacity: 1
        };
        setElements(prev => [...prev, newPath]);
        setSelectedElementId(newPath.id);
        return;
    }

    if (activeTool === 'eraser') {
      setIsDrawing(true);
      // No new element, we are erasing existing ones
      return;
    }

    const { element, handle } = getElementAt(e);

    if (handle && element) {
        setIsResizing(handle);
        setSelectedElementId(element.id);
        setDragStart({x: mouseX, y: mouseY});
    } else if (element) {
        setSelectedElementId(element.id);
        setIsDragging(true);
        setDragStart({ x: mouseX - element.x, y: mouseY - element.y });
    } else {
        setSelectedElementId(null);
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    if (isDrawing) {
        if(activeTool === 'pencil' && selectedElement?.type === 'path') {
            const newPoints = [...selectedElement.points!, {x: mouseX, y: mouseY}];
            const minX = Math.min(...newPoints.map(p => p.x));
            const minY = Math.min(...newPoints.map(p => p.y));
            const maxX = Math.max(...newPoints.map(p => p.x));
            const maxY = Math.max(...newPoints.map(p => p.y));
            updateSelectedElement({
                points: newPoints,
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            });
            return;
        } else if (activeTool === 'eraser') {
            const eraserSize = drawStrokeWidth;
            setElements(prev => prev.filter(el => {
                if (el.type !== 'path' || !el.points) return true;
                
                for(const point of el.points) {
                     const distance = Math.sqrt(Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2));
                     if (distance < eraserSize / 2 + (el.strokeWidth || 5) / 2) {
                        return false; // delete element
                     }
                }
                return true;
            }));
            return;
        }
    }

    if (!selectedElement) return;

    if (isResizing) {
        let { x, y, width, height } = selectedElement;
        const dx = mouseX - dragStart.x;
        const dy = mouseY - dragStart.y;
        
        const aspectRatio = selectedElement.type === 'image' ? selectedElement.width / selectedElement.height : 0;

        switch (isResizing) {
            case 'top-left':
                width -= dx;
                if (aspectRatio) height = width / aspectRatio; else height -= dy;
                x += dx;
                y += dy;
                break;
            case 'top-right':
                width += dx;
                if (aspectRatio) height = width / aspectRatio; else height -= dy;
                y += dy;
                break;
            case 'bottom-left':
                width -= dx;
                if (aspectRatio) height = width / aspectRatio; else height += dy;
                x += dx;
                break;
            case 'bottom-right':
                width += dx;
                if (aspectRatio) height = width / aspectRatio; else height += dy;
                break;
        }

        if (width > HANDLE_SIZE && height > HANDLE_SIZE) {
            updateSelectedElement({ x, y, width, height });
            setDragStart({ x: mouseX, y: mouseY });
        }
    } else if (isDragging) {
        updateSelectedElement({
            x: mouseX - dragStart.x,
            y: mouseY - dragStart.y
        });
    } else {
        const { handle } = getElementAt(e);
        if (handle) {
            canvas.style.cursor = 'nwse-resize'; // A generic resize cursor
        } else if (activeTool === 'pencil' || activeTool === 'eraser') {
            canvas.style.cursor = 'crosshair';
        } else {
            canvas.style.cursor = 'default';
        }
    }
  }

  const handleMouseUp = () => {
    if (isDrawing) {
        setIsDrawing(false);
        saveStateToHistory();
    }
    if (isDragging || isResizing) {
      saveStateToHistory();
    }
    setIsDragging(false);
    setIsResizing(null);
  }
  
  useEffect(() => {
    if (selectedElement?.type === 'text') {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
        const textMetrics = ctx.measureText(selectedElement.text!);
        
        updateSelectedElement({
            fontSize,
            fontFamily,
            textAlign,
            fontWeight,
            color: textColor,
            width: textMetrics.width,
            height: fontSize,
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSize, fontFamily, textAlign, fontWeight, textColor, selectedElement?.text, selectedElement?.id]);

  useEffect(() => {
    if (selectedElement?.type === 'shape') {
        updateSelectedElement({
            color: shapeColor,
            strokeColor: strokeColor,
            strokeWidth: strokeWidth,
        });
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeColor, strokeColor, strokeWidth, selectedElement?.id]);

  useEffect(() => {
    if(selectedElementId) updateSelectedElement({ opacity: elementOpacity })
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementOpacity, selectedElementId]);

  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedElementId) return;
    
    setElements(prev => {
        const newElements = [...prev];
        const index = newElements.findIndex(el => el.id === selectedElementId);
        if (index === -1) return newElements;

        if (direction === 'down' && index > 0 && newElements[index-1].type !== 'image') {
            [newElements[index], newElements[index-1]] = [newElements[index-1], newElements[index]];
        } else if (direction === 'up' && index < newElements.length - 1) {
            [newElements[index], newElements[index+1]] = [newElements[index+1], newElements[index]];
        }
        
        return newElements;
    });
    saveStateToHistory();
  }


  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader 
        isEditorPage={true} 
        onSave={handleSave} 
        onUndo={undo} 
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      <main className="flex-1 grid grid-cols-3 gap-0">
        <aside className="col-span-3 lg:col-span-1 border-r border-border flex flex-col p-4 space-y-2 overflow-y-auto">
             <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6']} className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="p-3 text-sm font-semibold">Canvas &amp; Shapes</AccordionTrigger>
                    <AccordionContent className="p-2 space-y-2">
                        <div className="space-y-2 p-2 rounded-lg bg-muted/50">
                            <Label className="text-xs">New Canvas</Label>
                            <div className="flex items-center gap-2">
                                <Button size="sm" className="w-full text-xs" variant="secondary" onClick={handleNewCanvas}>
                                    <RefreshCw className="mr-2 h-3 w-3" /> New
                                </Button>
                            </div>
                        </div>
                         <div className="space-y-2 p-2 rounded-lg bg-muted/50">
                            <Label className="text-xs">Shapes</Label>
                            <div className="flex justify-start gap-2">
                                <Button variant="outline" size="icon" onClick={() => addShape('square')} className="h-8 w-8"><Square className="h-4 w-4"/></Button>
                                <Button variant="outline" size="icon" onClick={() => addShape('circle')} className="h-8 w-8"><Circle className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="p-3 text-sm font-semibold">Text Tools</AccordionTrigger>
                    <AccordionContent className="p-2 space-y-2">
                        <div className="space-y-2 p-2 rounded-lg bg-muted/50">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="text-input" className="text-xs">Content</Label>
                                    <Input id="text-input" value={textInput} onChange={(e) => setTextInput(e.target.value)} maxLength={5} className="h-8 text-xs"/>
                                </div>
                                 <div className="space-y-1">
                                   <Label htmlFor="text-color" className="text-xs">Color</Label>
                                    <Input id="text-color" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} onBlur={saveStateToHistory} className="p-1 h-8 w-full cursor-pointer" />
                                </div>
                            </div>
                             <Button className="w-full h-8 text-xs" variant="outline" onClick={addText} disabled={!textInput}>
                                <Type className="mr-2 h-3 w-3" />
                                Add Text
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-6">
                    <AccordionTrigger className="p-3 text-sm font-semibold">Drawing Tools</AccordionTrigger>
                    <AccordionContent className="p-2 space-y-2">
                        <div className="space-y-2 p-2 rounded-lg bg-muted/50">
                             <div className="flex justify-start gap-2">
                                <Button variant={activeTool === 'pencil' ? 'secondary' : 'outline'} size="icon" onClick={() => setActiveTool(activeTool === 'pencil' ? 'select' : 'pencil')} className="h-8 w-8"><Pencil className="h-4 w-4"/></Button>
                                <Button variant={activeTool === 'eraser' ? 'secondary' : 'outline'} size="icon" onClick={() => setActiveTool(activeTool === 'eraser' ? 'select' : 'eraser')} className="h-8 w-8"><Eraser className="h-4 w-4"/></Button>
                            </div>
                             <div className="grid grid-cols-2 gap-2">
                                {activeTool === 'pencil' && (
                                    <div className="space-y-1">
                                        <Label htmlFor="draw-color" className="text-xs">Color</Label>
                                        <Input id="draw-color" type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="p-1 h-8 w-full cursor-pointer" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className="text-xs">{activeTool === 'eraser' ? 'Eraser' : 'Line'} Width: {drawStrokeWidth}px</Label>
                                <Slider value={[drawStrokeWidth]} onValueChange={(v) => setDrawStrokeWidth(v[0])} min={1} max={100} step={1}/>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                 {selectedElement?.type === 'shape' && (
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="p-3 text-sm font-semibold">Shape Properties</AccordionTrigger>
                        <AccordionContent className="p-2 space-y-2">
                             <div className="space-y-2 p-2 rounded-lg bg-muted/50">
                                 <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="shape-color" className="text-xs">Fill Color</Label>
                                        <Input id="shape-color" type="color" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)} onBlur={saveStateToHistory} className="p-1 h-8 w-full cursor-pointer" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="stroke-color" className="text-xs">Border Color</Label>
                                        <Input id="stroke-color" type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} onBlur={saveStateToHistory} className="p-1 h-8 w-full cursor-pointer" />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs">Border Width: {strokeWidth}px</Label>
                                    <Slider value={[strokeWidth]} onValueChange={(v) => setStrokeWidth(v[0])} onValueCommit={saveStateToHistory} min={0} max={50} step={1}/>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
                
                {selectedElement?.type === 'text' && (
                 <AccordionItem value="item-4">
                    <AccordionTrigger className="p-3 text-sm font-semibold">Typography</AccordionTrigger>
                    <AccordionContent className="p-2 space-y-2">
                        <div className="p-2 rounded-lg bg-muted/50 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                 <div>
                                    <Label className="text-xs">Font Family</Label>
                                    <Select value={fontFamily} onValueChange={(v) => {setFontFamily(v); saveStateToHistory()}}>
                                      <SelectTrigger className="h-8 text-xs">
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
                                <div className="space-y-1">
                                   <Label htmlFor="text-color-2" className="text-xs">Color</Label>
                                    <Input id="text-color-2" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} onBlur={saveStateToHistory} className="p-1 h-8 w-full cursor-pointer" />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs">Font Size: {fontSize}px</Label>
                                <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} onValueCommit={saveStateToHistory} min={16} max={512} step={2}/>
                            </div>
                            <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-1">
                                   <Label className="text-xs">Align</Label>
                                    <div className="flex gap-1">
                                        <Button variant={textAlign === 'left' ? 'secondary' : 'ghost'} size="icon" onClick={() => {setTextAlign('left'); saveStateToHistory();}} className="h-7 w-7"><AlignLeft className="h-4 w-4"/></Button>
                                        <Button variant={textAlign === 'center' ? 'secondary' : 'ghost'} size="icon" onClick={() => {setTextAlign('center'); saveStateToHistory();}} className="h-7 w-7"><AlignCenter className="h-4 w-4"/></Button>
                                        <Button variant={textAlign === 'right' ? 'secondary' : 'ghost'} size="icon" onClick={() => {setTextAlign('right'); saveStateToHistory();}} className="h-7 w-7"><AlignRight className="h-4 w-4"/></Button>
                                    </div>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                    <Switch id="font-weight" checked={fontWeight === 'bold'} onCheckedChange={(c) => {setFontWeight(c ? 'bold' : 'normal'); saveStateToHistory()}} />
                                    <Label htmlFor="font-weight" className="text-xs">Bold</Label>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                 </AccordionItem>
                )}

                {selectedElementId && (
                    <AccordionItem value="item-5">
                        <AccordionTrigger className="p-3 text-sm font-semibold">Element Properties</AccordionTrigger>
                        <AccordionContent className="p-2 space-y-2">
                            <div className="p-2 rounded-lg bg-muted/50 space-y-2">
                                 <div>
                                    <Label className="text-xs">Opacity: {Math.round(elementOpacity * 100)}%</Label>
                                    <Slider value={[elementOpacity]} onValueChange={(v) => setElementOpacity(v[0])} onValueCommit={saveStateToHistory} min={0} max={1} step={0.01}/>
                                </div>

                                 {selectedElement?.type !== 'image' && <div className="space-y-1">
                                    <Label className="text-xs">Layer</Label>
                                    <div className="flex gap-2">
                                        <Button className="w-full h-8 text-xs" variant="outline" onClick={() => moveLayer('down')}><ArrowDown className="mr-2 h-3 w-3"/> Backward</Button>
                                        <Button className="w-full h-8 text-xs" variant="outline" onClick={() => moveLayer('up')}><ArrowUp className="mr-2 h-3 w-3"/> Forward</Button>
                                    </div>
                                </div>}

                                <Button variant="destructive" size="sm" onClick={() => {deleteSelectedElement(); saveStateToHistory();}} className="w-full h-8 text-xs">
                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
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
                    cursor: isDragging || isResizing ? 'grabbing' : (activeTool === 'pencil' || activeTool === 'eraser' ? 'crosshair' : 'default'),
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
