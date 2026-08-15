"""Generate 22-slide TypeScript deck from slides-typescript-akal-akalan.md."""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

ACCENT = RGBColor(0x2E, 0x5E, 0xAA)
ACCENT_D = RGBColor(0x1E, 0x3A, 0x6E)
DARK = RGBColor(0x1F, 0x29, 0x37)
LIGHT = RGBColor(0xF5, 0xF7, 0xFA)
GRAY = RGBColor(0x64, 0x70, 0x7E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
CODE_BG = RGBColor(0x11, 0x18, 0x27)
CODE_FG = RGBColor(0xD1, 0xD5, 0xDB)
CODE_ACCENT = RGBColor(0x7D, 0xC4, 0xFF)
RED = RGBColor(0xB9, 0x32, 0x2A)
RED_BG = RGBColor(0xFD, 0xEC, 0xEA)
GREEN = RGBColor(0x1E, 0x7A, 0x46)
GREEN_BG = RGBColor(0xE8, 0xF6, 0xEE)
MONO = "Consolas"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank = prs.slide_layouts[6]
SW, SH = prs.slide_width, prs.slide_height


def add_bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def add_rect(slide, x, y, w, h, color, line=None, round_=False):
    shp = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if round_ else MSO_SHAPE.RECTANGLE, x, y, w, h)
    shp.fill.solid()
    shp.fill.fore_color.rgb = color
    if line:
        shp.line.color.rgb = line
        shp.line.width = Pt(1)
    else:
        shp.line.fill.background()
    shp.shadow.inherit = False
    return shp


def add_text(slide, x, y, w, h, runs, size=18, color=DARK, bold=False,
             align=PP_ALIGN.LEFT, font="Calibri", spacing=1.0, space_after=6):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    if isinstance(runs, str):
        runs = [(runs, bold)]
    for i, (text, b) in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = spacing
        p.space_after = Pt(space_after)
        r = p.add_run()
        r.text = text
        r.font.size = Pt(size)
        r.font.color.rgb = color
        r.font.bold = b
        r.font.name = font
    return tb


def parse_bold(text):
    """Split '**bold** normal' into [(text, bold)]."""
    out, cur, bold = [], "", False
    for part in text.split("**"):
        if part == "":
            bold = not bold
            continue
        out.append((part, bold))
        bold = not bold
    return out


def bullets(slide, x, y, w, h, items, size=18, spacing=1.0, space_after=10,
            marker="•", marker_color=ACCENT, color=DARK):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = spacing
        p.space_after = Pt(space_after)
        rm = p.add_run()
        rm.text = f"{marker} "
        rm.font.size = Pt(size)
        rm.font.color.rgb = marker_color
        rm.font.bold = True
        for text, b in parse_bold(item):
            r = p.add_run()
            r.text = text
            r.font.size = Pt(size)
            r.font.color.rgb = color
            r.font.bold = b
            r.font.name = "Calibri"
    return tb


def code_block(slide, x, y, w, code, size=12, h=None, title=None):
    lines = code.split("\n")
    line_h = size / 72 * 1.35 + 0.03
    height = h or (len(lines) * line_h + 0.24)
    add_rect(slide, x, y, w, height, CODE_BG, round_=True)
    inner_x, inner_y = x + Inches(0.2), y + Inches(0.12)
    tb = slide.shapes.add_textbox(inner_x, inner_y, w - Inches(0.4), height - Inches(0.2))
    tf = tb.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = 1.0
        p.space_after = Pt(0)
        # highlight lines starting with "//" or containing "↓" as comment-ish
        is_comment = line.lstrip().startswith("//") or "↓" in line or "←" in line
        r = p.add_run()
        r.text = line
        r.font.size = Pt(size)
        r.font.name = MONO
        r.font.color.rgb = CODE_ACCENT if is_comment else CODE_FG
    return height


