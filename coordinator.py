import os
import glob
import numpy as np
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
import tkinter.filedialog as filedialog
from tkinter import messagebox
import threading
import queue

# 파일 경로 스캔
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(BASE_DIR, ".cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# 파일명 정의 (확장자는 실제 존재하는 dds 로 수정)
BODY_FILES = glob.glob(os.path.join(BASE_DIR, "body*.dds"))
BODY_FILES.sort()
BODY = os.path.basename(BODY_FILES[0]) if BODY_FILES else "body001_a1.hsc.dds"

BG_FILES = glob.glob(os.path.join(BASE_DIR, "bg*.png"))
BG_FILES.sort()
BG = os.path.basename(BG_FILES[0]) if BG_FILES else "bg001.png"

HAIR_FILES = glob.glob(os.path.join(BASE_DIR, "hair*.dds"))
HAIR_FILES.sort()
HAIR = os.path.basename(HAIR_FILES[0]) if HAIR_FILES else "hair001_a1.hsc.dds"

HELM_FILES = glob.glob(os.path.join(BASE_DIR, "helm*.dds"))
HELM_FILES.sort()
HELM = os.path.basename(HELM_FILES[0]) if HELM_FILES else "helm001_a1.hsc.dds"

SHIRT_FILES = glob.glob(os.path.join(BASE_DIR, "shirt*.dds"))
SHIRT_FILES.sort()
SHIRT = os.path.basename(SHIRT_FILES[0]) if SHIRT_FILES else "shirt001_a1.hsc.dds"

PANT_FILES = glob.glob(os.path.join(BASE_DIR, "pant*.dds"))
PANT_FILES.sort()
PANTS = os.path.basename(PANT_FILES[0]) if PANT_FILES else "pant001_a1.hsc.dds"

SHOE_FILES = glob.glob(os.path.join(BASE_DIR, "shoe*.dds"))
SHOE_FILES.sort()
SHOE = os.path.basename(SHOE_FILES[0]) if SHOE_FILES else "shoe001_a1.hsc.dds"

GLOVE_FILES = glob.glob(os.path.join(BASE_DIR, "glove*.dds"))
GLOVE_FILES.sort()
GLOVE = os.path.basename(GLOVE_FILES[0]) if GLOVE_FILES else "glove001_a1.hsc.dds"

WEAPON_FILES = glob.glob(os.path.join(BASE_DIR, "weapon*.dds"))
WEAPON_FILES.sort()
WEAPON = os.path.basename(WEAPON_FILES[0]) if WEAPON_FILES else "weapon001_a1.hsc.dds"




def extract_first_frame(img_path, extract_count=1):
    base_name = os.path.basename(img_path)
    cache_png = os.path.join(CACHE_DIR, f"{base_name}.{extract_count}.png")
    cache_txt = os.path.join(CACHE_DIR, f"{base_name}.{extract_count}.txt")
    
    # 캐시된 파일이 있으면 빠르게 PNG로 로딩합니다.
    if os.path.exists(cache_png) and os.path.exists(cache_txt):
        try:
            with open(cache_txt, "r") as f:
                c_str = f.read().split(",")
                cx, cy = int(c_str[0]), int(c_str[1])
            return Image.open(cache_png).convert("RGBA"), cx, cy
        except: pass

    try:
        img = Image.open(img_path)
        img.load() # Force load to catch truncated/corrupted errors early
        img = img.convert("RGBA")
        a = np.array(img)[:,:,3]
        h, w = a.shape
        
        # 1. 첫 번째 행(Y축) 데이터가 있는 구간 스캔
        row_sums = a.sum(axis=1)
        row_zeros = np.where(row_sums == 0)[0]
        row_blocks = np.split(row_zeros, np.where(np.diff(row_zeros) > 1)[0] + 1) if len(row_zeros) > 0 else []
        
        y_start = 0
        if len(row_blocks) > 0 and row_blocks[0][0] == 0:
            y_start = row_blocks[0][-1] + 1
            
        y_end = h
        for b in row_blocks:
            if b[0] > y_start and len(b) > 2: # 최소 3픽셀 이상의 명확한 여백만 분할선으로 인정
                y_end = b[0]
                break
                
        # 2. 찾은 Y축 밴드 내에서 첫 번째 열(X축) 데이터가 있는 구간 스캔
        band = a[y_start:y_end, :]
        col_sums = band.sum(axis=0)
        col_zeros = np.where(col_sums == 0)[0]
        col_blocks = np.split(col_zeros, np.where(np.diff(col_zeros) > 1)[0] + 1) if len(col_zeros) > 0 else []
        
        x_start = 0
        if len(col_blocks) > 0 and col_blocks[0][0] == 0:
            x_start = col_blocks[0][-1] + 1
            
        x_end = w
        blocks_found = 0
        for b in col_blocks:
            if b[0] > x_start and len(b) > 2:
                blocks_found += 1
                x_end = b[0]
                if blocks_found >= extract_count:
                    break
        
        # 3. 정확히 첫 번째 파츠 1개만 포함하는 타이트한 바운딩 박스
        bbox = (x_start, y_start, x_end, y_end)
        
        if x_start < x_end and y_start < y_end:
            cropped = img.crop(bbox)
            try:
                cropped.save(cache_png, "PNG")
                with open(cache_txt, "w") as f:
                    f.write(f"{x_start},{y_start}")
            except: pass
            return cropped, x_start, y_start
        else:
            return None, 0, 0
    except BaseException as e: # Catch EVERYTHING including KeyboardInterrupt if needed, though usually we want to see it
        print(f"이미지 추출 중 치명적 오류 ({img_path}): {e}")
        return None, 0, 0

class DressUpSimulation:
    def __init__(self, root):
        self.root = root
        self.root.title("옷입히기 시뮬레이션 (Coordinator)")
        self.parts = {
            "bg": {"file": BG, "img": None, "show": tk.BooleanVar(value=True), "order": -1, "name": "배경 (Background)", "offset_x": 0, "offset_y": 0, "is_bg": True},
            "body": {"file": BODY, "img": None, "show": tk.BooleanVar(value=True), "order": 0, "name": "몸통 (Body)", "offset_x": 0, "offset_y": 0},
            "shoe": {"file": SHOE, "img": None, "show": tk.BooleanVar(value=True), "order": 1, "name": "신발 (Shoes)", "offset_x": 0, "offset_y": 60},
            "pants": {"file": PANTS, "img": None, "show": tk.BooleanVar(value=True), "order": 2, "name": "바지 (Pants)", "offset_x": 0, "offset_y": 44},
            "shirt": {"file": SHIRT, "img": None, "show": tk.BooleanVar(value=True), "order": 3, "name": "상의 (Shirt)", "offset_x": 0, "offset_y": 0},
            "glove": {"file": GLOVE, "img": None, "show": tk.BooleanVar(value=True), "order": 4, "name": "장갑 (Gloves)", "offset_x": 0, "offset_y": 30},
            "weapon": {"file": WEAPON, "img": None, "show": tk.BooleanVar(value=False), "order": 5, "name": "무기 (Weapon)", "offset_x": -34, "offset_y": 42},
            "hair": {"file": HAIR, "img": None, "show": tk.BooleanVar(value=True), "order": 6, "name": "모자용 눌린 헤어", "offset_x": -43, "offset_y": -35},
            "helm": {"file": HELM, "img": None, "show": tk.BooleanVar(value=True), "order": 7, "name": "헤어 / 모자", "offset_x": -43, "offset_y": -35},
        }
        
        self.thumbnail_queue = queue.Queue()
        self.ui_queue = queue.Queue()
        self.thumbnails = [] # 썸네일 레퍼런스 보관 (가비지 컬렉션 방지)

        # 1. UI 구성 (빈 상태로 먼저 띄우기)
        self.canvas_frame = tk.Frame(root)
        self.canvas_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(self.canvas_frame, bg="#333333", width=256, height=256, highlightthickness=0)
        self.canvas.pack(pady=20, padx=20) # Center in frame

        self.control_frame = tk.Frame(root, width=280, padx=10, pady=10)
        self.control_frame.pack(side=tk.RIGHT, fill=tk.Y)
        
        btn_frame = tk.Frame(self.control_frame)
        btn_frame.pack(fill=tk.X, pady=(0, 10))
        save_btn = tk.Button(btn_frame, text="코디네이터 완성본 저장 (512x512 PNG)", font=("Malgun Gothic", 10, "bold"), bg="#4CAF50", fg="white", command=self.save_image)
        save_btn.pack(fill=tk.X, ipady=5)

        tk.Label(self.control_frame, text="파츠 선택 및 좌표 조정", font=("Malgun Gothic", 14, "bold")).pack(pady=10)

        for key, part in sorted(self.parts.items(), key=lambda x: x[1]["order"]):
            frame = tk.Frame(self.control_frame, pady=3)
            frame.pack(fill=tk.X)
            cb = tk.Checkbutton(frame, text=part["name"], variable=part["show"], command=self.update_image, font=("Malgun Gothic", 10, "bold"))
            cb.pack(anchor="w")
            if key in ["body", "shirt", "pants"]: cb.config(state=tk.DISABLED)

        tk.Label(self.control_frame, text="파츠 교체", font=("Malgun Gothic", 12, "bold")).pack(pady=(15, 5))
        self.notebook = ttk.Notebook(self.control_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)

        # 2. 필수 기본 파츠 로딩 (맨 처음에만)
        self.load_parts()

        # 3. 탭 생성 및 썸네일 로딩 큐 입력
        # 배경 탭은 파일이 적을 가능성이 높으므로 직접 생성 (혹은 비동기)
        self.create_thumbnail_tab("바디", BODY_FILES, "body")
        self.create_thumbnail_tab("상의", SHIRT_FILES, "shirt")
        self.create_thumbnail_tab("하의", PANT_FILES, "pants")
        self.create_thumbnail_tab("신발", SHOE_FILES, "shoe")
        self.create_thumbnail_tab("장갑", GLOVE_FILES, "glove")
        self.create_thumbnail_tab("무기", WEAPON_FILES, "weapon")
        self.create_thumbnail_tab("모자 / 헤어", HELM_FILES, "helm")
        self.create_bg_tab("배경", BG_FILES, "bg")

        # 4. 백그라운드 쓰레드 시작
        self.load_thread = threading.Thread(target=self.thumbnail_worker_loop)
        self.load_thread.daemon = True
        self.load_thread.start()
        
        self.display_image = None
        self.raw_final_canvas = None
        self.process_ui_queue()
        self.update_image()

    def load_parts(self):
        # 현재 장착된(default) 기본 파츠 8개만 로딩 시도 (동기)
        for key, part in self.parts.items():
            path = os.path.join(BASE_DIR, part["file"])
            if os.path.exists(path):
                if part.get("is_bg"):
                    try:
                        bg_img = Image.open(path)
                        bg_img.load()
                        part["img"] = bg_img.convert("RGBA")
                        part["crop_x"], part["crop_y"] = 0, 0
                    except: pass
                else:
                    ec = 2 if key == "glove" else 1
                    cropped, cx, cy = extract_first_frame(path, extract_count=ec)
                    if cropped:
                        part["img"], part["crop_x"], part["crop_y"] = cropped, cx, cy

    def create_thumbnail_tab(self, title, file_list, part_key):
        tab_frame = tk.Frame(self.notebook)
        self.notebook.add(tab_frame, text=title)

        canvas = tk.Canvas(tab_frame, borderwidth=0, highlightthickness=0)
        scrollbar = ttk.Scrollbar(tab_frame, orient="vertical", command=canvas.yview)
        inner_frame = tk.Frame(canvas)

        inner_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        canvas.create_window((0, 0), window=inner_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        columns = 3
        
        for idx, f_path in enumerate(file_list):
            self.thumbnail_queue.put((f_path, part_key, inner_frame, idx, columns))

    def thumbnail_worker_loop(self):
        while True:
            task = self.thumbnail_queue.get()
            if task is None: break
            f_path, part_key, inner_frame, idx, columns = task
            ec = 2 if part_key == "glove" else 1
            cropped, _, _ = extract_first_frame(f_path, extract_count=ec)
            
            if cropped:
                box_size = 80
                bg = Image.new("RGBA", (box_size, box_size), (220, 220, 220, 255))
                paste_x = (box_size - cropped.width) // 2
                paste_y = (box_size - cropped.height) // 2
                bg.paste(cropped, (paste_x, paste_y), cropped)
                self.ui_queue.put(("success", f_path, part_key, inner_frame, idx, columns, bg))
            else:
                self.ui_queue.put(("fail", f_path, part_key, inner_frame, idx, columns, None))
            self.thumbnail_queue.task_done()

    def process_ui_queue(self):
        try:
            for _ in range(10): # UI 렉 방지 위해 한번에 10개까지만 처리
                task = self.ui_queue.get_nowait()
                status, f_path, part_key, inner_frame, idx, columns, bg = task
                if status == "success":
                    photo = ImageTk.PhotoImage(bg)
                    self.thumbnails.append(photo)
                    btn = tk.Button(inner_frame, image=photo, command=lambda f=f_path, k=part_key: self.change_part(k, f))
                    btn.grid(row=idx // columns, column=idx % columns, padx=2, pady=2)
                else:
                    btn = tk.Button(inner_frame, text="Fail", width=6, height=3, command=lambda f=f_path, k=part_key: self.change_part(k, f))
                    btn.grid(row=idx // columns, column=idx % columns, padx=2, pady=2)
        except queue.Empty:
            pass
        self.root.after(50, self.process_ui_queue)
                
    def create_bg_tab(self, title, file_list, part_key):
        tab_frame = tk.Frame(self.notebook)
        self.notebook.add(tab_frame, text=title)

        canvas = tk.Canvas(tab_frame, borderwidth=0, highlightthickness=0)
        scrollbar = ttk.Scrollbar(tab_frame, orient="vertical", command=canvas.yview)
        inner_frame = tk.Frame(canvas)

        inner_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        canvas.create_window((0, 0), window=inner_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        columns = 3
        
        for idx, f_path in enumerate(file_list):
            try:
                img = Image.open(f_path)
                img.load()
                bg_img = img.convert("RGBA").resize((80, 80), Image.Resampling.LANCZOS)
                
                photo = ImageTk.PhotoImage(bg_img)
                self.thumbnails.append(photo)
                
                btn = tk.Button(inner_frame, image=photo, command=lambda f=f_path, k=part_key: self.change_bg(k, f))
                btn.grid(row=idx // columns, column=idx % columns, padx=2, pady=2)
            except:
                btn = tk.Button(inner_frame, text="Fail", width=6, height=3, command=lambda f=f_path, k=part_key: self.change_bg(k, f))
                btn.grid(row=idx // columns, column=idx % columns, padx=2, pady=2)

    def change_bg(self, part_key, file_path):
        filename = os.path.basename(file_path)
        self.parts[part_key]["file"] = filename
        try:
            img = Image.open(file_path)
            img.load()
            self.parts[part_key]["img"] = img.convert("RGBA")
            self.parts[part_key]["crop_x"] = 0
            self.parts[part_key]["crop_y"] = 0
            self.update_image()
        except Exception as e:
            print(f"배경 변경 실패: {e}")

    def change_part(self, part_key, file_path):
        filename = os.path.basename(file_path)
        self.parts[part_key]["file"] = filename
        ec = 2 if part_key == "glove" else 1
        cropped, cx, cy = extract_first_frame(file_path, extract_count=ec)
        if cropped:
            self.parts[part_key]["img"] = cropped
            self.parts[part_key]["crop_x"] = cx
            self.parts[part_key]["crop_y"] = cy
            
            # 모자(Helm) 착용 시, 세트인 눌린 머리(Hair)가 있다면 자동으로 같이 입히기
            if part_key == "helm":
                import re
                match = re.search(r"helm(\d+)", filename)
                if match:
                    hair_name = f"hair{match.group(1)}_a1.hsc.dds"
                    hair_path = os.path.join(BASE_DIR, hair_name)
                    if os.path.exists(hair_path):
                        self.parts["hair"]["file"] = hair_name
                        h_crop, h_cx, h_cy = extract_first_frame(hair_path, extract_count=1)
                        if h_crop:
                            self.parts["hair"]["img"] = h_crop
                            self.parts["hair"]["crop_x"] = h_cx
                            self.parts["hair"]["crop_y"] = h_cy
                            self.parts["hair"]["show"].set(True) # 세트가 있으면 체크박스 켜주기
                    # 세트 헤어가 없어도 (else문 제거) 기존에 켜져있던 헤어를 강제로 끄지 않음
            
            self.update_image()

    def update_image(self):
        # 256x256 고정 캔버스 생성
        final_canvas = Image.new("RGBA", (256, 256), (50, 50, 50, 255))
        
        # 기기마다 다를 수 있지만, 소스 이미지들이 512x512 기반이고 
        # 캐릭터가 대략 중앙에 있다면 마이너스 오프셋으로 256 영역에 가둡니다.
        # 기존 로직이 1024x1536 도화지에 256,256을 원점으로 썼으므로
        # 256x256 화면에서는 캐릭터가 중앙에 오도록 오프셋을 조정합니다.
        # (512x512 배경이 있다면 그것도 중앙으로)
        
        # 배경 먼저 처리 (배경은 알파 채널이 없을 수 있으므로 paste)
        bg_part = self.parts.get("bg")
        if bg_part and bg_part["img"] and bg_part["show"].get():
            bw, bh = bg_part["img"].size
            bx = (256 - bw) // 2
            by = (256 - bh) // 2
            final_canvas.paste(bg_part["img"], (int(bx), int(by)))

        # 캐릭터 파츠들 (순서대로)
        # 소스 이미지 크롭 정보 등을 활용해 256x256 중앙에 배치
        # 캐릭터 발끝/중앙이 128, 128 부근에 오도록 조정
        # 바디 파츠를 기준으로 캐릭터를 화면 중앙에 정렬합니다냥.
        body_part = self.parts.get("body")
        if body_part and body_part["img"]:
            # 바디의 가로 중앙을 캔버스 중앙(128)에 맞춤냥!
            char_base_x = 128 - (body_part["img"].width // 2 + body_part.get("crop_x", 0))
            # 캐릭터 위치를 조금 더 아래로 내려서 화면 중앙 느낌을 줍니다냥 (40 -> 100)
            char_base_y = 100 - body_part.get("crop_y", 0)
        else:
            char_base_x = 128 - 256 
            char_base_y = 100 - 20 # 기본값냥!

        sorted_keys = sorted(self.parts.keys(), key=lambda k: self.parts[k]["order"])
        for key in sorted_keys:
            part = self.parts[key]
            if key != "bg" and part["show"].get() and part["img"]:
                ox = part["offset_x"].get() if hasattr(part["offset_x"], "get") else part["offset_x"]
                oy = part["offset_y"].get() if hasattr(part["offset_y"], "get") else part["offset_y"]
                
                # px, py 계산 (중앙 정렬)
                px = char_base_x + ox + part.get("crop_x", 0)
                py = char_base_y + oy + part.get("crop_y", 0)
                
                # 안전하게 합성 (paste + mask)
                try:
                    # 마스크(본딩 이미지의 알파 채널)를 명시적으로 사용합니다냥!
                    mask = part["img"].split()[3] if part["img"].mode == "RGBA" else None
                    final_canvas.paste(part["img"], (int(px), int(py)), mask)
                except Exception as e:
                    print(f"렌더링 오류 ({key}): {e}")
                    # 실패 시 단순 붙여넣기 시도
                    try:
                        final_canvas.paste(part["img"], (int(px), int(py)))
                    except: pass
                
        self.raw_final_canvas = final_canvas.copy()
        self.display_image = ImageTk.PhotoImage(final_canvas)
        self.canvas.delete("all")
        self.canvas.create_image(0, 0, anchor="nw", image=self.display_image)
        self.canvas.image = self.display_image # 가비지 컬렉션 방지

    def save_image(self):
        if not self.raw_final_canvas:
            return
            
        final_to_save = self.raw_final_canvas
        
        save_path = filedialog.asksaveasfilename(
            defaultextension=".png",
            filetypes=[("PNG 파일", "*.png"), ("모든 파일", "*.*")],
            title="코디 이미지 저장"
        )
        if save_path:
            try:
                final_to_save.save(save_path, "PNG")
                messagebox.showinfo("저장 완료", f"이미지가 성공적으로 저장되었습니다!\n{save_path}")
            except Exception as e:
                messagebox.showerror("저장 오류", f"이미지를 저장하는 중 문제가 발생했습니다.\n{e}")

if __name__ == "__main__":
    root = tk.Tk()
    root.geometry("1000x800")
    app = DressUpSimulation(root)
    root.mainloop()
