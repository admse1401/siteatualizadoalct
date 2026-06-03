import { useRef, useState } from 'react';

export function useSignature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSig, setHasSig] = useState(false);
  const isDrawing = useRef(false);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - r.left) * sx, y: (clientY - r.top) * sy };
  };

  const startDrawing = (e: any) => {
    isDrawing.current = true;
    const p = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(p.x, p.y);
  };

  const draw = (e: any) => {
    if (!isDrawing.current) return;
    const p = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0B1D55';
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      setHasSig(true);
    }
  };

  const stopDrawing = () => { isDrawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  return { canvasRef, hasSig, startDrawing, draw, stopDrawing, clear };
}