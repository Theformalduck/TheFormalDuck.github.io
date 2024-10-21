import React, { useRef, useEffect, useCallback } from 'react';
import { Position, Square, User } from '../types';

interface GridProps {
  zoom: number;
  position: Position;
  onPan: (dx: number, dy: number) => void;
  squares: Record<string, Square>;
  onPurchaseSquare: (x: number, y: number, owner: string) => void;
  onCustomizeSquare: (x: number, y: number, content: Partial<Square['content']>) => void;
  selectedSquare: Position | null;
  setSelectedSquare: (square: Position | null) => void;
  currentUser: User | null;
  searchResults: Square[];
}

export const Grid: React.FC<GridProps> = ({
  zoom,
  position,
  onPan,
  squares,
  onPurchaseSquare,
  onCustomizeSquare,
  selectedSquare,
  setSelectedSquare,
  currentUser,
  searchResults
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Calculate grid properties
    const gridSize = 100 * zoom;
    const offsetX = position.x * zoom;
    const offsetY = position.y * zoom;

    // Draw grid lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    for (let x = offsetX % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = offsetY % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw squares
    Object.entries(squares).forEach(([key, square]) => {
      const [x, y] = key.split(',').map(Number);
      const squareX = x * gridSize + offsetX;
      const squareY = y * gridSize + offsetY;

      // Draw square background
      ctx.fillStyle = square.content.backgroundColor || '#f0f0f0';
      ctx.fillRect(squareX, squareY, gridSize, gridSize);

      // Draw square border
      ctx.strokeStyle = '#000';
      ctx.strokeRect(squareX, squareY, gridSize, gridSize);

      // Draw square content (text, image, etc.)
      if (square.content.text) {
        ctx.fillStyle = '#000';
        const fontSize = parseInt(square.content.fontSize || '16');
        let scaledFontSize = Math.max(1, Math.min(fontSize * zoom, gridSize / 5));
        ctx.font = `${square.content.fontWeight || 'normal'} ${scaledFontSize}px ${square.content.fontFamily || 'Arial'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Adjust font size to fit text within square
        const maxWidth = gridSize - 10;
        const maxHeight = gridSize - 10;
        let textFits = false;
        while (!textFits && scaledFontSize > 1) {
          ctx.font = `${square.content.fontWeight || 'normal'} ${scaledFontSize}px ${square.content.fontFamily || 'Arial'}`;
          const textMetrics = ctx.measureText(square.content.text);
          const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
          if (textMetrics.width <= maxWidth && textHeight <= maxHeight) {
            textFits = true;
          } else {
            scaledFontSize--;
          }
        }

        wrapText(ctx, square.content.text, squareX + gridSize / 2, squareY + gridSize / 2, maxWidth, scaledFontSize * 1.2);
      }

      if (square.content.image) {
        const img = new Image();
        img.src = square.content.image;
        img.onload = () => {
          ctx.drawImage(img, squareX, squareY, gridSize, gridSize);
        };
      }

      // Draw owner name
      if (square.owner) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = `${Math.max(1, Math.min(12 * zoom, gridSize / 10))}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(square.owner, squareX + 5, squareY + 5);
      }

      // Draw link icon if present
      if (square.content.link) {
        ctx.fillStyle = '#0000FF';
        ctx.font = `${Math.max(1, Math.min(14 * zoom, gridSize / 7))}px Arial`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('🔗', squareX + gridSize - 5, squareY + gridSize - 5);
      }
    });

    // Highlight search results
    searchResults.forEach(square => {
      const [x, y] = square.id.split(',').map(Number);
      const squareX = x * gridSize + offsetX;
      const squareY = y * gridSize + offsetY;

      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(squareX, squareY, gridSize, gridSize);
    });

    // Draw selected square highlight
    if (selectedSquare) {
      const selectedX = selectedSquare.x * gridSize + offsetX;
      const selectedY = selectedSquare.y * gridSize + offsetY;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.strokeRect(selectedX, selectedY, gridSize, gridSize);
    }
  }, [zoom, position, squares, selectedSquare, searchResults]);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let lineCount = 0;

    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        lineCount++;
      } else {
        line = testLine;
      }

      if (lineCount >= 3) {
        if (n < words.length - 1) {
          ctx.fillText(line.trim() + '...', x, y);
        } else {
          ctx.fillText(line.trim(), x, y);
        }
        break;
      }
    }

    if (lineCount < 3) {
      ctx.fillText(line.trim(), x, y);
    }
  };

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;

    const dx = e.clientX - lastPosition.current.x;
    const dy = e.clientY - lastPosition.current.y;

    onPan(dx / zoom, dy / zoom);

    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - position.x * zoom) / (zoom * 100));
    const y = Math.floor((e.clientY - rect.top - position.y * zoom) / (zoom * 100));
    
    if (!isDragging.current) {
      handleSquareClick(x, y);
    }
    
    setSelectedSquare({ x, y });
  };

  const handleSquareClick = (x: number, y: number) => {
    const squareKey = `${x},${y}`;
    const square = squares[squareKey];
    if (square && square.content.link) {
      window.open(square.content.link, '_blank');
    }
  };

  return (
    <div className="relative flex-1">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => isDragging.current = false}
      />
    </div>
  );
};