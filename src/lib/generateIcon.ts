/**
 * Generate a simple NostrEats icon using canvas
 * This creates a circular icon with fork/knife and lightning bolt
 */
export function generateIcon(size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Background circle
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Set up for drawing utensils
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size / 20;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const centerX = size / 2;
  const centerY = size / 2;
  const utensilHeight = size * 0.5;
  const spacing = size * 0.15;

  // Fork (left)
  const forkX = centerX - spacing;
  const forkTop = centerY - utensilHeight / 2;
  const forkBottom = centerY + utensilHeight / 2;

  // Fork handle
  ctx.beginPath();
  ctx.moveTo(forkX, forkTop);
  ctx.lineTo(forkX, forkBottom);
  ctx.stroke();

  // Fork prongs
  ctx.beginPath();
  ctx.moveTo(forkX - size * 0.08, forkTop);
  ctx.lineTo(forkX - size * 0.08, forkTop + size * 0.12);
  ctx.moveTo(forkX, forkTop);
  ctx.lineTo(forkX, forkTop + size * 0.15);
  ctx.moveTo(forkX + size * 0.08, forkTop);
  ctx.lineTo(forkX + size * 0.08, forkTop + size * 0.12);
  ctx.stroke();

  // Knife (right)
  const knifeX = centerX + spacing;
  const knifeTop = centerY - utensilHeight / 2;
  const knifeBottom = centerY + utensilHeight / 2;

  // Knife handle
  ctx.beginPath();
  ctx.moveTo(knifeX, knifeTop);
  ctx.lineTo(knifeX, knifeBottom);
  ctx.stroke();

  // Knife blade
  ctx.beginPath();
  ctx.moveTo(knifeX, knifeTop);
  ctx.lineTo(knifeX - size * 0.06, knifeTop + size * 0.08);
  ctx.lineTo(knifeX, knifeTop + size * 0.12);
  ctx.stroke();

  // Lightning bolt (bottom center)
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = size / 40;

  const boltX = centerX;
  const boltY = centerY + utensilHeight / 2 + size * 0.12;
  const boltSize = size * 0.12;

  ctx.beginPath();
  ctx.moveTo(boltX, boltY);
  ctx.lineTo(boltX - boltSize * 0.4, boltY + boltSize * 0.6);
  ctx.lineTo(boltX, boltY + boltSize * 0.5);
  ctx.lineTo(boltX - boltSize * 0.2, boltY + boltSize);
  ctx.lineTo(boltX + boltSize * 0.3, boltY + boltSize * 0.4);
  ctx.lineTo(boltX, boltY + boltSize * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

/**
 * Download icon as PNG file
 */
export function downloadIcon(size: number, filename: string) {
  const dataUrl = generateIcon(size);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Generate all required icons for PWA
 */
export function generateAllIcons() {
  downloadIcon(192, 'icon-192.png');
  setTimeout(() => downloadIcon(512, 'icon-512.png'), 100);
  setTimeout(() => downloadIcon(180, 'apple-touch-icon.png'), 200);
  setTimeout(() => downloadIcon(32, 'favicon-32x32.png'), 300);
  setTimeout(() => downloadIcon(16, 'favicon-16x16.png'), 400);
}
