'use client';
import { useRef, useState, useEffect, useCallback } from 'react';

interface Props {
  onChange: (data: string | null) => void;
  disabled?: boolean;
}

export default function SignatureCanvas({ onChange, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    if (disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }

  function stopDrawing() {
    if (!isDrawing) return;
    setIsDrawing(false);
    setIsEmpty(false);
    const canvas = canvasRef.current!;
    onChange(canvas.toDataURL('image/png'));
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  }

  return (
    <div>
      <div style={{
        border: '2px solid ' + (isEmpty ? '#e8e4dc' : '#1a1a1a'),
        background: '#fdfcfa',
        position: 'relative',
        transition: 'border-color 0.2s',
        cursor: disabled ? 'default' : 'crosshair',
      }}>
        <canvas
          ref={canvasRef}
          width={680}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ display: 'block', width: '100%', height: 180, touchAction: 'none' }}
        />
        {isEmpty && !disabled && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ccc', fontSize: 14, letterSpacing: 1,
            pointerEvents: 'none',
          }}>
            Нарисуйте подпись здесь
          </div>
        )}
      </div>
      {!isEmpty && !disabled && (
        <button
          onClick={clear}
          style={{
            marginTop: 10,
            background: 'none',
            border: '1px solid #e0ddd6',
            color: '#999',
            padding: '6px 16px',
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
          }}
        >
          Очистить
        </button>
      )}
    </div>
  );
}