def header(slide, title, subtitle=None):
    add_bg(slide, LIGHT)
    add_rect(slide, 0, 0, Inches(0.18), SH, ACCENT)
    add_text(slide, Inches(0.8), Inches(0.5), Inches(11.8), Inches(0.9),
             title, size=30, bold=True)
    add_rect(slide, Inches(0.85), Inches(1.32), Inches(2.0), Inches(0.055), ACCENT)
    if subtitle:
        add_text(slide, Inches(0.85), Inches(1.5), Inches(11.6), Inches(0.5),
                 subtitle, size=16, color=GRAY)


def pagenum(slide, n):
    add_text(slide, Inches(12.3), Inches(7.05), Inches(0.9), Inches(0.35),
             f"{n} / 22", size=11, color=GRAY, align=PP_ALIGN.RIGHT)


# ───────────────────────── S1 Title ─────────────────────────────
s = prs.slides.add_slide(blank)
add_bg(s, DARK)
add_rect(s, 0, Inches(5.05), SW, Inches(0.12), ACCENT)
add_text(s, Inches(1.0), Inches(1.9), Inches(11.3), Inches(1.7),
         "TypeScript & \u201cAkal-akalan\u201d Static Typing", size=46, color=WHITE,
         bold=True, spacing=1.05)
add_text(s, Inches(1.0), Inches(3.6), Inches(11.0), Inches(1.2),
         "Kenapa TypeScript dianggap cuma \u201cilusi\u201d type safety\ndi atas runtime JavaScript yang dynamic?",
         size=20, color=RGBColor(0xBF, 0xD3, 0xF0), spacing=1.2)
add_text(s, Inches(1.0), Inches(5.6), Inches(11.0), Inches(0.5),
         "\U0001F9EA Riset oleh Velma", size=16, color=GRAY)

# ───────────────────────── S2 TypeScript Itu Apa? ───────────────
s = prs.slides.add_slide(blank)
header(s, "TypeScript Itu Apa?", "Sebelum ngomongin \u201cakal-akalan\u201d, pahami dulu fondasinya")
bullets(s, Inches(0.9), Inches(2.1), Inches(11.5), Inches(3.4), [
    "**Superset JavaScript** \u2014 semua JS valid = TS valid",
    "Menambahkan **static type annotations**",
    "Di-compile (transpile) \u2192 JavaScript biasa",
    "Dibuat Microsoft, dirancang oleh **Anders Hejlsberg** (C#, Delphi, Turbo Pascal)",
    "Rilis 2012, sekarang **dominasi ekosistem JS**",
], size=19)
add_rect(s, Inches(0.9), Inches(5.5), Inches(11.5), Inches(1.25), RGBColor(0xE3, 0xEC, 0xF8), round_=True)
add_text(s, Inches(1.2), Inches(5.7), Inches(11.0), Inches(0.9),
         "**Fakta kunci:** TS types **hanya ada di compile time**. Di runtime, browser/Node.js cuma lihat JavaScript polos. Types-nya **dihapus (erased)** saat kompilasi.",
         size=17, color=DARK, spacing=1.15)
pagenum(s, 2)

# ───────────────────────── S3 Kenapa Disebut Akal-akalan ────────
s = prs.slides.add_slide(blank)
header(s, "Kenapa Disebut \u201cAkal-akalan\u201d?", "Kritik utama dari komunitas purist static typing")
add_rect(s, Inches(0.9), Inches(2.0), Inches(11.5), Inches(1.5), CODE_BG, round_=True)
add_text(s, Inches(1.3), Inches(2.35), Inches(10.8), Inches(0.9),
         "\u201cTypeScript cuma ilusi type safety \u2014 karena runtime-nya tetap JavaScript yang dynamic.\u201d",
         size=22, color=WHITE, bold=True, spacing=1.15)
add_text(s, Inches(0.9), Inches(4.0), Inches(11.5), Inches(0.6),
         "8 alasan kenapa:", size=22, bold=True, color=ACCENT_D)
bullets(s, Inches(1.1), Inches(4.7), Inches(11.0), Inches(2.2), [
    "Type erasure \u2014 types hilang setelah compile",
    "any \u2014 pintu darurat yang menyebar",
    "Type assertion \u2014 bisa bohong ke compiler",
    "External data \u2014 blind spot",
    "Gradual typing \u2014 false safety",
    "Declaration files \u2014 bisa ngaco",
    "Runtime behavior JS gak berubah",
    "\u201cSuperset\u201d \u2014 batasan inheren",
], size=16, space_after=4)
pagenum(s, 3)

