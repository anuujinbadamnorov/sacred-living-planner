import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

export function useImageUpload(bucket = 'planner-images') {
  const { user } = useAuth();
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    url: null,
  });

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      if (!user) {
        setState((s) => ({ ...s, error: 'Sign in to upload images' }));
        return null;
      }

      // Validate
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setState((s) => ({ ...s, error: 'File too large (max 10MB)' }));
        return null;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setState((s) => ({ ...s, error: 'Only images and PDFs allowed' }));
        return null;
      }

      setState({ uploading: true, progress: 0, error: null, url: null });

      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        // If bucket doesn't exist, try to create it and retry
        if (error.message?.includes('bucket') || error.message?.includes('not found')) {
          try {
            await supabase.storage.createBucket(bucket, {
              public: true,
              fileSizeLimit: 10 * 1024 * 1024,
              allowedMimeTypes: allowedTypes,
            });
            // Retry upload
            const retry = await supabase.storage
              .from(bucket)
              .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
              });
            if (retry.error) throw retry.error;
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(retry.data?.path || path);
            setState({ uploading: false, progress: 100, error: null, url: urlData.publicUrl });
            return urlData.publicUrl;
          } catch (createErr: any) {
            setState({ uploading: false, progress: 0, error: createErr.message || 'Upload failed', url: null });
            return null;
          }
        }

        setState({ uploading: false, progress: 0, error: error.message, url: null });
        return null;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      setState({ uploading: false, progress: 100, error: null, url: urlData.publicUrl });
      return urlData.publicUrl;
    },
    [user, bucket]
  );

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null, url: null });
  }, []);

  return { ...state, upload, reset };
}
