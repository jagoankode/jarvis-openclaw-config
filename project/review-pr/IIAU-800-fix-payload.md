## 📋 PR Review: feat/IIAU-800-fix-payload → development

### ✅ Branch & Git Hygiene
- [x] Branch name: `feat/IIAU-800-fix-payload` — ✅ prefix sesuai convention
- [x] 6 files changed, +773 / −295 lines
- [x] 1 commit behind origin (fast-forwarded clean)

### ✅ Code Convention & Quality

- [x] **Module Architecture** — utils, hook, component, type, defaults dipisah sesuai arsitektur
- [x] **JSDoc** — semua public funcs (private `_` prefix) ada `@param` dan `@returns` ✅
- [x] **Private funcs** — konsisten pakai `_` prefix
- [x] **No `console.log`** ✅
- [x] **No `@ts-ignore` / `@ts-nocheck`** ✅
- [x] **No `any`** ⚠️ — beberapa function pake `Record<string, unknown>` yang acceptable untuk data transform
- [x] **RHF pattern** — destructured return objects ✅ (liat `Coverage.hook.ts`)

### ✅ ESLint — ⚠️ 1 Error
| File | Line | Error |
|------|------|-------|
| `Coverage.hook.ts` | 430 | Arrow function `useCoverageFieldArrays` has too many lines (54). Max 35. |

**Saran:** Pecah `useCoverageFieldArrays` jadi sub-hooks atau inline return objectnya di beberapa tempat.

### ✅ TypeScript — ⚠️ 2 Errors (PR scope)

| File | Line | Error |
|------|------|-------|
| `Coverage.hook.ts` | 482 | Type 'unknown' not assignable to `UseFieldArrayReplace<CoverageData, "additionalCoverage">` |
| `Coverage.hook.ts` | 483 | Type 'unknown' not assignable to `UseFieldArrayReplace<CoverageData, "interestInsured">` |

**Root cause:** `useCoverageFieldArraysSetup` return type diganti jadi `Record<string, unknown>` — makes sense for flexibility but the TS errors are because when destructuring in `useCoverageFieldArrays`, the value is `unknown`.

```
const fArr = useCoverageFieldArraysSetup(control);
// fArr.replaceAdditionalCoverage is 'unknown'
```

**Fix:** Kassih explicit type atau cast di assignment-nya:
```ts
const fArr = useCoverageFieldArraysSetup(control) as ReturnType<typeof useCoverageFieldArraysSetup>;
```
Atau lebih baik: ubah return type `useCoverageFieldArraysSetup` dari `Record<string, unknown>` jadi type asli.

3 other TS errors di luar scope PR (MaterialFact, FormSubmission test, user-management) — pre-existing.

### ✅ Jest Tests — ✅ All Pass
- 4 test suites, 11 tests, 2 snapshots — all passed
- Scope: FormSubmission (component, snap, container, container snap)

### ✅ Diff Assessment — Changes Summary

1. **`format-payload-decision-nb.json`** — Reset all sample data to empty strings. ✅ (clean test data)

2. **`WFNewBusiness.utils.ts`** — **Refactor besar:**
   - New: Coverage mapper context + 3 mapper functions (main, additional, interest insured)
   - New: Policy period parsing (`_parsePolicyPeriod`)
   - New: Total insured amount resolver (`_resolveTotalInsuredAmount`)
   - New: CoInsurance builder dengan LEADER/MEMBER pattern (`_buildNBCoInsurance`, `_buildLeaderRecord`, `_mapCoInsuranceMember`)
   - New: PolicySummary builder, installment builder, distribution channel dari product API
   - New: `_buildNBPayload` function menggantikan `mapSubmissionValuesToNBFormatAsync` yang di-refactor
   - Removed: `_getPlanFacts`, `_matchOption` (di-inline ke `_findFactOption`)
   - Removed: `_extractOriginalFacts`, `_fetchPlanDocumentData` (diganti `_extractProductDetailData`)
   - Reworked: `_resolveSingleFact` — optId priority dari `code` dulu baru `uuid` (sebelumnya `uuid` dulu)
   - Reworked: `_getFallbackFactOption` — origVal priority `id` dulu baru `code`
   - **Logic change:** `_mapCoverageItem` → sekarang `insuredAmount` dan `premiumRate` dari value langsung (bukan min/max config)
   - **Logic change:** `_mapMainCoverageItem` & `_mapInterestInsuredItem` — nambah field `coverageCodes` / `interestInsuredCodes` = `uuid`
   - **Logic change:** `premiumIllustration` — field berubah total, sekarang cuma `premiumSummary` + `totalSumInsured`
   - **Logic change:** `policyHolder` — nambah `companyCode` dan `companyName` dari product detail API
   - **Logic change:** CoInsurance — sekarang dibangun dari form `values.coInsuranceList` + product API, bukan dari originalJsonObject
   - **Logic change:** PlanDetail — semua field diisi dari product detail API (lob, product info, planDetail), bukan lagi dari form

3. **`Coverage.component.tsx`** — Fix: filter coverage pakai `originalIdx` instead of `fieldIndex`. ✅ fixing potential array indexing bug.

4. **`Coverage.hook.ts`** — Refactor:
   - New: `useFixedPremiumRateSync` — dedicated hook
   - Refactor: `useCoverageFieldArrays` — destructure dari intermediate vars
   - Refactor: `_executeRebuildCombineConfig` — extracted from useEffect for testability
   - Change: Include logic — `include: item.mandatory === 'Yes' ? 'Yes' : savedItem?.include || ''`

5. **`FormSubmission.defaults.ts`** — Default `include` changed from `'Yes'` to `''`. Meaning all fields start unchecked.

6. **`FormSubmission.type.ts`** — `generalClause` nambah field `policyClause`

### Verdict: ⚠️ **Needs Fix**

**Critical (must fix before merge):**
1. **ESLint** — `max-lines-per-function` di `Coverage.hook.ts` (line 430). Extract sub-function.
2. **TypeScript errors** — `useCoverageFieldArraysSetup` return type `Record<string, unknown>` menyebabkan 2 TS errors. Fix type.

**Suggestions / review notes:**
- `_buildNBPremiumIllustration` sekarang menghilang sebagian field (`productSummary`, `policyHolder`, `insuredObject`) — confirm ini intentional?
- CoInsurance LEADER share=100, commission=100, handlingFee=100 — apakah ini fixed atau placeholder?
- `_buildNBCoInsurance` path: `planData.inputCoInsurance === 'Yes'` nentuin leaderJp = 'Y'/'N' — tapi leader selalu 100% share, sementara `inputCoInsurance` mungkin nandain kalo ada anggota lain
- Perubahan `_resolveSingleFact` optId priority — dulu `uuid` > `code`, sekarang `code` > `uuid`. Confirm dengan backend schema.
