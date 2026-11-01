import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhotoMemory } from '../types/birthday';
import {
  buildCanvasFilterString,
  computeCropTransformMetrics,
  getAspectRatioDimensions,
  PhotoAspectRatio,
  PhotoCornerStamp,
  PhotoCropShape,
  PhotoFitMode,
} from '../utils/birthdayLogic';
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Check,
  Sparkles,
  Crop,
  Move,
  Loader2,
  Grid,
  Maximize2,
  Minimize2,
  Crosshair,
  Eye,
  Compass,
  Award,
} from 'lucide-react';

export type PhotoFrameStyle = 'none' | 'sky-blue' | 'golden-bell' | 'polaroid';
type CropModalTab = 'crop' | 'adjust' | 'decorate';

interface PhotoCropEditorModalProps {
  memory: PhotoMemory;
  onClose: () => void;
  onSave: (
    memoryId: string,
    croppedDataUrl: string,
    updatedCaption: string
  ) => Promise<void> | void;
}

const VISUAL_PRESETS = [
  {
    id: 'original',
    label: 'Original',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
  },
  {
    id: 'sunny-sky',
    label: 'Sunny Sky 💙',
    brightness: 106,
    contrast: 108,
    saturation: 122,
    warmth: 0,
  },
  {
    id: 'golden-bell',
    label: 'Golden Bell ✨',
    brightness: 105,
    contrast: 105,
    saturation: 115,
    warmth: 18,
  },
  {
    id: 'dreamy-cloud',
    label: 'Dreamy Cloud ☁️',
    brightness: 112,
    contrast: 95,
    saturation: 92,
    warmth: -8,
  },
  {
    id: 'vivid-anime',
    label: 'Vivid Anime 🎨',
    brightness: 104,
    contrast: 116,
    saturation: 138,
    warmth: 6,
  },
] as const;

const ASPECT_RATIO_OPTIONS: Array<{
  id: PhotoAspectRatio;
  label: string;
  sub: string;
}> = [
  { id: 'original', label: 'Original', sub: 'Auto' },
  { id: 'free', label: 'Freeform', sub: 'Custom' },
  { id: '1:1', label: '1:1', sub: 'Square' },
  { id: '4:3', label: '4:3', sub: 'Album' },
  { id: '16:9', label: '16:9', sub: 'Wide' },
  { id: '3:4', label: '3:4', sub: 'Portrait' },
  { id: '9:16', label: '9:16', sub: 'Story' },
];

