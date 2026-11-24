// Preset Avatars (SVG data URIs or clean SVG avatars)
export const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    label: 'สาวหวานชุดไทย',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NongPloy&backgroundColor=ffd5dc',
  },
  {
    id: 'avatar-2',
    label: 'หนุ่มละมุนใจดี',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=WinKawin&backgroundColor=d1e7dd',
  },
  {
    id: 'avatar-3',
    label: 'แมวส้มลอยกระทง',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SomCat&backgroundColor=ffecb5',
  },
  {
    id: 'avatar-4',
    label: 'สายมูทรงพลัง',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MooPower&backgroundColor=e2d9f3',
  },
  {
    id: 'avatar-5',
    label: 'คิวท์บอยขี้เล่น',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PlayBoy&backgroundColor=cff4fc',
  },
  {
    id: 'avatar-6',
    label: 'ดวงจันทร์ยิ้ม',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FullMoon&backgroundColor=fff3cd',
  },
];

// Helper to resize and compress user uploaded file into lightweight Base64 string (max 200x200px)
export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 220;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.8 quality (~10-25KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