# ───────────────────────── S4 #1 Type Erasure ───────────────────
s = prs.slides.add_slide(blank)
header(s, "#1 Type Erasure", "Types hilang total setelah compile")
code_block(s, Inches(0.9), Inches(1.9), Inches(11.5), """// TypeScript
function add(a: number, b: number): number {
  return a + b;
}

\u2193 compile \u2193

// JavaScript \u2014 types hilang!
function add(a, b) {
  return a + b;
}""", size=13)
add_text(s, Inches(0.9), Inches(4.65), Inches(11.5), Inches(1.2),
         "**Masalah:** Runtime gak bisa enforce types. Kalo bug lolos compile check \u2192 gak ada safety net.",
         size=18, spacing=1.2)
add_text(s, Inches(0.9), Inches(5.55), Inches(11.5), Inches(0.9),
         "Bandingkan: Java/C# punya type info di runtime (reflection, runtime checks).",
         size=16, color=GRAY, spacing=1.15)
pagenum(s, 4)

# ───────────────────────── S5 #2 any ────────────────────────────
s = prs.slides.add_slide(blank)
header(s, "#2 \u2018any\u2019 \u2014 Pintu Darurat", "Opt-out total dari type system")
code_block(s, Inches(0.9), Inches(1.9), Inches(11.5), """const data: any = fetchSomething();
data.foo.bar.baz(); // \u2705 No TypeScript error
                    // \U0001F4A5 Runtime crash""", size=14)
add_rect(s, Inches(0.9), Inches(3.9), Inches(11.5), Inches(1.15), RGBColor(0xFD, 0xEC, 0xEA), round_=True)
add_text(s, Inches(1.2), Inches(4.1), Inches(11.0), Inches(0.8),
         "\u2018any\u2019 bersifat **infectious** \u2014 menyebar ke seluruh codebase karena TS menganggap \u2018any\u2019 assignable ke/dari tipe apa pun.",
         size=18, color=DARK, spacing=1.15)
add_text(s, Inches(0.9), Inches(5.35), Inches(11.5), Inches(0.8),
         "Satu \u2018any\u2019 di satu tempat bisa menurunkan safety di tempat lain.", size=16, color=GRAY)
pagenum(s, 5)

# ───────────────────────── S6 #3 Type Assertion ─────────────────
s = prs.slides.add_slide(blank)
header(s, "#3 Type Assertion Bisa \u201cBohong\u201d", "\u2018as\u2019 keyword bisa override type checker")
code_block(s, Inches(0.9), Inches(1.9), Inches(11.5), """const response = await fetch(\"/api/user\");
const user = response.json() as User;
// TypeScript percaya aja \u2014 padahal API bisa return apa aja""", size=14)
add_rect(s, Inches(0.9), Inches(4.05), Inches(11.5), Inches(1.0), RGBColor(0xFD, 0xEC, 0xEA), round_=True)
add_text(s, Inches(1.2), Inches(4.25), Inches(11.0), Inches(0.7),
         "**Gak ada runtime validation.** Developer bisa \u201cbohong\u201d ke compiler.",
         size=18, color=DARK, spacing=1.15)
add_text(s, Inches(0.9), Inches(5.35), Inches(11.5), Inches(0.8),
         "TS hanya memindahkan kepercayaan dari runtime ke developer \u2014 dan kepercayaan itu bisa salah.", size=16, color=GRAY)
pagenum(s, 6)

