# Quick Fix - Delete September Data via API

## Step 1: Wait for Render to Deploy (2-3 minutes)

Check https://dashboard.render.com to see when deployment completes.

## Step 2: Delete September 2025 Data

Run this command in PowerShell:

```powershell
# Replace YOUR-APP-URL with your actual Render app URL
curl -X DELETE https://YOUR-APP-URL.onrender.com/api/locationMetrics/2025/September
```

**Or if you know your exact URL:**
```powershell
curl -X DELETE https://wki-service-management-app.onrender.com/api/locationMetrics/2025/September
```

You should see:
```json
{
  "success": true,
  "message": "Successfully deleted metrics for September 2025",
  "deletedCount": 1
}
```

## Step 3: Re-upload September PDF

1. Go to your WKI Service Management App
2. Navigate to Wichita metrics  
3. Click "Upload New Scorecard"
4. Select: `W370 Service Scorecard September 2025.pdf`
5. Month: **September**, Year: **2025**
6. Click **Upload**

## Step 4: Verify Correct Values

Check that Wichita now shows:
- ✅ VSC Case Requirements: **100%**
- ✅ SM Monthly Dwell Avg: **N/A** (or blank)
- ✅ SM YTD Dwell Avg: **1.9 days**
- ✅ Triage Hours: **3 hrs**
- ✅ ETR %: **18.1%**
- ✅ % Cases 3+ Notes: **21.1%**
- ✅ RDS YTD: **5.6 days**

---

## If You Don't Know Your App URL

Find it in Render dashboard:
1. Go to https://dashboard.render.com
2. Click on your service
3. Look for the URL at the top (e.g., `https://wki-service-management-app.onrender.com`)
4. Use that URL in the curl command above

---

## Alternative: Delete via Browser

You can also use your browser:

1. Open this URL (replace with your actual URL):
   ```
   https://YOUR-APP-URL.onrender.com/api/locationMetrics/2025/September
   ```

2. Open browser developer tools (F12)

3. In the Console tab, run:
   ```javascript
   fetch('https://YOUR-APP-URL.onrender.com/api/locationMetrics/2025/September', {
     method: 'DELETE'
   }).then(r => r.json()).then(console.log)
   ```

---

**After deletion, immediately re-upload the September PDF to get the correct values!**
