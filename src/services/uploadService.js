import multer from 'multer';
import { supabase } from '../config/supabase.js';

// Use memory storage to handle files as buffers
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/**
 * Uploads a file buffer to Supabase Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Folder path (e.g., 'branding' or 'docs')
 * @param {string} filename - Desired filename
 * @param {string} mimetype - File mimetype
 * @returns {string} - Public URL of the uploaded file
 */
export const uploadToSupabase = async (buffer, folder, filename, mimetype) => {
  const path = `${folder}/${Date.now()}_${filename.replace(/\s+/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from('firmedge')
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('firmedge')
    .getPublicUrl(path);

  return publicUrl;
};
