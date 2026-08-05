from pathlib import Path

from PIL import Image
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/images/cat-wave-12-transparent.png"
OUTPUT = ROOT / "public/images/cat-wave-smooth-v5.png"

sheet = Image.open(SOURCE).convert("RGBA")
cell_w = sheet.width // 4
cell_h = 400

# The first generated row keeps the body on one baseline and contains the
# clean outward-to-upward arm arc. Intermediate drawings are softly blended
# as hand-painted in-betweens, producing a seven-drawing animation cycle.
keyframes = [
    sheet.crop((col * cell_w, 0, (col + 1) * cell_w, cell_h))
    for col in range(4)
]

def body_anchor(frame):
    alpha = np.asarray(frame.getchannel("A"))
    ys, xs = np.where((alpha > 80) & (np.indices(alpha.shape)[1] < cell_w * 0.66))
    return float(np.median(xs)), int(ys.max())

anchor_x, anchor_bottom = body_anchor(keyframes[0])
aligned = []
for frame in keyframes:
    frame_x, frame_bottom = body_anchor(frame)
    dx = round(anchor_x - frame_x)
    dy = anchor_bottom - frame_bottom
    canvas = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    canvas.alpha_composite(frame, (dx, dy))
    aligned.append(canvas)
keyframes = aligned

# Rebuild one fixed body. Pixels occupied in at least three drawings belong to
# the stationary torso; pixels that appear in only one or two drawings belong
# to the moving arm and are removed from the base.
arrays = np.stack([np.asarray(frame) for frame in keyframes])
base_array = np.asarray(keyframes[0]).copy()
zone = np.zeros((cell_h, cell_w), dtype=bool)
zone[:285, 286:] = True
visible_count = (arrays[..., 3] > 70).sum(axis=0)
median_rgb = np.median(arrays[..., :3], axis=0).astype(np.uint8)
median_alpha = np.median(arrays[..., 3], axis=0).astype(np.uint8)
keep = zone & (visible_count >= 3)
remove = zone & ~keep
base_array[keep, :3] = median_rgb[keep]
base_array[keep, 3] = median_alpha[keep]
base_array[remove] = 0
base = Image.fromarray(base_array, "RGBA")

arm_layers = []
for frame in keyframes:
    layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    source = np.asarray(frame).copy()
    source[~zone] = 0
    layer = Image.fromarray(source, "RGBA")
    arm_layers.append(layer)

frames = []
for arm in arm_layers:
    composed = base.copy()
    composed.alpha_composite(arm)
    frames.append(composed)

out = Image.new("RGBA", (cell_w * len(frames), cell_h), (0, 0, 0, 0))
for index, frame in enumerate(frames):
    out.alpha_composite(frame, (index * cell_w, 0))

out.save(OUTPUT)
print(OUTPUT)