const CROP_SHAPE_OPTIONS: Array<{
  id: PhotoCropShape;
  label: string;
}> = [
  { id: 'rect', label: 'Rectangle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'circle', label: 'Circle ⭕' },
  { id: 'heart', label: 'Heart 💙' },
  { id: 'door-arch', label: 'Door Arch 🚪' },
];

const CORNER_STAMP_OPTIONS: Array<{
  id: PhotoCornerStamp;
  label: string;
  badgeText: string;
  bg: string;
  fg: string;
}> = [
  { id: 'none', label: 'No Stamp', badgeText: '', bg: '', fg: '' },
  {
    id: 'golden-bell',
    label: '🔔 Golden Bell',
    badgeText: '🔔 22nd Century Memory',
    bg: '#FFD84D',
    fg: '#183247',
  },
  {
    id: 'birthday-cake',
    label: '🎂 Birthday Star',
    badgeText: '🎂 Birthday Star ✨',
    bg: '#168DCE',
    fg: '#FFFFFF',
  },
  {
    id: 'anywhere-door',
    label: '🚪 Anywhere Door',
    badgeText: '🚪 Anywhere Door Moment',
    bg: '#FF7EB3',
    fg: '#FFFFFF',
  },
  {
    id: 'besties-heart',
    label: '💙 Besties',
    badgeText: '💙 Best Memories Forever',
    bg: '#F04444',
    fg: '#FFFFFF',
  },
];

/**
 * Traces a custom clip path (Rectangle, Rounded, Circle, Heart, or Anywhere Door Arch)
 * on the 2D canvas context.
 */
function traceCropShapePath(
  ctx: CanvasRenderingContext2D,
  shape: PhotoCropShape,
  w: number,
  h: number,
  inset = 0
): void {
  const x = inset;
  const y = inset;
  const cw = Math.max(10, w - inset * 2);
  const ch = Math.max(10, h - inset * 2);

  ctx.beginPath();

  if (shape === 'circle') {
    const r = Math.min(cw, ch) / 2;
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.closePath();
    return;
  }

  if (shape === 'rounded') {
    const r = Math.min(cw, ch) * 0.12;
    ctx.roundRect(x, y, cw, ch, r);
    ctx.closePath();
    return;
  }

  if (shape === 'door-arch') {
    const archRadius = cw / 2;
    const archCenterY = y + Math.min(archRadius, ch * 0.42);
    ctx.moveTo(x, y + ch);
    ctx.lineTo(x, archCenterY);
    ctx.ellipse(
      w / 2,
      archCenterY,
      cw / 2,
      archCenterY - y,
      0,
      Math.PI,
      0,
      false
    );
    ctx.lineTo(x + cw, y + ch);
    ctx.closePath();
    return;
  }

  if (shape === 'heart') {
    const cx = w / 2;
    const topY = y + ch * 0.24;
    const bottomY = y + ch * 0.92;
    ctx.moveTo(cx, bottomY);
    ctx.bezierCurveTo(
      cx - cw * 0.52,
      y + ch * 0.62,
      cx - cw * 0.5,
      y + ch * 0.06,
      cx,
      topY
    );
    ctx.bezierCurveTo(
      cx + cw * 0.5,
      y + ch * 0.06,
      cx + cw * 0.52,
      y + ch * 0.62,
      cx,
      bottomY
    );
    ctx.closePath();
    return;
  }

  // Default: 'rect'
  ctx.rect(x, y, cw, ch);
  ctx.closePath();
}

export const PhotoCropEditorModal: React.FC<PhotoCropEditorModalProps> = ({
  memory,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const [activeTab, setActiveTab] = useState<CropModalTab>('crop');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [sourceDims, setSourceDims] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  // Crop & Geometry State
  const [aspectRatio, setAspectRatio] = useState<PhotoAspectRatio>('original');
  const [freeWidthPct, setFreeWidthPct] = useState<number>(100);
  const [freeHeightPct, setFreeHeightPct] = useState<number>(100);
  const [fitMode, setFitMode] = useState<PhotoFitMode>('cover');
  const [cropShape, setCropShape] = useState<PhotoCropShape>('rect');
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0); // -100 to 100
  const [panY, setPanY] = useState<number>(0); // -100 to 100
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [straightenAngle, setStraightenAngle] = useState<number>(0); // -45 to +45
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [comparingOriginal, setComparingOriginal] = useState<boolean>(false);

  // Color & Filter State
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(0);
  const [activePresetId, setActivePresetId] = useState<string>('original');

  // Frame, Corner Stamp & Caption State
  const [frameStyle, setFrameStyle] = useState<PhotoFrameStyle>('none');
  const [cornerStamp, setCornerStamp] = useState<PhotoCornerStamp>('none');
  const [caption, setCaption] = useState<string>(memory.caption || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Drag-to-pan state on the canvas
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    startPanX: number;
    startPanY: number;
  }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Load source image into HTMLImageElement
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;
      setSourceDims({
        width: img.naturalWidth || img.width || 800,
        height: img.naturalHeight || img.height || 600,
      });
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageLoaded(false);
    };
    img.src = memory.imageUrl;
  }, [memory.imageUrl]);

  // Render cropped, rotated, straightened, shaped, filtered, and framed image to canvas
  const renderCanvas = useCallback(
    (includeInteractiveGuides = true) => {
      const canvas = canvasRef.current;
      const img = loadedImageRef.current;
      if (!canvas || !img || !imageLoaded) return;

      const { width: targetW, height: targetH } = getAspectRatioDimensions(
        aspectRatio,
        sourceDims,
        { widthPct: freeWidthPct, heightPct: freeHeightPct }
      );
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, targetW, targetH);

      const drawW = img.naturalWidth || img.width || 800;
      const drawH = img.naturalHeight || img.height || 600;

      // If comparing original, draw uncropped original image centered on sky canvas
      if (comparingOriginal && includeInteractiveGuides) {
        ctx.fillStyle = '#EAF7FF';
        ctx.fillRect(0, 0, targetW, targetH);
        const containScale = Math.min(targetW / drawW, targetH / drawH);
        ctx.save();
        ctx.translate(targetW / 2, targetH / 2);
        ctx.scale(containScale, containScale);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
        return;
      }

      // Base sky-blue canvas fill (visible around circle/heart/arch shapes)
      ctx.fillStyle = '#EAF7FF';
      ctx.fillRect(0, 0, targetW, targetH);

      ctx.save();

      // Apply shape mask clip if non-rectangle
      if (cropShape !== 'rect') {
        traceCropShapePath(ctx, cropShape, targetW, targetH, 10);
        ctx.clip();
      }

      // If 'contain-blur' fitMode is selected, draw a soft blurred ambient backdrop first so there are no blank bars
      if (fitMode === 'contain-blur') {
        const bgMetrics = computeCropTransformMetrics({
          targetWidth: targetW,
          targetHeight: targetH,
          sourceWidth: drawW,
          sourceHeight: drawH,
          rotation90: rotation,
          straightenAngle: 0,
          zoom: 1.15,
          panX: 0,
          panY: 0,
          fitMode: 'cover',
        });
        ctx.save();
        ctx.filter = buildCanvasFilterString({
          brightness: Math.max(75, brightness - 8),
          contrast,
          saturation: Math.min(180, saturation + 15),
          warmth,
          blurPx: 18,
        });
        ctx.translate(targetW / 2, targetH / 2);
        ctx.rotate(bgMetrics.totalRadians);
        ctx.scale(
          flipH ? -bgMetrics.totalScale : bgMetrics.totalScale,
          flipV ? -bgMetrics.totalScale : bgMetrics.totalScale
        );
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Subtle frosted veil over blurred backdrop
        ctx.fillStyle = 'rgba(234, 247, 255, 0.22)';
        ctx.fillRect(0, 0, targetW, targetH);
      } else {
        ctx.fillStyle = '#D8F0FF';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Main photo transform
      const { totalRadians, totalScale, offsetX, offsetY } =
        computeCropTransformMetrics({
          targetWidth: targetW,
          targetHeight: targetH,
          sourceWidth: drawW,
          sourceHeight: drawH,
          rotation90: rotation,
          straightenAngle,
          zoom,
          panX,
          panY,
          fitMode,
        });

      ctx.save();
      ctx.filter = buildCanvasFilterString({
        brightness,
        contrast,
        saturation,
        warmth,
      });

      ctx.translate(targetW / 2 + offsetX, targetH / 2 + offsetY);
      ctx.rotate(totalRadians);
      ctx.scale(
        flipH ? -totalScale : totalScale,
        flipV ? -totalScale : totalScale
      );
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Optional warm/cool tint overlay
      if (warmth !== 0) {
        ctx.save();
        ctx.fillStyle =
          warmth > 0
            ? `rgba(255, 216, 77, ${Math.min(0.22, Math.abs(warmth) / 140)})`
            : `rgba(100, 200, 255, ${Math.min(0.22, Math.abs(warmth) / 140)})`;
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.restore();
      }

      ctx.restore(); // End shape clip

      // Draw crisp border around shaped masks (circle, heart, door-arch, rounded)
      if (cropShape !== 'rect') {
        ctx.save();
        traceCropShapePath(ctx, cropShape, targetW, targetH, 10);
        ctx.strokeStyle =
          frameStyle === 'golden-bell' ? '#FFD84D' : '#64C8FF';
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.restore();
      }

      // Optional Decorative Doraemon Frame Overlay (for rectangle / rounded)
      if (frameStyle === 'sky-blue') {
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 22;
        ctx.strokeRect(11, 11, targetW - 22, targetH - 22);
        ctx.strokeStyle = '#64C8FF';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, targetW - 8, targetH - 8);
        ctx.restore();
      } else if (frameStyle === 'golden-bell') {
        ctx.save();
        ctx.strokeStyle = '#FFD84D';
        ctx.lineWidth = 18;
        ctx.strokeRect(9, 9, targetW - 18, targetH - 18);
        ctx.strokeStyle = '#F04444';
        ctx.lineWidth = 4;
        ctx.strokeRect(18, 18, targetW - 36, targetH - 36);
        ctx.restore();
      } else if (frameStyle === 'polaroid') {
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 28;
        ctx.strokeRect(14, 14, targetW - 28, targetH - 28);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, targetH - 60, targetW, 60);
        if (caption.trim()) {
          ctx.fillStyle = '#183247';
          ctx.font = 'bold 22px Fredoka, Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(caption.trim().slice(0, 44), targetW / 2, targetH - 22);
        }
        ctx.restore();
      }

      // Optional Corner Birthday Stamp Badge
      if (cornerStamp !== 'none') {
        const stampMeta = CORNER_STAMP_OPTIONS.find(
          (s) => s.id === cornerStamp
        );
        if (stampMeta && stampMeta.badgeText) {
          ctx.save();
          ctx.font = 'bold 18px Fredoka, Plus Jakarta Sans, sans-serif';
          const textMetrics = ctx.measureText(stampMeta.badgeText);
          const padX = 16;
          const badgeW = textMetrics.width + padX * 2;
          const badgeH = 36;
          const bx = targetW - badgeW - 24;
          const by =
            frameStyle === 'polaroid'
              ? targetH - badgeH - 72
              : targetH - badgeH - 24;

          ctx.fillStyle = stampMeta.bg;
          ctx.strokeStyle = '#183247';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(bx, by, badgeW, badgeH, 18);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = stampMeta.fg;
          ctx.textBaseline = 'middle';
          ctx.fillText(stampMeta.badgeText, bx + padX, by + badgeH / 2 + 1);
          ctx.restore();
        }
      }

      // Interactive Rule-of-Thirds & Corner Crop Guides (Strictly for live preview, omitted on final export)
      if (includeInteractiveGuides && (showGrid || isDragging)) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.5;

        // Rule of thirds lines
        ctx.beginPath();
        ctx.moveTo(targetW / 3, 0);
        ctx.lineTo(targetW / 3, targetH);
        ctx.moveTo((targetW * 2) / 3, 0);
        ctx.lineTo((targetW * 2) / 3, targetH);
        ctx.moveTo(0, targetH / 3);
        ctx.lineTo(targetW, targetH / 3);
        ctx.moveTo(0, (targetH * 2) / 3);
        ctx.lineTo(targetW, (targetH * 2) / 3);
        ctx.stroke();

        // Center crosshair
        ctx.strokeStyle = 'rgba(255, 216, 77, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(targetW / 2 - 14, targetH / 2);
        ctx.lineTo(targetW / 2 + 14, targetH / 2);
        ctx.moveTo(targetW / 2, targetH / 2 - 14);
        ctx.lineTo(targetW / 2, targetH / 2 + 14);
        ctx.stroke();

        // Corner L-brackets
        const cLen = 26;
        const pad = 6;
        ctx.strokeStyle = '#FFD84D';
        ctx.lineWidth = 5;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(pad, pad + cLen);
        ctx.lineTo(pad, pad);
        ctx.lineTo(pad + cLen, pad);
        // Top-right
        ctx.moveTo(targetW - pad - cLen, pad);
        ctx.lineTo(targetW - pad, pad);
        ctx.lineTo(targetW - pad, pad + cLen);
        // Bottom-left
        ctx.moveTo(pad, targetH - pad - cLen);
        ctx.lineTo(pad, targetH - pad);
        ctx.lineTo(pad + cLen, targetH - pad);
        // Bottom-right
        ctx.moveTo(targetW - pad - cLen, targetH - pad);
        ctx.lineTo(targetW - pad, targetH - pad);
        ctx.lineTo(targetW - pad, targetH - pad - cLen);
        ctx.stroke();

        ctx.restore();
      }
    },
    [
      aspectRatio,
      brightness,
      caption,
      comparingOriginal,
      contrast,
      cornerStamp,
      cropShape,
      fitMode,
      flipH,
      flipV,
      frameStyle,
      freeHeightPct,
      freeWidthPct,
      imageLoaded,
      isDragging,
      panX,
      panY,
      rotation,
      saturation,
      showGrid,
      sourceDims,
      straightenAngle,
      warmth,
      zoom,
    ]
  );

  useEffect(() => {
    renderCanvas(true);
  }, [renderCanvas]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const sensitivity = Math.max(0.25, 0.55 / Math.sqrt(zoom));
    const nextX = Math.max(
      -100,
      Math.min(100, Math.round(dragStartRef.current.startPanX + dx * sensitivity))
    );
    const nextY = Math.max(
      -100,
      Math.min(100, Math.round(dragStartRef.current.startPanY + dy * sensitivity))
    );
    setPanX(nextX);
    setPanY(nextY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) =>
      Math.max(0.6, Math.min(3.5, Math.round((prev + delta) * 100) / 100))
    );
  };

  const handleCenterSubject = () => {
    setPanX(0);
    setPanY(0);
    setStraightenAngle(0);
  };

  const handleResetAll = () => {
    setAspectRatio('original');
    setFreeWidthPct(100);
    setFreeHeightPct(100);
    setFitMode('cover');
    setCropShape('rect');
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setStraightenAngle(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
    setActivePresetId('original');
    setFrameStyle('none');
    setCornerStamp('none');
  };

  const handleApplyAndSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSaving(true);
    try {
      // Render clean output WITHOUT rule-of-thirds grid or corner bracket guides
      renderCanvas(false);
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      await onSave(
        memory.id,
        croppedDataUrl,
        caption.trim() || memory.caption
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const currentOutputDims = getAspectRatioDimensions(
    aspectRatio,
    sourceDims,
    { widthPct: freeWidthPct, heightPct: freeHeightPct }
  );

  return (
    <div
      className="fixed inset-0 z-[90] bg-[#183247]/80 flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit and crop photo: ${memory.caption}`}
    >
      <div className="bg-white rounded-[24px] sm:rounded-[28px] border-2 border-[#64C8FF] max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#EAF7FF] border-b border-[#64C8FF]/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-[#168DCE] text-white shrink-0">
              <Crop className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-lg text-[#183247] truncate">
                4D Pocket Photo Crop &amp; Frame Studio ✨
              </h3>
              <p className="text-[11px] text-[#183247]/70 truncate">
                Drag photo to frame · Scroll or pinch to zoom · Output:{' '}
                <span className="font-mono-num font-semibold text-[#168DCE]">
                  {currentOutputDims.width}×{currentOutputDims.height}px
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setComparingOriginal((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                comparingOriginal
                  ? 'bg-[#FFD84D] text-[#183247] border-[#183247]/40 font-bold'
                  : 'bg-white hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
              }`}
              title="Toggle Before / After comparison"
            >
              <Eye className="w-3.5 h-3.5 text-[#168DCE]" />
              <span className="hidden sm:inline">
                {comparingOriginal ? 'Viewing Original' : 'Compare Original'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close photo editor"
              className="p-2 rounded-xl bg-white hover:bg-[#F04444]/10 text-[#183247] hover:text-[#F04444] border border-[#64C8FF]/40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Interactive Crop Viewport + Right Tabbed Studio Controls */}
        <div className="p-3.5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Interactive Crop Canvas & Quick Geometry Bar (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative rounded-2xl bg-[#183247] border-2 border-[#64C8FF] p-2.5 sm:p-4 flex items-center justify-center min-h-[250px] sm:min-h-[360px] overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleCanvasWheel}
                onDoubleClick={handleCenterSubject}
                className={`max-w-full max-h-[280px] sm:max-h-[350px] rounded-lg shadow-xl touch-none transition-shadow ${
                  isDragging ? 'cursor-grabbing ring-2 ring-[#FFD84D]' : 'cursor-grab'
                }`}
              />

              {/* Top-left floating helper pill */}
              <div className="absolute top-3 left-3 max-w-[calc(100%-108px)] bg-[#183247]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none">
                <Move className="w-3 h-3 text-[#FFD84D] shrink-0" />
                <span className="truncate">
                  {comparingOriginal
                    ? 'Showing Uncropped Original'
                    : 'Drag to pan · Scroll to zoom · Double-click to center'}
                </span>
              </div>

              {/* Top-right Grid Toggle */}
              <button
                type="button"
                onClick={() => setShowGrid((g) => !g)}
                aria-label="Toggle Rule of Thirds Crop Grid"
                className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  showGrid
                    ? 'bg-[#FFD84D] text-[#183247] font-bold shadow-xs'
                    : 'bg-[#183247]/80 text-white/80 hover:text-white'
                }`}
              >
                <Grid className="w-3 h-3" />
                <span>Grid {showGrid ? 'On' : 'Off'}</span>
              </button>

              {/* Bottom-Center Zoom Bar Overlay (keeps corners clear for stamps) */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#183247]/90 text-white rounded-xl px-2.5 py-1 flex items-center gap-1.5 border border-white/15 shadow-md">
                <button
                  type="button"
                  onClick={() =>
                    setZoom((z) => Math.max(0.6, Math.round((z - 0.15) * 100) / 100))
                  }
                  aria-label="Zoom out photo"
                  className="p-1 hover:text-[#FFD84D] cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono-num font-bold min-w-[40px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setZoom((z) => Math.min(3.5, Math.round((z + 0.15) * 100) / 100))
                  }
                  aria-label="Zoom in photo"
                  className="p-1 hover:text-[#FFD84D] cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Geometry Action Bar: Rotate, Flip H/V, Center, Reset */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#EAF7FF]/75 p-2.5 rounded-xl border border-[#64C8FF]/45">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#64C8FF]/25 text-[#183247] border border-[#64C8FF]/50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Rotate 90° Counter-Clockwise"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#168DCE]" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#64C8FF]/25 text-[#183247] border border-[#64C8FF]/50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#168DCE]" />
                  <span>+90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH((f) => !f)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    flipH
                      ? 'bg-[#168DCE] text-white border-[#168DCE]'
                      : 'bg-white hover:bg-[#64C8FF]/25 text-[#183247] border-[#64C8FF]/50'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV((f) => !f)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    flipV
                      ? 'bg-[#168DCE] text-white border-[#168DCE]'
                      : 'bg-white hover:bg-[#64C8FF]/25 text-[#183247] border-[#64C8FF]/50'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
                <button
                  type="button"
                  onClick={handleCenterSubject}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#64C8FF]/25 text-[#183247] border border-[#64C8FF]/50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Re-center photo and level tilt"
                >
                  <Crosshair className="w-3.5 h-3.5 text-[#168DCE]" />
                  <span>Center</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F04444]/10 text-[#F04444] border border-[#F04444]/30 text-xs font-semibold cursor-pointer"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Right Column: Tabbed Studio Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 3-Tab Switcher for Crop / Adjust / Decorate */}
            <div
              className="grid grid-cols-3 gap-1 p-1 bg-[#EAF7FF] rounded-xl border border-[#64C8FF]/50"
              role="tablist"
              aria-label="Photo Editor Mode Tabs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'crop'}
                onClick={() => setActiveTab('crop')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'crop'
                    ? 'bg-[#168DCE] text-white shadow-xs'
                    : 'text-[#183247]/75 hover:text-[#183247]'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Crop &amp; Shape</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'adjust'}
                onClick={() => setActiveTab('adjust')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'adjust'
                    ? 'bg-[#168DCE] text-white shadow-xs'
                    : 'text-[#183247]/75 hover:text-[#183247]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Color &amp; Tilt</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'decorate'}
                onClick={() => setActiveTab('decorate')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'decorate'
                    ? 'bg-[#168DCE] text-white shadow-xs'
                    : 'text-[#183247]/75 hover:text-[#183247]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Frame &amp; Stamp</span>
              </button>
            </div>

            {/* TAB 1: CROP, ASPECT RATIO, FIT MODE & SHAPE MASK */}
            {activeTab === 'crop' && (
              <div className="space-y-4">
                {/* Fit Mode: Fill Crop vs Fit Whole Photo */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#183247] block">
                    1. Photo Framing Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFitMode('cover')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        fitMode === 'cover'
                          ? 'bg-[#168DCE] text-white border-[#168DCE] shadow-xs'
                          : 'bg-[#EAF7FF]/50 hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
                      }`}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Fill Crop Frame</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('contain-blur');
                        setZoom(1);
                        setPanX(0);
                        setPanY(0);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        fitMode === 'contain-blur'
                          ? 'bg-[#168DCE] text-white border-[#168DCE] shadow-xs'
                          : 'bg-[#EAF7FF]/50 hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
                      }`}
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Fit Full Photo (No Cut)</span>
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#183247] block">
                    2. Crop Aspect Ratio
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
                    {ASPECT_RATIO_OPTIONS.map((item) => {
                      const active = aspectRatio === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAspectRatio(item.id)}
                          className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? 'bg-[#168DCE] text-white border-[#168DCE] shadow-xs'
                              : 'bg-[#EAF7FF]/60 hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
                          }`}
                        >
                          <div className="text-xs font-bold leading-tight">
                            {item.label}
                          </div>
                          <div
                            className={`text-[10px] ${
                              active ? 'text-white/85' : 'text-[#183247]/60'
                            }`}
                          >
                            {item.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Freeform Custom Width / Height Sliders when 'free' is selected */}
                {aspectRatio === 'free' && (
                  <div className="p-3 rounded-2xl bg-[#EAF7FF]/70 border border-[#64C8FF] space-y-2">
                    <div className="text-xs font-bold text-[#168DCE]">
                      Custom Freeform Crop Box Size
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#183247] block">
                          Crop Width ({freeWidthPct}%)
                        </label>
                        <input
                          type="range"
                          min={35}
                          max={100}
                          step={5}
                          value={freeWidthPct}
                          aria-label="Freeform Crop Width"
                          onChange={(e) => setFreeWidthPct(Number(e.target.value))}
                          className="w-full accent-[#168DCE] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#183247] block">
                          Crop Height ({freeHeightPct}%)
                        </label>
                        <input
                          type="range"
                          min={35}
                          max={100}
                          step={5}
                          value={freeHeightPct}
                          aria-label="Freeform Crop Height"
                          onChange={(e) => setFreeHeightPct(Number(e.target.value))}
                          className="w-full accent-[#168DCE] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Crop Shape Mask Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#183247] block">
                    3. Crop Shape Mask
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {CROP_SHAPE_OPTIONS.map((shape) => {
                      const active = cropShape === shape.id;
                      return (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => {
                            setCropShape(shape.id);
                            if (shape.id === 'circle' || shape.id === 'heart') {
                              setAspectRatio('1:1');
                            }
                          }}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#FFD84D] text-[#183247] border-[#183247]/30 shadow-xs'
                              : 'bg-white hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
                          }`}
                        >
                          {shape.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zoom & Pan Fine-Tuning Sliders */}
                <div className="p-3.5 rounded-2xl bg-[#EAF7FF]/55 border border-[#64C8FF]/50 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#183247]">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5 text-[#168DCE]" />
                      <span>Zoom &amp; Position</span>
                    </span>
                    <span className="text-[#168DCE] font-mono-num">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.6}
                    max={3.5}
                    step={0.05}
                    value={zoom}
                    aria-label="Crop Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-[#168DCE] cursor-pointer"
                  />

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-[#183247]/75 block">
                        Horizontal Pan ({panX}%)
                      </label>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        step={2}
                        value={panX}
                        aria-label="Pan Horizontal"
                        onChange={(e) => setPanX(Number(e.target.value))}
                        className="w-full accent-[#168DCE] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#183247]/75 block">
                        Vertical Pan ({panY}%)
                      </label>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        step={2}
                        value={panY}
                        aria-label="Pan Vertical"
                        onChange={(e) => setPanY(Number(e.target.value))}
                        className="w-full accent-[#168DCE] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STRAIGHTEN TILT & COLOR FILTERS */}
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                {/* Fine Straighten / Tilt Angle Slider */}
                <div className="p-3.5 rounded-2xl bg-[#EAF7FF]/55 border border-[#64C8FF]/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#183247]">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#168DCE]" />
                      <span>Straighten / Tilt Angle</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#168DCE] font-mono-num">
                        {straightenAngle > 0
                          ? `+${straightenAngle}°`
                          : `${straightenAngle}°`}
                      </span>
                      {straightenAngle !== 0 && (
                        <button
                          type="button"
                          onClick={() => setStraightenAngle(0)}
                          className="text-[10px] font-bold text-[#F04444] hover:underline cursor-pointer"
                        >
                          Level 0°
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    step={1}
                    value={straightenAngle}
                    aria-label="Straighten Tilt Angle"
                    onChange={(e) => setStraightenAngle(Number(e.target.value))}
                    className="w-full accent-[#168DCE] cursor-pointer"
                  />
                </div>

                {/* One-Click Doraemon Color Presets */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#183247] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#168DCE]" />
                    <span>One-Click Doraemon Color Look</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {VISUAL_PRESETS.map((preset) => {
                      const active = activePresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setActivePresetId(preset.id);
                            setBrightness(preset.brightness);
                            setContrast(preset.contrast);
                            setSaturation(preset.saturation);
                            setWarmth(preset.warmth);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#FFD84D] text-[#183247] border-[#183247]/30 font-bold'
                              : 'bg-white hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fine-Tune Brightness / Contrast / Saturation / Warmth */}
                <div className="p-3.5 rounded-2xl bg-[#EAF7FF]/45 border border-[#64C8FF]/45 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#183247] block">
                        Brightness ({brightness}%)
                      </label>
                      <input
                        type="range"
                        min={65}
                        max={140}
                        value={brightness}
                        aria-label="Photo Brightness"
                        onChange={(e) => {
                          setBrightness(Number(e.target.value));
                          setActivePresetId('custom');
                        }}
                        className="w-full accent-[#168DCE] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#183247] block">
                        Contrast ({contrast}%)
                      </label>
                      <input
                        type="range"
                        min={65}
                        max={140}
                        value={contrast}
                        aria-label="Photo Contrast"
                        onChange={(e) => {
                          setContrast(Number(e.target.value));
                          setActivePresetId('custom');
                        }}
                        className="w-full accent-[#168DCE] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#183247] block">
                        Saturation ({saturation}%)
                      </label>
                      <input
                        type="range"
                        min={20}
                        max={170}
                        value={saturation}
                        aria-label="Photo Saturation"
                        onChange={(e) => {
                          setSaturation(Number(e.target.value));
                          setActivePresetId('custom');
                        }}
                        className="w-full accent-[#168DCE] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#183247] block">
                        Warmth ({warmth > 0 ? `+${warmth}` : warmth})
                      </label>
                      <input
                        type="range"
                        min={-25}
                        max={30}
                        value={warmth}
                        aria-label="Photo Warmth"
                        onChange={(e) => {
                          setWarmth(Number(e.target.value));
                          setActivePresetId('custom');
                        }}
                        className="w-full accent-[#168DCE] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DECORATIVE FRAME, CORNER BIRTHDAY STAMP & CAPTION */}
            {activeTab === 'decorate' && (
              <div className="space-y-4">
                {/* Decorative Frame Border */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#183247] block">
                    1. Decorative Photo Border
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'none', label: 'No Frame' },
                        { id: 'sky-blue', label: 'Sky Blue 💙' },
                        { id: 'golden-bell', label: 'Bell Gold 🔔' },
                        { id: 'polaroid', label: 'Polaroid 📸' },
                      ] as const
                    ).map((item) => {
                      const active = frameStyle === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFrameStyle(item.id)}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#168DCE] text-white border-[#168DCE]'
                              : 'bg-white hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Corner Birthday Stamp Badge */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#183247] block">
                    2. Corner Birthday Stamp Sticker
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {CORNER_STAMP_OPTIONS.map((stamp) => {
                      const active = cornerStamp === stamp.id;
                      return (
                        <button
                          key={stamp.id}
                          type="button"
                          onClick={() => setCornerStamp(stamp.id)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer truncate ${
                            active
                              ? 'bg-[#FFD84D] text-[#183247] border-[#183247]/35 shadow-xs'
                              : 'bg-white hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
                          }`}
                        >
                          {stamp.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Caption Input */}
                <div>
                  <label className="text-xs font-bold text-[#183247] block mb-1">
                    3. Photo Memory Caption
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Caption for this memory..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-xs font-semibold text-[#183247]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#EAF7FF]/70 border-t border-[#64C8FF]/45 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#183247]/70 hidden sm:block">
            Tip: Use <strong className="text-[#168DCE]">Fit Full Photo</strong> if you
            don&apos;t want any edges cropped out.
          </div>
          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[42px] rounded-xl bg-white hover:bg-[#EAF7FF] text-[#183247] border border-[#64C8FF]/50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleApplyAndSave}
              className="flex-1 sm:flex-initial px-5 py-2.5 min-h-[42px] rounded-xl bg-[#168DCE] hover:bg-[#1276AD] disabled:opacity-60 text-white font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Photo...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply Crop &amp; Save Photo ✨</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
