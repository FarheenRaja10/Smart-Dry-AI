import React, { useState, useCallback } from 'react';
import { Icon } from './Icon';

interface ImageUploadProps {
  onSubmit: (base64Image: string) => void;
  onBack: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onSubmit, onBack }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (preview) {
      onSubmit(preview);
    }
  };

  return (
    <div className="p-6 text-center">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-500 hover:text-[#50C1AE] transition-colors">
            <Icon name="back" />
        </button>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Upload an Image</h2>
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#7FE5D2] transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {preview ? (
            <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-md" />
          ) : (
            <div className="flex flex-col items-center text-gray-500">
                <Icon name="upload" />
              <p className="mt-2 text-sm">Drag & drop or click to upload</p>
            </div>
          )}
        </label>
      </div>
      {preview && (
        <button
          onClick={handleSubmit}
          className="w-full mt-6 bg-[#7FE5D2] text-black font-bold py-3 px-4 rounded-lg hover:bg-[#65D1BC] transition-colors flex items-center justify-center"
        >
          <Icon name="sparkles" />
          <span className="ml-2">Analyze Garment</span>
        </button>
      )}
    </div>
  );
};

export default ImageUpload;