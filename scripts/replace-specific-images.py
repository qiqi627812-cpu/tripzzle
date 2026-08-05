import shutil
import os
from PIL import Image

src_dir = '/Users/tang/Desktop/untitled folder'
dst_dir = '/Users/tang/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/work-mode-projects/6a47323e5925b695a3aa23d9/public/images/real'

mapping = [
    ('1870794dc0edb7.jpg_600x600x70_e6f3a662.jpg', 'cq-a4.jpg'),
    ('36ab400d4dbdae9cc80a2cb308521e19.jpg_600x600x70_cb207cd4.jpg', 'cd-a3.jpg'),
    ('CggYr1b5-cWAG-cYAD9huP_1GWc004_D_10000_1200.jpg', 'cd-a7.jpg'),
    ('DCE12BE340EFAD4023FAC6653EE3165611E9.jpg', 'cd-a1.jpg'),
    ('OIP-C.MYP61WpSrtBSKZyonhH-fQHaE8.webp', 'bj-a18.jpg'),
    ('OIP-C.Yb2r0CZEwyR34_N4O13D1QHaEK.webp', 'cq-a3.jpg'),
    ('R-C.3576b09183db70377d7133019f264a84.jpeg', 'sh-a5.jpg'),
    ('R-C.b625e4df9dd53378b5817ed2e0da33a9.png', 'cq-a8.jpg'),
    ('R-C.c83ea4374d7d2587759d79fa56342d60.jpeg', 'cd-a8.jpg'),
    ('b908bdfa2b12b1b5.jpg', 'cq-a5.jpg'),
    ('f9f1-izmihnt8415219.jpg', 'bj-a12.jpg'),
    ('t018409c793207fcd0d.png', 'cq-a7.jpg'),
]

count = 0
for src_name, dst_name in mapping:
    src_path = os.path.join(src_dir, src_name)
    dst_path = os.path.join(dst_dir, dst_name)

    if not os.path.exists(src_path):
        print(f'MISSING: {src_name}')
        continue

    try:
        img = Image.open(src_path)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.save(dst_path, 'JPEG', quality=90)
        print(f'OK: {src_name} -> {dst_name}')
        count += 1
    except Exception as e:
        print(f'FAIL: {src_name} -> {dst_name}: {e}')
        try:
            shutil.copy2(src_path, dst_path)
            print(f'  fallback: copied as-is')
        except Exception as e2:
            print(f'  fallback failed: {e2}')

print(f'\nTotal: {count} images replaced')
