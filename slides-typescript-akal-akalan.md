# TypeScript: Static Typing "Akal-akalan" di Atas Dynamic JavaScript?

---

## Slide 1 — Judul

**TypeScript & "Akal-akalan" Static Typing**

Kenapa TypeScript dianggap cuma "ilusi" type safety
di atas runtime JavaScript yang dynamic?

🧪 Riset oleh Velma

---

## Slide 2 — TypeScript Itu Apa?

- **Superset JavaScript** — semua JS valid = TS valid
- Menambahkan **static type annotations**
- Di-compile (transpile) → JavaScript biasa
- Dibuat Microsoft, dirancang oleh **Anders Hejlsberg** (C#, Delphi, Turbo Pascal)
- Rilis 2012, sekarang **dominasi ekosistem JS**

**Fakta kunci:**
TS types **hanya ada di compile time**. Di runtime, browser/Node.js cuma lihat JavaScript polos. Types-nya **dihapus (erased)** saat kompilasi.

---

## Slide 3 — Kenapa Disebut "Akal-akalan"?

Kritik utama dari komunitas purist static typing:

**"TypeScript cuma ilusi type safety — karena runtime-nya tetap JavaScript yang dynamic."**

8 alasan kenapa:

---

## Slide 4 — #1 Type Erasure

Types **hilang total** setelah compile:

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```
↓ compile ↓
```javascript
function add(a, b) {
  return a + b;
}
```

**Masalah:** Runtime gak bisa enforce types. Kalo bug lolos compile check → gak ada safety net.

Bandingkan: Java/C# punya type info di runtime (reflection, runtime checks).

---

## Slide 5 — #2 `any` — Pintu Darurat

`any` = **opt-out total** dari type system

```typescript
const data: any = fetchSomething();
data.foo.bar.baz(); // ✅ No TypeScript error
                     // 💥 Runtime crash
```

`any` bersifat **infectious** — menyebar ke seluruh codebase karena TS menganggap `any` assignable ke/dari tipe apa pun.

---

## Slide 6 — #3 Type Assertion Bisa "Bohong"

`as` keyword bisa override type checker:

```typescript
const response = await fetch("/api/user");
const user = response.json() as User;
// TypeScript percaya aja — padahal API bisa return apa aja
```

**Gak ada runtime validation.** Developer bisa "bohong" ke compiler.

---

## Slide 7 — #4 External Data = Blind Spot

Data dari luar aplikasi **selalu unknown di runtime**:

- API responses
- localStorage
- Form input
- URL params

```typescript
const stored = localStorage.getItem("user");
const user: User = JSON.parse(stored);
// TS oke, tapi stored bisa corrupted
```

**Ironi:** Butuh library tambahan (Zod, Yup, io-ts) untuk runtime validation — justru ngebuktiin TS aja gak cukup.

---

## Slide 8 — #5 Gradual Typing = False Safety

TypeScript **bukan sound type system** — sengaja mengizinkan unsound behavior:

```typescript
const nums: number[] = [1, 2, 3];
const stuff: any[] = nums;   // ✅ OK — structural typing
stuff.push("haha");          // ✅ No error
nums[3].toFixed(2);          // 💥 "haha".toFixed is not a function
```

Di Rust/OCaml, kasus kayak gini **gak mungkin terjadi**.

---

## Slide 9 — #6 Declaration Files Bisa Ngaco

Ekosistem TS bergantung pada `@types/*` (`.d.ts` files)

- **Dikelola terpisah** dari library aslinya
- Bisa **outdated, incomplete, atau salah**
- TypeScript **percaya begitu aja** ke definisi yang ada

---

## Slide 10 — #7 Runtime Behavior Gak Berubah

TypeScript secara prinsip **tidak mengubah runtime JavaScript**

Semua quirk JS tetap ada:
- Type coercion (`"" == 0` → `true`)
- `this` binding aneh
- `typeof null === "object"`
- Prototypal inheritance

TS cuma kasih peringatan di editor — runtime tetap jalan apa adanya.

---

## Slide 11 — #8 "Superset" = Batasan Inheren

Karena harus **100% kompatibel dengan JavaScript**:

- Gak bisa bikin enum yang aman
- Gak bisa proper nominal typing
- Gak bisa fix bug lama JavaScript
- Gak bisa nambah fitur yang perlu runtime support

TS **terikat** sama JavaScript — gak bisa lebih baik dari JavaScript itu sendiri.

---

## Slide 12 — Tapi... Tetep Worth It! (Counterarguments)

Meskipun "akal-akalan", TypeScript tetap **lompatan besar** buat ekosistem JS.

---

## Slide 13 — ✅ #1 Catch Errors Before Production

Mayoritas bug JS adalah **type-related**. TS catch di editor/CI:

| Tanpa TS | Dengan TS |
|----------|-----------|
| Typo property → runtime error | ❌ Caught saat ngetik |
| Argumen salah jumlah | ❌ Caught compile time |
| Null/undefined access | ❌ Caught (strict null) |
| Function kurang implementasi | ❌ Caught compile |

---

## Slide 14 — ✅ #2 Developer Experience

- **Autocomplete** akurat — gak perlu cek dokumentasi terus
- **Refactoring aman** — rename/ekstrak tanpa takut break
- **Go-to-definition** — navigasi kode cepat
- **Self-documenting** — types = dokumentasi inline

Gak mungkin dicapai di JS tanpa TS (atau JSDoc yang verbose).

---

## Slide 15 — ✅ #3 Strict Mode = Mitigasi

`tsconfig.json` → `"strict": true`

- `noImplicitAny` → gak boleh `any` implisit
- `strictNullChecks` → `null`/`undefined` harus explicit
- `strictFunctionTypes` → type check lebih ketat
- `noUncheckedIndexedAccess` → array/object access bisa `undefined`

Semakin ketat config → semakin kecil "pintu darurat" yang terbuka.

---

## Slide 16 — ✅ #4 Structural Typing = Kekuatan, Bukan Bug

TS pakai **structural typing** (duck typing) — dua object dengan shape sama = compatible.

**Bukan kelemahan, tapi desain sadar** — cocok dengan sifat JavaScript yang memang duck-typed. Lebih fleksibel dari nominal typing tanpa kehilangan safety berarti.

---

## Slide 17 — ✅ #5 Runtime Validation Bisa Dilapis

Best practice modern:

```
┌─────────────────────────────────┐
│  TypeScript (compile time)      │  ← Catch 90% bug di development
├─────────────────────────────────┤
│  Zod / Yup (runtime boundary)   │  ← Validasi external data
├─────────────────────────────────┤
│  JavaScript (runtime)           │  ← Eksekusi
└─────────────────────────────────┘
```

Kombinasi ini powerful — **TS bukan pengganti runtime validation, tapi partner**.

---

## Slide 18 — ✅ #6 Adopsi Luas

TypeScript **mendominasi** ekosistem JS modern:

- Next.js, Deno, Bun, Angular — TS-first
- Prisma, tRPC, TanStack Query — dibangun di atas TS types
- StackOverflow Developer Survey — TS di top 5 most loved/admired

**Bukti bahwa trade-off yang diambil TypeScript berhasil.**

---

## Slide 19 — Apakah Benar-benar "Akal-akalan"?

**Iya, KARENA:**
- Types hilang di runtime — cuma "ilusi" type safety
- `any` dan `as` bisa bypass
- Tetap perlu runtime validation
- Gak bisa fix fundamental JS quirk

**Tidak, KARENA:**
- Ini **design choice**, bukan kelemahan
- Semua compiled language juga "kehilangan" types di binary (C, C++, Rust, Go)
- Gak ada yang nyebut mereka "akal-akalan"
- TS dari awal emang **gradual typing**, bukan fully sound

---

## Slide 20 — Trade-off yang Terbukti Berhasil

```
Purist Static     ←────────── TypeScript ──────────→     Dynamic JS
(Rust/Haskell)          (gradual typing)                (Zero safety)
   |                          |                              |
   └── 100% safe              └── 90% safe                  └── 0% safe
       tapi rigid                 cukup untuk                   fleksibel total
                                  real-world apps              tapi rawan bug
```

TS ambil posisi **pragmatis** di tengah — dan terbukti jadi sweet spot.

---

## Slide 21 — Kesimpulan

**TypeScript bukan silver bullet.**
Dia **compile-time safety layer**, bukan runtime safety layer.

Tapi udah cukup untuk **eliminate 90%+ kategori bug** di JavaScript.

Kritik "akal-akalan" biasanya dari perspektif **purist static typing** — tapi dari perspektif JS developer yang sebelumnya **zero type safety**, TypeScript adalah **lompatan revolusioner**.

**Real-world engineering = pragmatic trade-offs, bukan purity.**

---

## Slide 22 — Q&A / Diskusi

🧪 Ada pertanyaan?

Topik lanjutan:
- TypeScript vs Rust/Go (pure static)
- Best practice mitigasi (Zod + strict TS)
- Kapan gak perlu TypeScript?
