from PIL import Image
import numpy as np
import os

src = r"C:\Users\91880\.cursor\projects\e-VedaAI\assets\c__Users_91880_AppData_Roaming_Cursor_User_workspaceStorage_7258b1c83ba92bc59f4ab2c164a21433_images_image-bb0c3619-ed9c-4e0f-bef6-fd94601d91d9.png"
# NOTE: if path has changed, keep original.
if not os.path.exists(src):
    # fallback: original relative name
    src = r"C:\Users\91880\.cursor\projects\e-VedaAI\assets\c__Users_91880_AppData_Roaming_Cursor_User_workspaceStorage_7258b1c83ba92bc59f4ab2c164a21433_images_image-bb0c3619-ed9c-4e0f-bef6-fd94601d91d9.png"

img = Image.open(src).convert('RGB')
a = np.array(img).astype(np.float32)

h, w = a.shape[:2]
# Focus on center region to ignore sidebar
x0 = int(w*0.35)
x1 = int(w*0.95)
region = a[:, x0:x1, :]

sat = region.max(axis=2) - region.min(axis=2)
mask = sat > 40

# Focus vertical area around illustration
y0 = int(h*0.15)
y1 = int(h*0.75)
mask2 = mask[y0:y1, :]
ys, xs = np.where(mask2)
if len(xs)==0:
    left, right, top, bottom = x0, x1, y0, y1
else:
    left = x0 + xs.min()
    right = x0 + xs.max()
    top = y0 + ys.min()
    bottom = y0 + ys.max()

pad = 25
left = max(0, left-pad)
top = max(0, top-pad)
right = min(w, right+pad)
bottom = min(h, bottom+pad)

crop = img.crop((left, top, right, bottom))

out_dir = r"e:\VedaAI\frontend\public\images"
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'empty-illustration-crop.png')

crop.save(out_path)
print('saved', out_path, 'size', crop.size, 'from', (left, top, right, bottom), 'orig', (w, h))
