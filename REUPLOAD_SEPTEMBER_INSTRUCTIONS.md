# How to Fix Misaligned September Metrics

## Why Are the Metrics Still Wrong?

The September PDF was uploaded **BEFORE** the fix was deployed to Render. The incorrect data is stored in the MongoDB database and will continue to display incorrectly until you delete it and re-upload.

## Current Incorrect Values (What You're Seeing Now):
```
❌ SM Monthly Dwell Avg: 18.1 days     (should be N/A)
❌ SM YTD Dwell Avg: 5.3 days          (should be 1.9 days)
❌ Triage %: 87.2%                     (CORRECT)
❌ Triage Hours: 21.1 hrs              (should be 3 hrs)
❌ ETR %: 3%                           (should be 18.1%)
❌ % Cases 3+ Notes: 1.9%              (should be 21.1%)
❌ RDS Monthly: 5.6 days               (should be 5.3 days)
❌ RDS YTD: 100 days                   (should be 5.6 days)
```

## What They Should Be (Correct Values):
```
✅ VSC Case Requirements: 100%
✅ VSC Closed Correctly: 92%
✅ TT+ Activation: 99%
✅ SM Monthly Dwell Avg: N/A (or blank/dash)
✅ SM YTD Dwell Avg: 1.9 days
✅ Triage % < 4 Hours: 87.2%
✅ Triage Hours: 3 hrs
✅ ETR % of Cases: 18.1%
✅ % Cases with 3+ Notes: 21.1%
✅ RDS Monthly Avg Days: 5.3 days
✅ RDS YTD Dwell Avg Days: 5.6 days
```

## Step-by-Step Fix

### Option 1: Use the Delete Script (Recommended)

1. **Wait for Render deployment to complete** (2-3 minutes after push)
   - Go to https://dashboard.render.com
   - Check that your service shows "Live" status
   - Latest commit should be: "Fix: Correct PDF extraction for missing columns..."

2. **Run the delete script locally:**
   ```powershell
   cd backend
   node delete-september-data.js
   ```

3. **Re-upload September PDF:**
   - Go to your WKI Service Management App
   - Navigate to Wichita metrics
   - Click "Upload New Scorecard"
   - Select "W370 Service Scorecard September 2025.pdf"
   - Month: September, Year: 2025
   - Click Upload

4. **Verify the metrics are now correct:**
   - SM Monthly Dwell Avg should show N/A or blank
   - ETR % should show 18.1%
   - % Cases with 3+ Notes should show 21.1%
   - RDS YTD should show 5.6 days (not 100)

### Option 2: Delete via API (Alternative)

If the script doesn't work, you can delete via the API:

1. **Get all uploaded months:**
   ```powershell
   curl https://your-app.onrender.com/api/locationMetrics/history
   ```

2. **Find the September 2025 record ID**

3. **Delete it manually through MongoDB or contact me for help**

### Option 3: Re-upload with Different Month Name (Quick Workaround)

If you can't delete the old data immediately:

1. Upload September PDF as "September-Fixed" or "September-2"
2. This creates a new record without deleting the old one
3. View the new record to verify it's correct
4. Delete the old "September" record later

## Verification Checklist

After re-uploading, verify these specific values for Wichita:

- [ ] VSC Case Requirements: **100%** (not 96%)
- [ ] VSC Closed Correctly: **92%** (correct)
- [ ] TT+ Activation: **99%** (correct)
- [ ] SM Monthly Dwell Avg: **N/A or blank** (not 18.1)
- [ ] SM YTD Dwell Avg Days: **1.9** (not 5.3)
- [ ] Triage % < 4 Hours: **87.2%** (correct)
- [ ] Triage Hours: **3** (not 21.1)
- [ ] ETR % of Cases: **18.1%** (not 3%)
- [ ] % Cases with 3+ Notes: **21.1%** (not 1.9%)
- [ ] RDS Monthly Avg Days: **5.3** (not 5.6)
- [ ] RDS YTD Dwell Avg Days: **5.6** (not 100)

## Why This Happened

1. **First upload** (with old code): PDF extracted incorrectly, stored bad data in database
2. **Code fix deployed**: New extraction logic is correct, but database still has old data
3. **Data persists**: MongoDB keeps the incorrect data until explicitly deleted
4. **Re-upload needed**: Must delete old data and upload again with fixed code

## Debugging

If metrics are still wrong after re-upload, check backend logs:

```powershell
# In Render dashboard, view logs and look for:
"=== Processing Wichita Kenworth ==="
"Extracted tokens: [100%, 92%, 99%, 1.9, 87.2%, 3, 18.1%, 21.1%, 5.3, 5.6]"
"Found 10 values - parsing as 10-column format"
"✅ Parsed Wichita Kenworth - 10 values mapped to 11 fields"
```

If you see these logs, the extraction is working correctly.

If you see different tokens or errors, there may be another issue.

## Contact for Help

If you still see incorrect values after following these steps:

1. Share the backend logs from Render (specifically the lines showing "Processing Wichita Kenworth")
2. Share a screenshot of what you're seeing
3. Confirm which commit is deployed on Render

## Prevention for Future Uploads

Going forward, the fix is permanent. Any new PDF uploads (October, November, etc.) will be extracted correctly, even if they have missing columns.

---

**TL;DR**: The old incorrect data is cached in your database. Delete the September record and re-upload the PDF with the fixed code.
