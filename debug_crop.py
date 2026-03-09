"""
디버그: 실제 장갑/무기 DDS 파일의 컬럼 구조를 분석합니다냥.
"""
import os, glob
import numpy as np
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
COORD_DIR = os.path.join(BASE_DIR, "public", "coordinate")

def analyze(fname, extract_count=1, gap_threshold=3):
    fpath = os.path.join(COORD_DIR, fname)
    img = Image.open(fpath).convert("RGBA")
    a = np.array(img)[:, :, 3]
    h, w = a.shape

    row_sums = a.sum(axis=1)
    y_start = 0
    while y_start < h and row_sums[y_start] == 0:
        y_start += 1
    y_end = h
    gs, gl = -1, 0
    for y in range(y_start, h):
        if row_sums[y] == 0:
            if gs < 0: gs = y
            gl += 1
            if gl >= gap_threshold: y_end = gs; break
        else:
            gs, gl = -1, 0

    band = a[y_start:y_end, :]
    col_sums = band.sum(axis=0)
    x_start = 0
    while x_start < w and col_sums[x_start] == 0:
        x_start += 1

    x_end = w
    blocks_found = 0
    last_nonzero = x_start
    gs, gl = -1, 0
    for x in range(x_start, w):
        if col_sums[x] == 0:
            if gs < 0: gs = x
            gl += 1
            if gl >= gap_threshold:
                blocks_found += 1
                x_end = gs
                if blocks_found >= extract_count: break
                gs, gl = -1, 0
        else:
            gs, gl = -1, 0
            last_nonzero = x

    # fallback only for gap>=3
    if blocks_found < extract_count and gap_threshold >= 3:
        x_end = last_nonzero + 1

    print(f"\n{fname}  (size={w}x{h}, ec={extract_count}, gap={gap_threshold})")
    print(f"  y_start={y_start}, y_end={y_end}, band_h={y_end-y_start}")
    print(f"  x_start={x_start}, x_end={x_end}, crop_w={x_end-x_start}")
    print(f"  blocks_found={blocks_found}, last_nonzero={last_nonzero}")

    # Show gap positions in the band
    gaps = []
    gs2, gl2 = -1, 0
    for x in range(x_start, w):
        if col_sums[x] == 0:
            if gs2 < 0: gs2 = x
            gl2 += 1
        else:
            if gs2 >= 0 and gl2 >= 1:
                gaps.append((gs2, gs2+gl2-1, gl2))
                gs2, gl2 = -1, 0
    if gs2 >= 0:
        gaps.append((gs2, gs2+gl2-1, gl2))

    print(f"  All gaps (start, end, len): {gaps[:15]}")

if __name__ == "__main__":
    # Gloves냥
    print("="*60)
    print("GLOVES")
    analyze("glove007_a1.hsc.dds", extract_count=2, gap_threshold=3)
    analyze("glove001_a1.hsc.dds", extract_count=2, gap_threshold=3)
    analyze("glove002_a1.hsc.dds", extract_count=2, gap_threshold=3)

    # Weapons냥
    print("\n" + "="*60)
    print("WEAPONS")
    analyze("weapon001_a1.hsc.dds", extract_count=2, gap_threshold=1)
    analyze("weapon002_a1.hsc.dds", extract_count=2, gap_threshold=1)
    analyze("weapon003_a1.hsc.dds", extract_count=2, gap_threshold=1)
