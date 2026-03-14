"""
generate_thumbnails.py
좌표 폴더의 모든 DDS/PNG 파일을 80x80 PNG 썸네일로 미리 구워놓는 스크립트냥.
한 번만 실행하면 브라우저에서 즉시 로딩이 가능해집니다냥!
"""
import os
import glob
import json
import numpy as np
import scipy.ndimage as ndimage
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
COORD_DIR  = os.path.join(BASE_DIR, "public", "coordinate")
THUMB_DIR  = os.path.join(BASE_DIR, "public", "coordinate-thumbs")
THUMB_SIZE = 80

os.makedirs(THUMB_DIR, exist_ok=True)

# extract_count per prefix냥
EXTRACT_COUNTS = {
    "glove":  2,
    "weapon": 2,
}
# gap threshold (px) per prefix냥
GAP_THRESHOLDS = {
    "weapon": 1,
}

# Specific filename overrides냥
FILE_EXTRACT_OVERRIDES = {
    "cloak004": 2,
    "cloak005": 2,
    "cloak006": 2,
    "cloak008": 2,
    "cloak009": 2,
    "cloak012": 2,
}

def get_prefix(filename):
    for p in EXTRACT_COUNTS:
        if filename.startswith(p):
            return p
    return filename.split("0")[0].split("_")[0]

def extract_frame(img, extract_count=1, gap_threshold=3):
    """Hybrid extract matching coordinator TypeScript 2D blob BFS냥."""
    img = img.convert("RGBA")
    a = np.array(img)[:, :, 3]
    h, w = a.shape

    row_sums = a.sum(axis=1)
    # y_start: skip leading zero rows냥
    y_start = 0
    while y_start < h and row_sums[y_start] == 0:
        y_start += 1

    # y_end: first run of >=3 zero rows after y_start냥 (hardcoded 3 in TS)
    y_end = h
    gs, gl = -1, 0
    for y in range(y_start, h):
        if row_sums[y] == 0:
            if gs < 0: gs = y
            gl += 1
            if gl >= 3:
                y_end = gs
                break
        else:
            gs, gl = -1, 0

    band = a[y_start:y_end, :]
    
    # 4-connected components to match TS BFS냥
    structure = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]])
    labeled, num_features = ndimage.label(band > 0, structure=structure)
    
    MIN_BLOB_PX = 4
    blobs = []
    
    objs = ndimage.find_objects(labeled)
    for i, obj in enumerate(objs):
        if obj is None: continue
        
        count = np.sum(labeled == (i + 1))
        if count >= MIN_BLOB_PX:
            min_y = obj[0].start + y_start
            max_y = obj[0].stop - 1 + y_start
            min_x = obj[1].start
            max_x = obj[1].stop - 1
            blobs.append({"minX": min_x, "maxX": max_x, "minY": min_y, "maxY": max_y})
            
    if not blobs:
        return None
        
    blobs.sort(key=lambda b: b["minX"])
    
    # TS groups blobs by extractCount. For the thumbnail we want the first animation frame (1 group)냥
    group = blobs[:extract_count]
    
    x_start = min(b["minX"] for b in group)
    x_end = max(b["maxX"] for b in group) + 1
    y_start_frame = min(b["minY"] for b in group)
    y_end_frame = max(b["maxY"] for b in group) + 1
    
    return img.crop((x_start, y_start_frame, x_end, y_end_frame))

def make_thumb(cropped):
    """Center-fit cropped image into THUMB_SIZE x THUMB_SIZE냥."""
    s = THUMB_SIZE
    bg = Image.new("RGBA", (s, s), (26, 39, 68, 255))  # #1a2744냥
    cw, ch = cropped.size
    scale = min(1.0, s / max(cw, ch, 1))
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    dx, dy = (s - nw) // 2, (s - nh) // 2
    bg.paste(resized, (dx, dy), resized)
    return bg

def process_file(fpath):
    fname = os.path.basename(fpath)
    out_path = os.path.join(THUMB_DIR, fname + ".thumb.png")
    if os.path.exists(out_path):
        pass # force overwrite since algorithm changed냥

    prefix = get_prefix(fname)
    
    # Priority: File override > Prefix default > 1
    file_base = fname.split(".")[0].split("_")[0]
    ec = FILE_EXTRACT_OVERRIDES.get(file_base, EXTRACT_COUNTS.get(prefix, 1))
    
    gap   = GAP_THRESHOLDS.get(prefix, 3)

    try:
        img = Image.open(fpath)
        img.load()

        if fname.endswith(".png") and not any(fname.startswith(p) for p in ["hair", "helm", "face", "eye"]):
            # bg / etc — just resize냥
            thumb = img.convert("RGBA").resize((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
        else:
            cropped = extract_frame(img, ec, gap)
            if not cropped:
                return False
            thumb = make_thumb(cropped)

        thumb.save(out_path, "PNG", optimize=True)
        return True
    except Exception as e:
        print(f"  ERROR {fname}: {e}")
        return False

if __name__ == "__main__":
    all_files = sorted(glob.glob(os.path.join(COORD_DIR, "*.dds")) +
                       glob.glob(os.path.join(COORD_DIR, "*.png")))
    print(f"Found {len(all_files)} files in {COORD_DIR}")
    ok, fail = 0, 0
    for i, fpath in enumerate(all_files):
        fname = os.path.basename(fpath)
        success = process_file(fpath)
        if success:
            ok += 1
            print(f"  [{i+1}/{len(all_files)}] OK   {fname}")
        else:
            fail += 1
            print(f"  [{i+1}/{len(all_files)}] FAIL {fname}")

    print(f"\nDone! {ok} OK, {fail} failed냥.")
    print(f"Thumbnails saved to: {THUMB_DIR}")
