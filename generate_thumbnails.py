"""
generate_thumbnails.py
좌표 폴더의 모든 DDS/PNG 파일을 80x80 PNG 썸네일로 미리 구워놓는 스크립트냥.
한 번만 실행하면 브라우저에서 즉시 로딩이 가능해집니다냥!
"""
import os
import glob
import json
import numpy as np
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

def get_prefix(filename):
    for p in EXTRACT_COUNTS:
        if filename.startswith(p):
            return p
    return filename.split("0")[0].split("_")[0]

def extract_frame(img, extract_count=1, gap_threshold=3):
    """Direct port of coordinator.py extract_first_frame냥."""
    img = img.convert("RGBA")
    a = np.array(img)[:, :, 3]
    h, w = a.shape

    row_sums = a.sum(axis=1)
    # y_start: skip leading zero rows냥
    y_start = 0
    while y_start < h and row_sums[y_start] == 0:
        y_start += 1

    # y_end: first run of >=gap_threshold zero rows after y_start냥
    y_end = h
    gs, gl = -1, 0
    for y in range(y_start, h):
        if row_sums[y] == 0:
            if gs < 0: gs = y
            gl += 1
            if gl >= gap_threshold:
                y_end = gs
                break
        else:
            gs, gl = -1, 0

    band = a[y_start:y_end, :]
    col_sums = band.sum(axis=0)

    x_start = 0
    while x_start < w and col_sums[x_start] == 0:
        x_start += 1

    x_end = w
    blocks_found = 0
    gs, gl = -1, 0
    for x in range(x_start, w):
        if col_sums[x] == 0:
            if gs < 0: gs = x
            gl += 1
            if gl >= gap_threshold:
                blocks_found += 1
                x_end = gs
                if blocks_found >= extract_count:
                    break
                gs, gl = -1, 0
        else:
            gs, gl = -1, 0

    if x_start >= x_end or y_start >= y_end:
        return None
    return img.crop((x_start, y_start, x_end, y_end))

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
        return True  # already cached냥

    prefix = get_prefix(fname)
    ec    = EXTRACT_COUNTS.get(prefix, 1)
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
