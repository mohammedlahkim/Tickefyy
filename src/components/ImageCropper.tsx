import React, { useState, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    x: 10,
    y: 10,
    height: 80
  });
  
  const imgRef = useRef<HTMLImageElement>(null);
  
  const getCroppedImg = () => {
    if (!imgRef.current) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = crop.width!;
    canvas.height = crop.height!;
    
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return;
    }
    
    ctx.drawImage(
      imgRef.current,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width!,
      crop.height!
    );
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.95);
    onCropComplete(base64Image);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg p-4 md:p-6 max-w-sm w-full">
        <h3 className="text-lg md:text-xl font-bold text-white mb-4">Crop Profile Picture</h3>
        
        <div className="mb-4 overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            circularCrop
            aspect={1}
          >
            <img 
              ref={imgRef}
              src={image} 
              alt="Crop preview" 
              className="max-w-full h-auto"
            />
          </ReactCrop>
        </div>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button 
            onClick={getCroppedImg}
            className="px-4 py-2 bg-lime-500 text-black rounded-md hover:bg-lime-600 transition"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper; 