# ───────────────────────── S7 #4 External Data ──────────────────
s = prs.slides.add_slide(blank)
header(s, "#4 External Data = Blind Spot", "Data dari luar aplikasi selalu unknown di runtime")
bullets(s, Inches(0.9), Inches(1.9), Inches(11.5), Inches(1.7), [
    "API responses", "localStorage", "Form input", "URL params",
], size=17, space_after=4)
code_block(s, Inches(0.9), Inches(3.35), Inches(11.5), """const stored = localStorage.getItem(\"user\");
const user: User = JSON.parse(stored);
// TS oke, tapi stored bisa corrupted""", size=13)
add_rect(s, Inches(0.9), Inches(5.35), Inches(11.5), Inches(1.15), RGBColor(0xFD, 0xEC, 0xEA), round_=True)
add_text(s, Inches(1.2), Inches(5.55), Inches(11.0), Inches(0.8),
         "**Ironi:** Butuh library tambahan (Zod, Yup, io-ts) untuk runtime validation \u2014 justru ngebuktiin TS aja gak cukup.",
         size=17, color=DARK, spacing=1.15)
pagenum(s, 7)

# ───────────────────────── S8 #5 Gradual Typing ─────────────────
s = prs.slides.add_slide(blank)
header(s, "#5 Gradual Typing = False Safety", "TypeScript bukan sound type system \u2014 sengaja mengizinkan unsound behavior")
code_block(s, Inches(0.9), Inches(1.9), Inches(11.5), """const nums: number[] = [1, 2, 3];
const stuff: any[] = nums;   // \u2705 OK \u2014 structural typing
stuff.push(\"haha\");          // \u2705 No error
nums[3].toFixed(2);          // \U0001F4A5 \"haha\".toFixed is not a function""", size=13)
add_rect(s, Inches(0.9), Inches(4.35), Inches(11.5), Inches(1.0), RGBColor(0xFD, 0xEC, 0xEA), round_=True)
add_text(s, Inches(1.2), Inches(4.55), Inches(11.0), Inches(0.7),
         "Di Rust/OCaml, kasus kayak gini **gak mungkin terjadi**.",
         size=18, color=DARK, spacing=1.15)
pagenum(s, 8)

# ───────────────────────── S9 #6 Declaration Files ──────────────
s = prs.slides.add_slide(blank)
header(s, "#6 Declaration Files Bisa Ngaco", "Ekosistem TS bergantung pada @types/* (.d.ts files)")
bullets(s, Inches(0.9), Inches(2.2), Inches(11.5), Inches(2.8), [
    "**Dikelola terpisah** dari library aslinya",
    "Bisa **outdated, incomplete, atau salah**",
    "TypeScript **percaya begitu aja** ke definisi yang ada",
], size=20)
add_rect(s, Inches(0.9), Inches(4.9), Inches(11.5), Inches(1.2), RGBColor(0xE3, 0xEC, 0xF8), round_=True)
add_text(s, Inches(1.2), Inches(5.1), Inches(11.0), Inches(0.85),
         "Kalo .d.ts-nya salah, compiler dengan setia nge-approve type yang salah \u2014 dan itu di luar kontrol library aslinya.",
         size=17, color=DARK, spacing=1.15)
pagenum(s, 9)

# ───────────────────────── S10 #7 Runtime Gak Berubah ───────────
s = prs.slides.add_slide(blank)
header(s, "#7 Runtime Behavior Gak Berubah", "TypeScript secara prinsip tidak mengubah runtime JavaScript")
add_text(s, Inches(0.9), Inches(1.9), Inches(11.5), Inches(0.6),
         "Semua quirk JS tetap ada:", size=20, bold=True)
bullets(s, Inches(1.1), Inches(2.6), Inches(11.0), Inches(3.0), [
    "Type coercion \u2014 `\"\" == 0` \u2192 `true`",
    "\u2018this\u2019 binding aneh",
    "`typeof null === \"object\"`",
    "Prototypal inheritance",
], size=19)
add_rect(s, Inches(0.9), Inches(5.4), Inches(11.5), Inches(1.0), RGBColor(0xE3, 0xEC, 0xF8), round_=True)
add_text(s, Inches(1.2), Inches(5.6), Inches(11.0), Inches(0.7),
         "TS cuma kasih peringatan di editor \u2014 runtime tetap jalan apa adanya.",
         size=17, color=DARK)
pagenum(s, 10)

