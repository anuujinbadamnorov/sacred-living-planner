'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileImage, Loader2, AlertCircle } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUpload: (url: string, fileName: string, fileType: string) => void;
  onClear?: () => void;
  existingUrl?: string | null;
  accept?: string;
  maxSize?: number;
  label?: string;
}

export default function ImageUpload({
  onUpload,
  onClear,
  existingUrl,
  accept = 'image/*,application/pdf',
  label = 'Upload file',
}: ImageUploadProps) {
  const { upload, uploading, progress, error, reset } = useImageUpload();
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    reset();
    const url = await upload(file);
    if (url) {
      setPreview(url);
      onUpload(url, file.name, file.type);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [upload, reset, onUpload]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleClear = () => {
    setPreview(null);
    reset();
    onClear?.();
  };

  const isImage = preview ? !preview.endsWith('.pdf') : false;

  if (preview) {
    return (
      <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
        {isImage ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="flex items-center gap-3 p-4" style={{ background: 'var(--cream-dark)' }}>
            <FileImage className="w-8 h-8" style={{ color: 'var(--terracotta)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>
                PDF Document
              </p>
              <p className="text-xs" style={{ color: 'var(--espresso-muted)' }}>{preview}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 p-6 text-center',
        dragOver ? 'border-terracotta bg-rose-50/30' : 'border-warm-200 hover:border-warm-300'
      )}
      style={{
        borderColor: dragOver ? 'var(--terracotta)' : 'var(--border-medium)',
        backgroundColor: dragOver ? 'rgba(196,112,75,0.06)' : 'var(--cream-dark)',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--terracotta)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--espresso-light)' }}>
            Uploading... {progress}%
          </p>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'var(--terracotta)' }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-6 h-6" style={{ color: 'var(--espresso-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--espresso-light)' }}>
            {label}
          </p>
          <p className="text-xs" style={{ color: 'var(--espresso-muted)' }}>
            Drag & drop or click to browse
          </p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--espresso-muted)' }}>
            Images, PDFs up to 10MB
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--color-error)' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
