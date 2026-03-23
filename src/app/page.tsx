"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Stamp types
type StampStyle = "circle" | "square" | "ellipse" | "star";

interface StampConfig {
  companyName: string;
  style: StampStyle;
  borderColor: string;
  textColor: string;
  size: number;
  borderWidth: number;
  subtitle: string;
}

interface StampPosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export default function Home() {
  const [config, setConfig] = useState<StampConfig>({
    companyName: "示例公司",
    style: "circle",
    borderColor: "#d32f2f",
    textColor: "#d32f2f",
    size: 150,
    borderWidth: 3,
    subtitle: "",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [stampPosition, setStampPosition] = useState<StampPosition>({
    x: 50,
    y: 50,
    scale: 1,
    rotation: 0,
    opacity: 1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<"generate" | "compose">("generate");

  const stampRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Draw stamp on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { size, borderColor, textColor, borderWidth, style, companyName, subtitle } = config;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - borderWidth - 5;

    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = borderColor;
    ctx.fillStyle = textColor;
    ctx.lineWidth = borderWidth;

    if (style === "circle") {
      // Outer circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - borderWidth - 3, 0, Math.PI * 2);
      ctx.stroke();

      // Star in center
      drawStar(ctx, centerX, centerY, 5, radius * 0.2, radius * 0.1);

      // Company name (arc text)
      drawArcText(ctx, companyName, centerX, centerY, radius - borderWidth - 15, textColor, "top");
      
      // Subtitle
      if (subtitle) {
        drawArcText(ctx, subtitle, centerX, centerY, radius * 0.4, textColor, "bottom");
      }
    } else if (style === "square") {
      const padding = borderWidth + 5;
      const squareSize = size - padding * 2;
      
      // Outer square
      ctx.strokeRect(padding, padding, squareSize, squareSize);
      
      // Inner square
      ctx.strokeRect(padding + borderWidth + 3, padding + borderWidth + 3, 
        squareSize - (borderWidth + 3) * 2, squareSize - (borderWidth + 3) * 2);

      // Company name
      ctx.font = `bold ${size / 10}px SimHei, Microsoft YaHei, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(companyName, centerX, centerY - 10);

      // Subtitle
      if (subtitle) {
        ctx.font = `${size / 14}px SimHei, Microsoft YaHei, sans-serif`;
        ctx.fillText(subtitle, centerX, centerY + 15);
      }
    } else if (style === "ellipse") {
      const rx = radius;
      const ry = radius * 0.6;

      // Outer ellipse
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ellipse
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rx - borderWidth - 3, ry - borderWidth - 3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Star
      drawStar(ctx, centerX, centerY, 5, rx * 0.2, rx * 0.1);

      // Company name
      ctx.font = `bold ${size / 10}px SimHei, Microsoft YaHei, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(companyName, centerX, centerY - ry * 0.3);

      // Subtitle
      if (subtitle) {
        ctx.font = `${size / 14}px SimHei, Microsoft YaHei, sans-serif`;
        ctx.fillText(subtitle, centerX, centerY + ry * 0.4);
      }
    } else if (style === "star") {
      // Star shape
      drawStar(ctx, centerX, centerY, 5, radius, radius * 0.4);

      // Inner star
      ctx.beginPath();
      drawStar(ctx, centerX, centerY, 5, radius - borderWidth - 5, (radius - borderWidth - 5) * 0.4);
      ctx.stroke();

      // Company name in center
      ctx.font = `bold ${size / 12}px SimHei, Microsoft YaHei, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(companyName, centerX, centerY);

      // Subtitle
      if (subtitle) {
        ctx.font = `${size / 16}px SimHei, Microsoft YaHei, sans-serif`;
        ctx.fillText(subtitle, centerX, centerY + size / 8);
      }
    }
  }, [config]);

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
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
    ctx.stroke();
  };

  const drawArcText = (ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, radius: number, color: string, position: "top" | "bottom") => {
    ctx.font = `bold ${config.size / 10}px SimHei, Microsoft YaHei, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textLength = text.length;
    const angleStep = (Math.PI / textLength) * 0.8;
    const startAngle = position === "top" ? Math.PI + (Math.PI - angleStep * textLength) / 2 : (Math.PI - angleStep * textLength) / 2;

    for (let i = 0; i < textLength; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    if (file.type === "application/pdf") {
      // Load PDF using pdf.js
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context!, viewport, canvas }).promise;
        pages.push(canvas.toDataURL("image/png"));
      }

      setPdfPages(pages);
      setPreviewUrl(pages[0]);
      setCurrentPage(0);
    } else if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPdfPages([]);
    }
  };

  // Download PNG
  const downloadPNG = async () => {
    if (!stampRef.current) return;
    
    const canvas = await html2canvas(stampRef.current, {
      backgroundColor: null,
      scale: 2,
    });
    
    const link = document.createElement("a");
    link.download = `${config.companyName}-印章.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Export PDF
  const exportPDF = async () => {
    if (!previewUrl) return;

    const pdf = new jsPDF({
      orientation: previewUrl ? "landscape" : "portrait",
      unit: "px",
    });

    if (pdfPages.length > 0) {
      // Multi-page PDF with stamp
      for (let i = 0; i < pdfPages.length; i++) {
        if (i > 0) pdf.addPage();

        const img = new Image();
        img.src = pdfPages[i];
        await new Promise((resolve) => (img.onload = resolve));

        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (img.height * imgWidth) / img.width;

        pdf.addImage(pdfPages[i], "PNG", 0, 0, imgWidth, imgHeight);

        // Add stamp to each page
        if (stampRef.current) {
          const stampCanvas = await html2canvas(stampRef.current, {
            backgroundColor: null,
            scale: 2,
          });
          const stampDataUrl = stampCanvas.toDataURL("image/png");
          
          const stampWidth = (config.size * stampPosition.scale * imgWidth) / 500;
          const stampHeight = stampWidth;
          const stampX = (stampPosition.x / 100) * imgWidth;
          const stampY = (stampPosition.y / 100) * imgHeight;

          pdf.addImage(stampDataUrl, "PNG", stampX, stampY, stampWidth, stampHeight);
        }
      }
    } else if (previewUrl) {
      // Single image with stamp
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (img.height * imgWidth) / img.width;

      pdf.addImage(previewUrl, "PNG", 0, 0, imgWidth, imgHeight);

      if (stampRef.current) {
        const stampCanvas = await html2canvas(stampRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const stampDataUrl = stampCanvas.toDataURL("image/png");
        
        const stampWidth = (config.size * stampPosition.scale * imgWidth) / 500;
        const stampHeight = stampWidth;
        const stampX = (stampPosition.x / 100) * imgWidth;
        const stampY = (stampPosition.y / 100) * imgHeight;

        pdf.addImage(stampDataUrl, "PNG", stampX, stampY, stampWidth, stampHeight);
      }
    }

    pdf.save(`${config.companyName}-文档.pdf`);
  };

  // Mouse handlers for drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setStampPosition((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">🏢 公司印章生成器</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Mode Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode("generate")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              mode === "generate"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            🎨 印章生成
          </button>
          <button
            onClick={() => setMode("compose")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              mode === "compose"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            📄 文档合成
          </button>
        </div>

        {mode === "generate" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Config Panel */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">⚙️ 印章配置</h2>
              
              <div className="space-y-4">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司名称
                  </label>
                  <input
                    type="text"
                    value={config.companyName}
                    onChange={(e) => setConfig({ ...config, companyName: e.target.value.slice(0, 20) })}
                    maxLength={20}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="输入公司名称"
                  />
                  <span className="text-xs text-gray-500">{config.companyName.length}/20</span>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    印章样式
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "circle", label: "圆形", icon: "⭕" },
                      { value: "square", label: "方形", icon: "⬜" },
                      { value: "ellipse", label: "椭圆", icon: "🥚" },
                      { value: "star", label: "五角星", icon: "⭐" },
                    ].map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setConfig({ ...config, style: style.value as StampStyle })}
                        className={`p-3 rounded-lg border-2 transition ${
                          config.style === style.value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{style.icon}</div>
                        <div className="text-xs">{style.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      边框颜色
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.borderColor}
                        onChange={(e) => setConfig({ ...config, borderColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.borderColor}
                        onChange={(e) => setConfig({ ...config, borderColor: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      文字颜色
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.textColor}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    印章大小: {config.size}px
                  </label>
                  <input
                    type="range"
                    min={80}
                    max={300}
                    value={config.size}
                    onChange={(e) => setConfig({ ...config, size: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Border Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    边框粗细: {config.borderWidth}px
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={config.borderWidth}
                    onChange={(e) => setConfig({ ...config, borderWidth: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    副标题/编号（可选）
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="如：合同专用章"
                  />
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadPNG}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  📥 下载 PNG 印章
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">👁️ 实时预览</h2>
              <div className="flex items-center justify-center min-h-[400px] bg-gray-100 rounded-lg">
                <div ref={stampRef} className="p-8">
                  <canvas ref={canvasRef} className="max-w-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">📤 上传文档</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📁</div>
                  <div className="text-gray-600">点击上传文件</div>
                  <div className="text-xs text-gray-400 mt-1">支持 PDF、JPG、PNG（最大10MB）</div>
                </label>
              </div>

              {uploadedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium truncate">{uploadedFile.name}</div>
                  <div className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              )}

              {/* Stamp Controls */}
              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-gray-700">🔧 印章调整</h3>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">大小: {Math.round(stampPosition.scale * 100)}%</label>
                  <input
                    type="range"
                    min={30}
                    max={200}
                    value={stampPosition.scale * 100}
                    onChange={(e) => setStampPosition({ ...stampPosition, scale: Number(e.target.value) / 100 })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">旋转: {stampPosition.rotation}°</label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={stampPosition.rotation}
                    onChange={(e) => setStampPosition({ ...stampPosition, rotation: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">透明度: {Math.round(stampPosition.opacity * 100)}%</label>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={stampPosition.opacity * 100}
                    onChange={(e) => setStampPosition({ ...stampPosition, opacity: Number(e.target.value) / 100 })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={exportPDF}
                disabled={!previewUrl}
                className="w-full mt-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                📥 导出 PDF
              </button>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">👁️ 文档预览</h2>
              
              {!previewUrl ? (
                <div className="flex items-center justify-center min-h-[500px] bg-gray-100 rounded-lg">
                  <div className="text-gray-400">请先上传文档</div>
                </div>
              ) : (
                <div 
                  ref={containerRef}
                  className="relative inline-block w-full min-h-[500px] bg-gray-100 rounded-lg overflow-hidden"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Document Image */}
                  <img 
                    src={previewUrl} 
                    alt="Document" 
                    className="max-w-full h-auto"
                    draggable={false}
                  />

                  {/* Draggable Stamp */}
                  <div
                    className="absolute cursor-move"
                    style={{
                      left: `${stampPosition.x}%`,
                      top: `${stampPosition.y}%`,
                      transform: `translate(-50%, -50%) scale(${stampPosition.scale}) rotate(${stampPosition.rotation}deg)`,
                      opacity: stampPosition.opacity,
                    }}
                  >
                    <div ref={stampRef}>
                      <canvas ref={(el) => {
                        if (el && canvasRef.current) {
                          const ctx = el.getContext("2d");
                          if (ctx) {
                            el.width = canvasRef.current.width;
                            el.height = canvasRef.current.height;
                            ctx.drawImage(canvasRef.current, 0, 0);
                          }
                        }
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* PDF Page Navigation */}
              {pdfPages.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="text-gray-600">
                    {currentPage + 1} / {pdfPages.length}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pdfPages.length - 1, p + 1))}
                    disabled={currentPage === pdfPages.length - 1}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
