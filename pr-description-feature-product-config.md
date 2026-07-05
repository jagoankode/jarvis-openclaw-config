Link Ticket: IIAU-763, IIAU-765

📌 Summary:
Fix checkbox deselect not clearing value on LOB change + Revert fixed price to old approach in underwriting coverage.

🎯 Purpose / Background:
- IIAU-763: Checkbox cannot be unchecked after LOB change — RHF `undefined` value not properly clearing form state. Changed deselect/uncheck value from `undefined` to `''`. Also refactored LOB change logic to use `formContext.reset()` instead of manual `setValue` + `onChange` to ensure clean state reset across all fields.
- IIAU-765: Fixed price sum coverage amount caused regressions — revert to the simpler single field approach (`singleFixedPrice`) instead of the complex `_renderFixedPriceSumCoverageInsuredAmount` implementation.

🛠️ Key Changes:
- **Checkbox & ReactCheckbox** — Changed deselect value from `onChange(undefined)` to `onChange('')` to fix RHF reactivity
- **ProductConfigForm.hooks** — Refactored LOB change handler to use `formContext.reset()` with complete form value for clean state management
- **ProductConfigForm.type** — Added `ProductClasificationType.lob/cob` support for `null`; new `GetAfterSetLobParamsType` / `GetAfterSetLobReturnType` types
- **ProductConfigForm.component** — Updated `_renderCob` and `_openFeedbackModal` signatures to accept `null` LOB values
- **UnderwritingCoverage** — Revert from `hooks`-based approach (`UseUnderwritingCoverageHookReturn`) back to simpler `watch`/`setValue`; removed `_renderFixedPriceSumCoverageInsuredAmount`; restored `_renderFixedPrice` and `_renderFixedPriceInput`
- **UnderwritingCoverage.config** — `coverageItemParamsParser` now accepts `watch` instead of `hooks`
- **UnderwritingCoverage.type** — Added `singleFixedPrice` field; removed unused type dependencies
- **UnderwritingData.component** — Parent component adapted to reverted coverage config interface
- **UnderwritingMaterialFact** — Added `include !== 'Yes'` guard to prevent showing options column when not included

📸 Screenshots:
diisi oleh user
