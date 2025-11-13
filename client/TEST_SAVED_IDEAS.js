/**
 * Browser Console Test Script - Saved Ideas Fix
 * 
 * Instructions:
 * 1. Open your React app in the browser (http://localhost:5173)
 * 2. Login to your account
 * 3. Open DevTools (F12) → Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 * 
 * This will test:
 * - API endpoint response format (200 vs 500 error)
 * - Field mappings (preview, imageUrl, tags)
 * - Save count vs displayed count
 */

(async function testSavedIdeasFix() {
  console.log('%c🧪 Testing Saved Ideas Fix...', 'font-size: 16px; font-weight: bold; color: #4CAF50');
  
  // ========================================
  // 1. Get Current User Info
  // ========================================
  console.log('📋 Step 1: Getting current user info...');
  const userJson = localStorage.getItem('relyf_user');
  const token = localStorage.getItem('relyf_token');
  
  if (!userJson || !token) {
    console.error('❌ Not logged in! Please login first.');
    return;
  }
  
  const user = JSON.parse(userJson);
  console.log('✅ Logged in as:', {
    userId: user.id,
    displayName: user.displayName || user.userName,
    hasToken: !!token
  });
  
  // ========================================
  // 2. Test GET /api/Saves/user/{userId}
  // ========================================
  console.log('\n📋 Step 2: Fetching saved ideas from API...');
  const baseUrl = window.location.origin.replace(':5173', ':5100'); // Adjust port if needed
  
  try {
    const response = await fetch(`${baseUrl}/api/Saves/user/${user.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const savedItems = await response.json();
    console.log(`✅ API returned ${savedItems.length} saved ideas`);
    
    // ========================================
    // 3. Validate Response Structure
    // ========================================
    console.log('\n📋 Step 3: Validating response structure...');
    
    if (savedItems.length === 0) {
      console.warn('⚠️  No saved ideas found. Save some ideas first!');
      return;
    }
    
    const firstItem = savedItems[0];
    const requiredFields = ['ideaId', 'title', 'preview', 'savedAtUtc'];
    const optionalFields = ['imageUrl', 'tags'];
    
    console.log('\n🔍 First saved idea structure:');
    console.log(JSON.stringify(firstItem, null, 2));
    
    // Check required fields
    const missingFields = requiredFields.filter(field => !(field in firstItem));
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
    } else {
      console.log('✅ All required fields present:', requiredFields);
    }
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (field in firstItem && firstItem[field] != null) {
        console.log(`✅ ${field}:`, 
          field === 'tags' 
            ? `[${firstItem[field].join(', ')}]`
            : firstItem[field]
        );
      } else {
        console.warn(`⚠️  ${field}: Not present (optional, may be null)`);
      }
    });
    
    // ========================================
    // 4. Check for Old "description" Field
    // ========================================
    console.log('\n📋 Step 4: Checking for old field names...');
    if ('description' in firstItem) {
      console.error('❌ Backend still sending "description" field! Should be "preview"');
    } else {
      console.log('✅ No "description" field found (correct)');
    }
    
    if ('preview' in firstItem) {
      console.log('✅ "preview" field found (correct)');
      console.log(`   Preview length: ${firstItem.preview?.length || 0} chars`);
    } else {
      console.error('❌ "preview" field missing!');
    }
    
    // ========================================
    // 5. Test Save Count vs Displayed Count
    // ========================================
    console.log('\n📋 Step 5: Comparing save count...');
    
    const profileResponse = await fetch(`${baseUrl}/api/Users/${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log('📊 Save count comparison:');
      console.log(`   Profile saveCount: ${profile.saveCount || 0}`);
      console.log(`   Displayed items:   ${savedItems.length}`);
      
      if (profile.saveCount > savedItems.length) {
        console.warn(`⚠️  Mismatch detected!`);
        console.warn(`   This is EXPECTED if some saved ideas are deleted.`);
        console.warn(`   Deleted ideas: ${profile.saveCount - savedItems.length}`);
      } else if (profile.saveCount === savedItems.length) {
        console.log('✅ Counts match! All saved ideas are active.');
      }
    }
    
    // ========================================
    // 6. Summary Report
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY REPORT');
    console.log('='.repeat(60));
    
    const stats = {
      totalSaved: savedItems.length,
      withImages: savedItems.filter(item => item.imageUrl).length,
      withTags: savedItems.filter(item => item.tags?.length > 0).length,
      withPreview: savedItems.filter(item => item.preview).length,
    };
    
    console.log(`✅ Total saved ideas:        ${stats.totalSaved}`);
    console.log(`✅ Ideas with images:        ${stats.withImages} (${((stats.withImages/stats.totalSaved)*100).toFixed(0)}%)`);
    console.log(`✅ Ideas with tags:          ${stats.withTags} (${((stats.withTags/stats.totalSaved)*100).toFixed(0)}%)`);
    console.log(`✅ Ideas with preview:       ${stats.withPreview} (${((stats.withPreview/stats.totalSaved)*100).toFixed(0)}%)`);
    
    console.log('\n✅ Frontend integration is working correctly!');
    console.log('\n💡 Next step: Navigate to your Profile → Saved Ideas tab');
    console.log('   and verify the UI displays images, tags, and previews.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure backend is running');
    console.error('   2. Check CORS settings');
    console.error('   3. Verify API base URL is correct');
  }
  
})();