# ───────────────────────── S11 #8 Superset ──────────────────────
s = prs.slides.add_slide(blank)
header(s, "#8 \u201cSuperset\u201d = Batasan Inheren", "Karena harus 100% kompatibel dengan JavaScript")
bullets(s, Inches(0.9), Inches(2.1), Inches(11.5), Inches(3.2), [
    "Gak bisa bikin **enum yang aman**",
    "Gak bisa **nominal typing** yang proper",
    "Gak bisa **fix bug lama** JavaScript",
    "Gak bisa nambah fitur yang butuh **runtime support**",
], size=20)
add_rect(s, Inches(0.9), Inches(5.0), Inches(11.5), Inches(1.15), RGBColor(0xFD, 0xEC, 0xEA), round_=True)
add_text(s, Inches(1.2), Inches(5.2), Inches(11.0), Inches(0.8),
         "TS **terikat** sama JavaScript \u2014 gak bisa lebih baik dari JavaScript itu sendiri.",
         size=18, color=DARK, bold=True, spacing=1.15)
pagenum(s, 11)

# ───────────────────────── S12 Tapi Worth It ────────────────────
s = prs.slides.add_slide(blank)
add_bg(s, DARK)
add_rect(s, 0, Inches(5.05), SW, Inches(0.12), ACCENT)
add_text(s, Inches(1.0), Inches(2.3), Inches(11.3), Inches(1.4),
         "Tapi\u2026 Tetep Worth It!", size=52, color=WHITE, bold=True)
add_text(s, Inches(1.0), Inches(4.0), Inches(11.0), Inches(1.0),
         "Meskipun \u201cakal-akalan\u201d, TypeScript tetap **lompatan besar** buat ekosistem JavaScript.",
         size=22, color=RGBColor(0xBF, 0xD3, 0xF0), spacing=1.2)
add_text(s, Inches(1.0), Inches(5.6), Inches(11.0), Inches(0.5),
         "6 counterarguments \u2192", size=16, color=GRAY)
pagenum(s, 12)

# ───────────────────────── S13 Catch Errors ─────────────────────
s = prs.slides.add_slide(blank)
header(s, "\u2705 #1 Catch Errors Before Production", "Mayoritas bug JS adalah type-related \u2014 TS catch di editor/CI")
rows = [
    ("Tanpa TS", "Dengan TS"),
    ("Typo property \u2192 runtime error", "Caught saat ngetik"),
    ("Argumen salah jumlah", "Caught compile time"),
    ("Null/undefined access", "Caught (strict null)"),
    ("Function kurang implementasi", "Caught compile"),
]
tbl_shape = s.shapes.add_table(len(rows), 2, Inches(0.9), Inches(2.0), Inches(11.5), Inches(3.6))
tbl = tbl_shape.table
tbl.columns[0].width = Inches(5.75)
tbl.columns[1].width = Inches(5.75)
for ri, row in enumerate(rows):
    for ci, val in enumerate(row):
        cell = tbl.cell(ri, ci)
        cell.text = val
        p = cell.text_frame.paragraphs[0]
        r = p.runs[0]
        r.font.size = Pt(17 if ri else 18)
        r.font.name = "Calibri"
        r.font.bold = (ri == 0) or (ci == 1 and ri > 0)
        cell.fill.solid()
        if ri == 0:
            cell.fill.fore_color.rgb = ACCENT_D
            r.font.color.rgb = WHITE
        elif ci == 1:
            cell.fill.fore_color.rgb = GREEN_BG
            r.font.color.rgb = GREEN
        else:
            cell.fill.fore_color.rgb = RED_BG
            r.font.color.rgb = RED
add_text(s, Inches(0.9), Inches(6.0), Inches(11.5), Inches(0.6),
         "Error paling mahal (runtime production) pindah ke paling murah (saat ngetik).", size=16, color=GRAY)
pagenum(s, 13)

