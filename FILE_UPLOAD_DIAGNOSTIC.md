# File Upload 500 Error Diagnostic

## Analysis: Frontend vs Backend Issue

### Current Implementation (Frontend)
Based on the code in `fileUploadService.ts`:

**What we're sending:**
1. ✅ `file` field(s) - Multiple files appended correctly
2. ✅ `itemType` - e.g., "BANNER", "BLOG", "PRESCRIPTION", "CATEGORY"
3. ⚠️ `documentType` - **ONLY sent if `docTypes` array is provided**
4. ✅ `isCategory` - Only for category uploads

**Format:**
- Files: `formData.append('file', file)` for each file
- itemType: `formData.append('itemType', itemType)` 
- documentType: `formData.append('documentType', 'file1, file2')` (with space after comma) - **ONLY if docTypes provided**

### Curl Command (Working)
```bash
--form 'file=@"/path/to/file.png"'
--form 'itemType="PRESCRIPTION"'
--form 'documentType="file1, file2"'
```

### Potential Issues

#### Issue 1: Missing `documentType` Field (MOST LIKELY - FRONTEND ISSUE)
**Problem:** When blog/banner uploads are called WITHOUT `docTypes`, we don't send `documentType` at all.

**Current Code:**
```typescript
if (docTypes && docTypes.length > 0) {
  formData.append('documentType', documentTypeCSV);
}
// If no docTypes, documentType field is NOT sent
```

**Possible Fix:** Backend might require `documentType` field to always be present (even if empty):
```typescript
// Always send documentType (empty if not provided)
if (docTypes && docTypes.length > 0) {
  const documentTypeCSV = docTypes.join(', ');
  formData.append('documentType', documentTypeCSV);
} else {
  formData.append('documentType', ''); // Send empty string
}
```

#### Issue 2: Field Name Mismatch (POSSIBLE - NEEDS BACKEND CONFIRMATION)
**Problem:** Backend might expect `docType` instead of `documentType`

**Check:** Ask backend developer which field name they expect:
- `docType` (old format)
- `documentType` (curl format)

#### Issue 3: CSV Format (UNLIKELY - FORMAT MATCHES CURL)
**Current:** `"file1, file2"` (with space after comma) ✅ Matches curl
**Alternative:** `"file1,file2"` (no space)

#### Issue 4: Backend Validation (BACKEND ISSUE)
**Possible backend issues:**
- Backend might be validating `documentType` format incorrectly
- Backend might require `documentType` to match number of files
- Backend might have validation errors for BLOG/BANNER itemType

### Recommendation

**Try this fix first (Frontend):**
Always send `documentType` field, even if empty:

```typescript
// Always send documentType (empty string if not provided)
const documentTypeCSV = (docTypes && docTypes.length > 0) 
  ? docTypes.slice(0, files.length).join(', ')
  : '';
formData.append('documentType', documentTypeCSV);
```

**If that doesn't work, ask backend developer:**
1. Is `documentType` field required or optional?
2. What field name do you expect: `docType` or `documentType`?
3. What format do you expect: `"file1, file2"` or `"file1,file2"`?
4. Are there any validation rules for BLOG/BANNER uploads?
5. What's the exact error message in backend logs for the 500 error?

### Testing
Check browser Network tab to see:
1. What FormData fields are actually being sent
2. What the request payload looks like
3. What the 500 error response contains
