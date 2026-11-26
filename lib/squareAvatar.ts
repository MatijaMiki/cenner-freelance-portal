// Avatars are shown as squares. Some people upload a picture that is already cut into a circle
// (a PNG with transparent corners), which then shows as a circle inside a square. Before upload,
// such a picture is cropped to the largest square that fits inside the circle. Anything else is
// sent unchanged.

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });

export async function squareCircularAvatar(file: File): Promise<File> {
  if (!/^image\/(png|webp)$/.test(file.type)) return file; // only formats that can be transparent
  try {
    const img = await loadImage(file);
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) return file;

    const probe = document.createElement('canvas');
    probe.width = w; probe.height = h;
    const pctx = probe.getContext('2d');
    if (!pctx) return file;
    pctx.drawImage(img, 0, 0);
    const inset = Math.max(1, Math.round(Math.min(w, h) * 0.02));
    const corners = [[inset, inset], [w - 1 - inset, inset], [inset, h - 1 - inset], [w - 1 - inset, h - 1 - inset]];
    const cornersClear = corners.every(([x, y]) => pctx.getImageData(x, y, 1, 1).data[3] < 16);
    if (!cornersClear) return file;

    // Largest square inside the circle inscribed in the picture, centred.
    const side = Math.floor(Math.min(w, h) / Math.SQRT2);
    const sx = Math.round((w - side) / 2), sy = Math.round((h - side) / 2);
    const out = document.createElement('canvas');
    out.width = side; out.height = side;
    out.getContext('2d')!.drawImage(img, sx, sy, side, side, 0, 0, side, side);
    const blob = await new Promise<Blob | null>(r => out.toBlob(r, 'image/png'));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.png', { type: 'image/png' });
  } catch {
    return file;
  }
}