# ───────────────────────── S14 Developer Experience ─────────────
s = prs.slides.add_slide(blank)
header(s, "\u2705 #2 Developer Experience", "Bukan cuma safety \u2014 produktivitas naik drastis")
bullets(s, Inches(0.9), Inches(2.1), Inches(11.5), Inches(3.4), [
    "**Autocomplete** akurat \u2014 gak perlu cek dokumentasi terus",
    "**Refactoring aman** \u2014 rename/ekstrak tanpa takut break",
    "**Go-to-definition** \u2014 navigasi kode cepat",
    "**Self-documenting** \u2014 types = dokumentasi inline",
], size=20)
add_rect(s, Inches(0.9), Inches(5.5), Inches(11.5), Inches(1.0), RGBColor(0xE3, 0xEC, 0xF8), round_=True)
add_text(s, Inches(1.2), Inches(5.7), Inches(11.0), Inches(0.7),
         "Gak mungkin dicapai di JS tanpa TS (atau JSDoc yang verbose).", size=17, color=DARK)
pagenum(s, 14)

# ───────────────────────── S15 Strict Mode ──────────────────────
s = prs.slides.add_slide(blank)
header(s, "\u2705 #3 Strict Mode = Mitigasi", "tsconfig.json \u2192 \u201cstrict\u201d: true")
code_block(s, Inches(0.9), Inches(1.9), Inches(11.5), """// tsconfig.json
\"strict\": true   // Tutup pintu darurat""", size=14)
bullets(s, Inches(0.9), Inches(3.35), Inches(11.5), Inches(2.6), [
    "`noImplicitAny` \u2192 gak boleh \u2018any\u2019 implisit",
    "`strictNullChecks` \u2192 null/undefined harus explicit",
    "`strictFunctionTypes` \u2192 type check lebih ketat",
    "`noUncheckedIndexedAccess` \u2192 array/object access bisa undefined",
], size=18)
add_rect(s, Inches(0.9), Inches(5.7), Inches(11.5), Inches(0.9), RGBColor(0xE3, 0xEC, 0xF8), round_=True)
add_text(s, Inches(1.2), Inches(5.88), Inches(11.0), Inches(0.6),
         "Semakin ketat config \u2192 semakin kecil \u201cpintu darurat\u201d yang terbuka.", size=16, color=DARK)
pagenum(s, 15)

# ───────────────────────── S16 Structural Typing ────────────────
s = prs.slides.add_slide(blank)
header(s, "\u2705 #4 Structural Typing = Kekuatan, Bukan Bug", "TS pakai structural typing (duck typing)")
add_text(s, Inches(0.9), Inches(2.0), Inches(11.5), Inches(0.9),
         "Dua object dengan shape sama = compatible.", size=22, bold=True, spacing=1.2)
bullets(s, Inches(0.9), Inches(3.0), Inches(11.5), Inches(2.6), [
    "**Bukan kelemahan, tapi desain sadar** \u2014 cocok dengan sifat JavaScript yang memang duck-typed",
    "Lebih fleksibel dari nominal typing tanpa kehilangan safety berarti",
    "Kompatibel dengan JS ecosystem yang shape-based",
], size=19)
add_rect(s, Inches(0.9), Inches(5.6), Inches(11.5), Inches(1.0), RGBColor(0xE3, 0xEC, 0xF8), round_=True)
add_text(s, Inches(1.2), Inches(5.8), Inches(11.0), Inches(0.7),
         "Duck typing + static check = yang terbaik dari dua dunia.", size=17, color=DARK, bold=True)
pagenum(s, 16)

# ───────────────────────── S17 Runtime Validation ───────────────
s = prs.slides.add_slide(blank)
header(s, "\u2705 #5 Runtime Validation Bisa Dilapis", "Best practice modern \u2014 TS bukan pengganti, tapi partner")
layers = [
    ("TypeScript (compile time)", "Catch 90% bug di development", ACCENT),
    ("Zod / Yup (runtime boundary)", "Validasi external data", RGBColor(0x8E, 0x6F, 0x2E)),
    ("JavaScript (runtime)", "Eksekusi", RGBColor(0x4B, 0x55, 0x63)),
]
y = Inches(2.1)
for title, desc, color in layers:
    add_rect(s, Inches(0.9), y, Inches(11.5), Inches(1.05), color, round_=True)
    add_text(s, Inches(1.3), y + Inches(0.12), Inches(10.8), Inches(0.5),
             title, size=19, color=WHITE, bold=True)
    add_text(s, Inches(1.3), y + Inches(0.55), Inches(10.8), Inches(0.4),
             desc, size=14, color=RGBColor(0xE5, 0xE7, 0xEB))
    y += Inches(1.22)
