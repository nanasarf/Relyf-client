# Quick Test - Saved Ideas Fix Verification

## ✅ Frontend Status

All frontend code is **correctly implemented**:

- ✅ `Save` interface has `preview`, `imageUrl`, `tags` fields
- ✅ Profile.tsx uses `save.preview` (not `description`)
- ✅ UserProfile.tsx uses `save.preview` (not `description`)
- ✅ No TypeScript/compilation errors

## 🧪 Quick Backend Test

### Step 1: Test the API Endpoint

Open PowerShell and run:

```powershell
# Replace with your actual token and user ID
$token = "YOUR_TOKEN_HERE"
$userId = 4

$response = Invoke-RestMethod -Uri "https://localhost:5101/api/Saves/user/$userId" `
    -Headers @{ "Authorization" = "Bearer $token" } `
    -Method GET

Write-Host "✅ Success! Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 5
```

**Expected Success Response:**

```json
[
  {
    "ideaId": 5,
    "title": "Upcycle Bottle Into Vase",
    "preview": "Transform plastic bottles into...",
    "imageUrl": "https://...",
    "tags": ["Plastic", "DIY"],
    "savedAtUtc": "2025-01-12T10:30:00Z"
  }
]
```

### Step 2: Test in Browser Console

1. Login to your app
2. Open DevTools (F12) → Console
3. Run this:

```javascript
// Get your user info
const user = JSON.parse(localStorage.getItem("relyf_user"));
const token = localStorage.getItem("relyf_token");

console.log("Testing for user:", user.id);

// Test the API
fetch(`http://localhost:5101/api/Saves/user/${user.id}`, {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then((data) => {
    console.log("✅ API Response:", data);
    console.log("Total saves:", data.length);

    if (data.length > 0) {
      console.log("First item structure:", Object.keys(data[0]));
      console.log("Has preview?", "preview" in data[0]);
      console.log("Has imageUrl?", "imageUrl" in data[0]);
      console.log("Has tags?", "tags" in data[0]);
    }
  })
  .catch((err) => {
    console.error("❌ API Error:", err);
  });
```

### Step 3: Visual Test

1. Navigate to your Profile page
2. Click "Saved Ideas" tab
3. **Expected Results:**
   - ✅ Should see saved ideas (not empty)
   - ✅ Each idea shows image or "No Image" placeholder
   - ✅ Each idea shows title
   - ✅ Each idea shows preview text
   - ✅ Each idea shows tags (if available)
   - ✅ Shows "Saved on" timestamp

---

## 🐛 If You Still Get 500 Error

The backend `SaveRepository.cs` still has issues. Check for:

### Issue 1: Empty Tags List

Make sure the code handles empty results:

```csharp
if (savedIdeas.Any())
{
    var ideaIds = savedIdeas.Select(s => s.IdeaId).ToList();

    // ✅ Add this check
    if (ideaIds.Any())
    {
        // Load tags...
    }
}
```

### Issue 2: Immutable Tags Property

Make sure `SavedIdeaView.Tags` has a setter:

```csharp
public List<string> Tags { get; set; } = new();  // ✅ Has setter
// NOT:
public List<string> Tags { get; init; } = new(); // ❌ Immutable
```

### Issue 3: SQL IN Clause with Dapper

Make sure the parameter is properly formatted:

```csharp
var tagSql = @"
    SELECT it.IdeaId, t.TagName
    FROM app.IdeaTag it
    JOIN app.Tag t ON t.TagId = it.TagId
    WHERE it.IdeaId = ANY(@ideaIds);";  // ✅ Use ANY instead of IN

// OR use proper Dapper array parameter
var tagRows = await conn.QueryAsync<(int IdeaId, string TagName)>(
    tagSql,
    new { ideaIds = ideaIds.ToArray() }  // ✅ Convert to array
);
```

---

## 📊 Success Criteria

| Test                          | Expected Result                    | Status     |
| ----------------------------- | ---------------------------------- | ---------- |
| API returns 200               | ✅ Should get 200 OK               | ⬜ Test it |
| Response has `preview` field  | ✅ Should be present               | ⬜ Test it |
| Response has `imageUrl` field | ✅ Should be present (may be null) | ⬜ Test it |
| Response has `tags` field     | ✅ Should be present (may be [])   | ⬜ Test it |
| Profile page loads            | ✅ No errors                       | ⬜ Test it |
| Saved ideas display           | ✅ Shows images and tags           | ⬜ Test it |

---

## 🎯 Next Steps

1. **Run the PowerShell test** to verify backend is working
2. **Run the browser console test** to verify frontend can fetch data
3. **Navigate to Profile → Saved Ideas** to verify UI works
4. If any test fails, check the specific section above for fixes

---

**Last Updated:** 2025-01-13  
**Frontend Status:** ✅ Ready  
**Backend Status:** ⚠️ Needs verification (was returning 500)
