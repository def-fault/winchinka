import React, { useEffect, useRef, useState } from 'react';
import { GALLERY_ITEMS } from '../constants';
import { GalleryItem } from '../types';
import { ImageIcon, XIcon, HeartIcon } from './Icons';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const GalleryPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // ✅ Modal viewer controls
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState<'width' | 'contain'>('width');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleImageError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  // ✅ When modal opens: reset zoom/scroll, lock body scroll
  useEffect(() => {
    if (!selectedImage) return;

    setZoom(1);
    setFitMode('width');

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedImage]);

  const closeModal = () => setSelectedImage(null);

  const zoomIn = () => setZoom(z => clamp(z * 1.15, 0.5, 5));
  const zoomOut = () => setZoom(z => clamp(z / 1.15, 0.5, 5));
  const zoomReset = () => setZoom(1);

  // Ctrl/Command + wheel(or trackpad pinch) to zoom
  const handleWheelZoom = (e: React.WheelEvent) => {
    // Chrome/Edge: trackpad pinch usually sets ctrlKey=true
    if (!e.ctrlKey && !e.metaKey) return;

    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    const factor = dir > 0 ? 1.12 : 0.89;
    setZoom(z => clamp(z * factor, 0.5, 5));
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-2xl animate-fade-in-up border border-white/10">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close"
              title="Close"
            >
              <XIcon className="w-6 h-6" />
            </button>

            {/* Viewer controls */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="px-3 py-2 text-sm bg-black/50 text-white rounded-lg hover:bg-white/20 transition-colors"
                title="Zoom out"
              >
                −
              </button>
              <button
                onClick={zoomIn}
                className="px-3 py-2 text-sm bg-black/50 text-white rounded-lg hover:bg-white/20 transition-colors"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={zoomReset}
                className="px-3 py-2 text-sm bg-black/50 text-white rounded-lg hover:bg-white/20 transition-colors"
                title="Reset"
              >
                100%
              </button>
              <button
                onClick={() => setFitMode(m => (m === 'width' ? 'contain' : 'width'))}
                className="px-3 py-2 text-sm bg-black/50 text-white rounded-lg hover:bg-white/20 transition-colors"
                title="Toggle fit mode"
              >
                {fitMode === 'width' ? '가로맞춤' : '전체맞춤'}
              </button>

              <div className="hidden md:block text-xs text-gray-300/80 ml-2">
                Ctrl/핀치 줌 · 스크롤로 읽기
              </div>
            </div>

            {/* ✅ Scrollable viewer */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-auto bg-black"
              onWheel={handleWheelZoom}
            >
              {!imgErrors[selectedImage.id] ? (
                <div className="min-h-full w-full flex justify-center">
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.title}
                    onError={() => handleImageError(selectedImage.id)}
                    onClick={() => setZoom(z => (z === 1 ? 1.5 : 1))}
                    className={
                      fitMode === 'width'
                        ? 'block w-full h-auto select-none cursor-zoom-in'
                        : 'block max-w-full max-h-[80vh] object-contain select-none cursor-zoom-in mx-auto my-6'
                    }
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center top',
                    }}
                  />
                </div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 py-20">
                  <ImageIcon className="w-16 h-16 mb-2" />
                  <span>이미지를 찾을 수 없습니다</span>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-800 text-white">
              <h3 className="text-2xl font-display font-bold mb-2">{selectedImage.title}</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-game-primary font-bold mb-1">By {selectedImage.author}</p>
                  <p className="text-gray-400 text-sm">{selectedImage.description}</p>
                </div>
                <div className="text-xs text-gray-500">{selectedImage.date}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 neon-text">
          GALLERY
        </h1>
        <p className="text-gray-400 text-lg">
          유저들이 직접 그린 팬아트와 축전을 전시하는 공간입니다.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-3 rounded-xl group cursor-pointer hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] border border-white/5"
            onClick={() => setSelectedImage(item)}
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 mb-4">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                <span className="text-white font-bold flex items-center gap-1">
                  <HeartIcon className="w-4 h-4 text-pink-500" />
                  View Details
                </span>
              </div>

              {!imgErrors[item.id] ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={() => handleImageError(item.id)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-xs">upload {item.imageUrl.replace('./', '')}</span>
                </div>
              )}
            </div>

            <div className="px-2 pb-2">
              <h3 className="font-bold text-white truncate">{item.title}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-game-primary truncate">@{item.author}</span>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Call to Action */}
      <div className="mt-16 text-center p-8 rounded-2xl border border-dashed border-gray-600 bg-white/5">
        <p className="text-gray-300 mb-2">여러분의 작품을 기다립니다!</p>
        <p className="text-sm text-gray-500">
          팬아트나 축전을 보내주시면 갤러리에 등록해드립니다.<br />
          보내실 곳: 윈친카 카페 '팬아트 게시판'
        </p>
      </div>
    </div>
  );
};

export default GalleryPage;