add_text(s, Inches(0.9), Inches(6.1), Inches(11.5), Inches(0.7),
         "Kombinasi ini powerful \u2014 **TS bukan pengganti runtime validation, tapi partner**.",
         size=18, bold=True, color=ACCENT_D)
pagenum(s, 17)

# ───────────────────────── S18 Adopsi Luas ──────────────────────
s = prs.slides.add_slide(blank)
header(s, "\u2705 #6 Adopsi Luas", "TypeScript mendominasi ekosistem JS modern")
bullets(s, Inches(0.9), Inches(2.1), Inches(11.5), Inches(3.2), [
    "**Next.js, Deno, Bun, Angular** \u2014 TS-first",
    "**Prisma, tRPC, TanStack Query** \u2014 dibangun di atas TS types",
    "**StackOverflow Developer Survey** \u2014 TS di top 5 most loved/admired",
], size=20)
add_rect(s, Inches(0.9), Inches(5.3), Inches(11.5), Inches(1.15), RGBColor(0xE8, 0xF6, 0xEE), round_=True)
add_text(s, Inches(1.2), Inches(5.5), Inches(11.0), Inches(0.8),
         "**Bukti bahwa trade-off yang diambil TypeScript berhasil.**", size=18, color=GREEN, bold=True)
pagenum(s, 18)

# ───────────────────────── S19 Iya / Tidak ──────────────────────
s = prs.slides.add_slide(blank)
header(s, "Apakah Benar-benar \u201cAkal-akalan\u201d?", "Dua sisi mata uang")
add_rect(s, Inches(0.9), Inches(1.9), Inches(5.6), Inches(4.6), RED_BG, round_=True)
add_text(s, Inches(1.2), Inches(2.1), Inches(5.0), Inches(0.5),
         "Iya, KARENA:", size=20, color=RED, bold=True)
bullets(s, Inches(1.2), Inches(2.7), Inches(5.0), Inches(3.6), [
    "Types hilang di runtime \u2014 cuma \u201cilusi\u201d type safety",
    "\u2018any\u2019 dan \u2018as\u2019 bisa bypass",
    "Tetap perlu runtime validation",
    "Gak bisa fix fundamental JS quirk",
], size=16, space_after=10, marker_color=RED)
add_rect(s, Inches(6.85), Inches(1.9), Inches(5.6), Inches(4.6), GREEN_BG, round_=True)
add_text(s, Inches(7.15), Inches(2.1), Inches(5.0), Inches(0.5),
         "Tidak, KARENA:", size=20, color=GREEN, bold=True)
bullets(s, Inches(7.15), Inches(2.7), Inches(5.0), Inches(3.6), [
    "Ini **design choice**, bukan kelemahan",
    "Semua compiled language juga \u201ckehilangan\u201d types di binary (C, C++, Rust, Go)",
    "Gak ada yang nyebut mereka \u201cakal-akalan\u201d",
    "TS dari awal emang **gradual typing**, bukan fully sound",
], size=16, space_after=10, marker_color=GREEN)
pagenum(s, 19)

# ───────────────────────── S20 Trade-off ────────────────────────
s = prs.slides.add_slide(blank)
header(s, "Trade-off yang Terbukti Berhasil", "Posisi pragmatis di tengah")
boxes = [
    ("Purist Static\n(Rust/Haskell)", "100% safe\n tapi rigid", RGBColor(0x4B, 0x55, 0x63)),
    ("TypeScript\n(gradual typing)", "90% safe\n cukup untuk real-world apps", ACCENT),
    ("Dynamic JS\n(Zero safety)", "0% safe\n fleksibel total tapi rawan bug", RGBColor(0x8E, 0x6F, 0x2E)),
]
x = Inches(0.9)
for title, desc, color in boxes:
    add_rect(s, x, Inches(2.2), Inches(3.7), Inches(2.6), color, round_=True)
    add_text(s, x + Inches(0.2), Inches(2.45), Inches(3.3), Inches(1.0),
             title, size=19, color=WHITE, bold=True, spacing=1.1, align=PP_ALIGN.CENTER)
    add_text(s, x + Inches(0.2), Inches(3.6), Inches(3.3), Inches(1.0),
             desc, size=14, color=RGBColor(0xE5, 0xE7, 0xEB), spacing=1.15, align=PP_ALIGN.CENTER)
    x += Inches(3.9)
