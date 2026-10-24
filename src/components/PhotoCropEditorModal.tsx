import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhotoMemory } from '../types/birthday';
import {
  buildCanvasFilterString,
  getAspectRatioDimensions,
   PhotoAspectRatio,
} from '../utils/birthdayLogic';
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  Check,
  Sparkles,
  Crop,
  Move,
  Loader2,
} from 'lucide-react';

export type PhotoFrameStyle = 'none' | 'sky-blue' | 'golden-bell' | 'polaroid';

interface PhotoCropEditorModalProps {
  memory: PhotoMemory;
  onClose: () => void;
  onSave: (memoryId: string, croppedDataUrl: string, updatedCaption: string) => Promise<void> | void;
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

export const PhotoCropEditorModal: React.FC<PhotoCropEditorModalProps> = ({
  memory,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<PhotoAspectRatio>('16:9');
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0); // -100 to 100
  const [panY, setPanY] = useState<number>(0); // -100 to 100
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);

  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(0);
  const [activePresetId, setActivePresetId] = useState<string>('original');
  const [frameStyle, setFrameStyle] = useState<PhotoFrameStyle>('none');
  const [caption, setCaption] = useState<string>(memory.caption || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Drag-to-pan state on the canvas
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
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
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageLoaded(false);
    };
    img.src = memory.imageUrl;
  }, [memory.imageUrl]);

  // Render cropped, rotated, filtered, and framed image to canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const { width: targetW, height: targetH } =
      getAspectRatioDimensions(aspectRatio);
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, targetW, targetH);

    // Fill sky-blue backdrop
    ctx.fillStyle = '#EAF7FF';
    ctx.fillRect(0, 0, targetW, targetH);

    ctx.save();

    // Apply CSS filter string for brightness, contrast, saturation, sepia/warmth
    ctx.filter = buildCanvasFilterString({
      brightness,
      contrast,
      saturation,
      warmth,
    });

    // Move origin to center of canvas
    ctx.translate(targetW / 2, targetH / 2);

    // Determine effective image dimensions considering 90/270 deg rotation
    const isRotated90 = Math.abs(rotation % 180) === 90;
    const srcW = isRotated90 ? img.naturalHeight || img.height || 800 : img.naturalWidth || img.width || 800;
    const srcH = isRotated90 ? img.naturalWidth || img.width || 600 : img.naturalHeight || img.height || 600;

    // Calculate cover scale so zoom=1 fills the canvas without blank bars
    const coverScale = Math.max(targetW / srcW, targetH / srcH);
    const totalScale = coverScale * zoom;

    const scaledW = srcW * totalScale;
    const scaledH = srcH * totalScale;

    // Maximum pan range in pixels so image stays covering or smoothly movable
    const maxOffsetX = Math.max(80, (scaledW - targetW) / 2 + targetW * 0.25);
    const maxOffsetY = Math.max(80, (scaledH - targetH) / 2 + targetH * 0.25);

    const offsetX = (panX / 100) * maxOffsetX;
    const offsetY = (panY / 100) * maxOffsetY;

    ctx.translate(offsetX, offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -totalScale : totalScale, totalScale);

    const drawW = img.naturalWidth || img.width || 800;
    const drawH = img.naturalHeight || img.height || 600;
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

    // Optional Decorative Doraemon Frame Overlay
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
      ctx.fillRect(0, targetH - 54, targetW, 54);
      if (caption.trim()) {
        ctx.fillStyle = '#183247';
        ctx.font = 'bold 20px Fredoka, Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(caption.trim().slice(0, 42), targetW / 2, targetH - 20);
      }
      ctx.restore();
    }
  }, [
    aspectRatio,
    brightness,
    caption,
    contrast,
    flipH,
    frameStyle,
    imageLoaded,
    panX,
    panY,
    rotation,
    saturation,
    warmth,
    zoom,
  ]);

  useEffect(() => {
    renderCanvas();
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
    const nextX = Math.max(-100, Math.min(100, Math.round(dragStartRef.current.startPanX + dx * 0.45)));
    const nextY = Math.max(-100, Math.min(100, Math.round(dragStartRef.current.startPanY + dy * 0.45)));
    setPanX(nextX);
    setPanY(nextY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetAll = () => {
    setAspectRatio('16:9');
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setFlipH(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
    setActivePresetId('original');
    setFrameStyle('none');
  };

  const handleApplyAndSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSaving(true);
    try {
      renderCanvas();
      const croppedDataUrl = canvas.toDataURL('image/png', 0.92);
      await onSave(memory.id, croppedDataUrl, caption.trim() || memory.caption);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#183247]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit and crop photo: ${memory.caption}`}
    >
      <div className="bg-white rounded-[28px] border-2 border-[#64C8FF] max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#EAF7FF] border-b border-[#64C8FF]/50 px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#168DCE] text-white">
              <Crop className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-[#183247]">
                Edit &amp; Crop Photo Studio ✨
              </h3>
              <p className="text-[11px] text-[#183247]/70">
                Crop aspect ratio, drag to reposition, zoom, rotate, or add a Doraemon visual filter.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo editor"
            className="p-2 rounded-xl bg-white hover:bg-[#F04444]/10 text-[#183247] hover:text-[#F04444] border border-[#64C8FF]/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Live Canvas Preview + Right Controls */}
        <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Crop Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative rounded-2xl bg-[#183247]/95 border-2 border-[#64C8FF] p-3 flex items-center justify-center min-h-[280px] sm:min-h-[340px] overflow-hidden">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`max-w-full max-h-[330px] rounded-xl shadow-lg touch-none ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              />
              <div className="absolute bottom-3 left-3 bg-[#183247]/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none">
                <Move className="w-3 h-3 text-[#FFD84D]" />
                <span>Drag photo to reposition crop</span>
              </div>
            </div>

            {/* Quick Rotate / Flip / Reset Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#EAF7FF]/70 p-2.5 rounded-xl border border-[#64C8FF]/40">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#64C8FF]/25 text-[#183247] border border-[#64C8FF]/50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#168DCE]" />
                  <span>Rotate -90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#64C8FF]/25 text-[#183247] border border-[#64C8FF]/50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#168DCE]" />
                  <span>Rotate +90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH((f) => !f)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    flipH
                      ? 'bg-[#168DCE] text-white border-[#168DCE]'
                      : 'bg-white hover:bg-[#64C8FF]/25 text-[#183247] border-[#64C8FF]/50'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Mirror</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetAll}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F04444]/10 text-[#F04444] border border-[#F04444]/30 text-xs font-semibold cursor-pointer"
              >
                Reset Original
              </button>
            </div>
          </div>

          {/* Right Column: Crop Aspect Ratio, Zoom, Visual Filters & Frame (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#183247] block">
                1. Crop Aspect Ratio
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['16:9', '4:3', '1:1', '3:4'] as PhotoAspectRatio[]).map(
                  (ratio) => {
                    const active = aspectRatio === ratio;
                    return (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#168DCE] text-white border-[#168DCE] shadow-xs'
                            : 'bg-[#EAF7FF]/60 hover:bg-[#EAF7FF] text-[#183247] border-[#64C8FF]/50'
                        }`}
                      >
                        {ratio}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 2. Zoom & Pan Sliders */}
            <div className="p-3.5 rounded-2xl bg-[#EAF7FF]/55 border border-[#64C8FF]/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#183247]">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-[#168DCE]" />
                  <span>Zoom &amp; Crop Framing</span>
                </span>
                <span className="text-[#168DCE]">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                aria-label="Crop Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#168DCE] cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-[#183247]/75 block">
                    Pan Left / Right ({panX}%)
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
                    Pan Up / Down ({panY}%)
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

            {/* 3. One-Click Visual Filter Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#183247] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#168DCE]" />
                <span>2. Doraemon Visual Look</span>
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

            {/* 4. Fine-Tune Brightness / Contrast / Saturation */}
            <div className="p-3.5 rounded-2xl bg-[#EAF7FF]/45 border border-[#64C8FF]/45 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#183247] block">
                    Bright ({brightness}%)
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
                    Color ({saturation}%)
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
              </div>
            </div>

            {/* 5. Decorative Frame Border */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#183247] block">
                3. Decorative Photo Border
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
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
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

            {/* Caption Input */}
            <div>
              <label className="text-xs font-bold text-[#183247] block mb-1">
                Photo Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption for this memory..."
                className="w-full px-3 py-2 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-xs font-semibold text-[#183247]"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#EAF7FF]/70 border-t border-[#64C8FF]/45 px-5 py-3.5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF7FF] text-[#183247] border border-[#64C8FF]/50 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleApplyAndSave}
            className="px-5 py-2.5 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] disabled:opacity-60 text-white font-display font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Cropped Photo...</span>
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
  );
};
