'use client';

import React, { useRef, useEffect, useState } from 'react';

export type StampStyle = 'circle' | 'square' | 'ellipse' | 'star';

export interface StampConfig {
  companyName: string;
  style: StampStyle;
  borderColor: string;
  textColor: string;
  size: number;
  borderWidth: number;
  subtitle?: string;
}

interface StampCanvasProps {
  config: StampConfig;
  scale?: number;
}

export function StampCanvas({ config, scale = 1 }: StampCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { companyName, style, borderColor, textColor, size, borderWidth, subtitle } = config;
    const scaledSize = size * scale;
    const centerX = scaledSize / 2;
    const centerY = scaledSize / 2;
    const radius = (scaledSize - borderWidth * 2) / 2;

    // Set canvas size
    canvas.width = scaledSize;
    canvas.height = scaledSize;

    // Clear canvas
    ctx.clearRect(0, 0, scaledSize, scaledSize);

    // Draw stamp based on style
    ctx.strokeStyle = borderColor;
    ctx.fillStyle = borderColor;
    ctx.lineWidth = borderWidth * scale;

    switch (style) {
      case 'circle':
        // Outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        // Inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'square':
        const squarePadding = borderWidth + 2;
        const squareSize = scaledSize - squarePadding * 2;
        const squareLeft = squarePadding;
        const squareTop = squarePadding;
        
        // Outer square
        ctx.strokeRect(squareLeft, squareTop, squareSize, squareSize);
        // Inner square
        ctx.strokeRect(
          squareLeft + squareSize * 0.08,
          squareTop + squareSize * 0.08,
          squareSize * 0.84,
          squareSize * 0.84
        );
        break;

      case 'ellipse':
        const ellipseRadiusX = radius;
        const ellipseRadiusY = radius * 0.6;
        
        // Outer ellipse
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, ellipseRadiusX, ellipseRadiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Inner ellipse
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, ellipseRadiusX * 0.85, ellipseRadiusY * 0.85, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'star':
        drawStar(ctx, centerX, centerY, 5, radius * 0.9, radius * 0.4);
        ctx.stroke();
        // Inner star
        drawStar(ctx, centerX, centerY, 5, radius * 0.6, radius * 0.25);
        ctx.stroke();
        break;
    }

    // Draw company name (arc text)
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.max(12, scaledSize * 0.12)}px "Microsoft YaHei", SimHei, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textRadius = radius * 0.55;
    drawArcText(ctx, companyName, centerX, centerY, textRadius, style === 'ellipse' ? -Math.PI * 0.15 : 0);

    // Draw subtitle if exists
    if (subtitle) {
      ctx.font = `bold ${Math.max(8, scaledSize * 0.07)}px "Microsoft YaHei", SimHei, sans-serif`;
      const subtitleY = centerY + radius * 0.25;
      ctx.fillText(subtitle, centerX, subtitleY);
    }

  }, [config, scale]);

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{ width: config.size * scale, height: config.size * scale }}
    />
  );
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function drawArcText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, radius: number, offsetAngle: number = 0) {
  const angle = (Math.PI * 2) / text.length;
  const startAngle = -Math.PI / 2 + offsetAngle;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const currentAngle = startAngle - angle * i;
    const x = cx + Math.cos(currentAngle) * radius;
    const y = cy + Math.sin(currentAngle) * radius;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(currentAngle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
}

export default StampCanvas;