add_text(s, Inches(0.9), Inches(5.2), Inches(11.5), Inches(1.4),
         "TS ambil posisi **pragmatis** di tengah \u2014 dan terbukti jadi sweet spot.\n\n100% aman tapi kaku \u2190\u2192 0% aman tapi bebas: TS pilih jalan tengah yang bisa dipakai real-world.",
         size=17, color=DARK, spacing=1.25)
pagenum(s, 20)

# ───────────────────────── S21 Kesimpulan ───────────────────────
s = prs.slides.add_slide(blank)
header(s, "Kesimpulan", "Bukan silver bullet \u2014 tapi lompatan revolusioner")
bullets(s, Inches(0.9), Inches(2.0), Inches(11.5), Inches(2.6), [
    "TypeScript **bukan silver bullet**.",
    "Dia **compile-time safety layer**, bukan runtime safety layer.",
    "Tapi udah cukup untuk **eliminate 90%+ kategori bug** di JavaScript.",
], size=20, space_after=12)
add_rect(s, Inches(0.9), Inches(4.7), Inches(11.5), Inches(1.5), RGBColor(0xE3, 0xEC, 0xF8), round_=True)
add_text(s, Inches(1.2), Inches(4.9), Inches(11.0), Inches(1.1),
         "Kritik \u201cakal-akalan\u201d biasanya dari perspektif **purist static typing** \u2014 tapi dari perspektif JS developer yang sebelumnya **zero type safety**, TypeScript adalah **lompatan revolusioner**.",
         size=17, color=DARK, spacing=1.2)
add_rect(s, Inches(0.9), Inches(6.35), Inches(11.5), Inches(0.75), CODE_BG, round_=True)
add_text(s, Inches(1.2), Inches(6.5), Inches(11.0), Inches(0.5),
         "Real-world engineering = pragmatic trade-offs, bukan purity.",
         size=16, color=WHITE, bold=True)
pagenum(s, 21)

# ───────────────────────── S22 Q&A ──────────────────────────────
s = prs.slides.add_slide(blank)
add_bg(s, DARK)
add_rect(s, 0, Inches(5.05), SW, Inches(0.12), ACCENT)
add_text(s, Inches(1.0), Inches(2.1), Inches(11.3), Inches(1.2),
         "Q&A / Diskusi", size=52, color=WHITE, bold=True)
add_text(s, Inches(1.0), Inches(3.5), Inches(11.0), Inches(0.7),
         "\U0001F9EA Ada pertanyaan?", size=22, color=RGBColor(0xBF, 0xD3, 0xF0))
add_text(s, Inches(1.0), Inches(4.6), Inches(11.0), Inches(0.5),
         "Topik lanjutan:", size=16, color=GRAY)
bullets(s, Inches(1.0), Inches(5.1), Inches(11.0), Inches(1.5), [
    "TypeScript vs Rust/Go (pure static)",
    "Best practice mitigasi (Zod + strict TS)",
    "Kapan gak perlu TypeScript?",
], size=17, color=WHITE, marker_color=ACCENT, space_after=6)
pagenum(s, 22)

prs.core_properties.title = "TypeScript & Akal-akalan Static Typing"
prs.core_properties.author = "Velma"
OUT = "/home/jimmy-bot/.openclaw/workspace/slides/typescript-akal-akalan.pptx"
prs.save(OUT)
print("saved:", OUT, "| slides:", len(prs.slides._sldIdLst))
