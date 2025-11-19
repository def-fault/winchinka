
import React, { useState } from 'react';
import { GALLERY_ITEMS } from '../constants';
import { GalleryItem } from '../types';
import { ImageIcon, XIcon, HeartIcon } from './Icons';

const GalleryPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          />
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-2xl animate-fade-in-up border border-white/10">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
            
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-black">
              {!imgErrors[selectedImage.id] ? (
                 <img 
                   src={selectedImage.imageUrl} 
                   alt={selectedImage.title} 
                   className="max-w-full max-h-[80vh] object-contain"
                   onError={() => handleImageError(selectedImage.id)}
                 />
              ) : (
                 <div className="text-gray-500 flex flex-col items-center">
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
          팬아트나 축전을 보내주시면 갤러리에 등록해드립니다.<br/>
          보내실 곳: 윈친카 카페 '팬아트 게시판'
        </p>
      </div>
    </div>
  );
};

export default GalleryPage;
