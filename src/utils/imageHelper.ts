/**
 * src/utils/imageHelper.ts
 * Tiện ích tạo URL ảnh Cloudinary đồng bộ từ source web Frontend_WebMyPham
 */

const CLOUDINARY_CLOUD_NAME = 'hb22fnuq';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'limit';
  quality?: 'auto' | 'auto:eco' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
}

export function getImageUrl(relativePath?: string, options: ImageTransformOptions = {}): string {
  if (!relativePath) {
    return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80';
  }

  // Nếu đã là link online http/https thì giữ nguyên
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  const {
    width = 300,
    height = 300,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  const transforms: string[] = [];
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);

  const transformStr = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

  return `${CLOUDINARY_BASE_URL}${transformStr}${cleanPath}`;
}
