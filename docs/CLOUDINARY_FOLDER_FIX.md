# Cloudinary Image 404 Error - Folder Configuration Fix

## Problem
Browser console shows 404 errors for all weight entry images from Cloudinary:

```
GET https://res.cloudinary.com/.../weight-entries/JX6326145070_foto1.jpg 404 (Not Found)
GET https://res.cloudinary.com/.../weight-entries/JX6325299334_foto2.jpg 404 (Not Found)
... (many more)
```

## Root Cause Analysis

### The Issue
Images are being requested from the `weight-entries` folder in Cloudinary, but:
- Code default folder: `selisih-berat` (see `.env.example`)
- Production folder: `weight-entries` (from error URLs)
- Mismatch between environment configuration and actual Cloudinary folder structure

### Code References
1. **Default folder:** `lib/config/env.ts:110` → `'selisih-berat'`
2. **Fallback folder:** `lib/utils/cloudinary.ts:176` → `'selisih_berat'`
3. **Upload folder:** `components/entry/photo-upload.tsx:33` → Uses env variable

## Possible Causes

### 1. Environment Variable Mismatch
**Most Likely Cause:**

The production environment has:
```bash
NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries
```

But either:
- Images were uploaded before this variable was set
- Variable was changed from `selisih-berat` to `weight-entries`
- Images exist in Cloudinary but in a different folder

### 2. Missing Images in Cloudinary
Images were never actually uploaded to Cloudinary successfully.

### 3. Cloudinary Upload Preset Mismatch
Upload preset is configured with a different folder than the code expects.

## Solution Steps

### Step 1: Verify Cloudinary Configuration

Check your production environment variables:

```bash
# Should be set to:
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ddzzlusek
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries  # ← Check this!
```

**Action:** Ensure `NEXT_PUBLIC_CLOUDINARY_FOLDER` matches the folder where images are stored.

### Step 2: Check Cloudinary Dashboard

1. Log into [Cloudinary Dashboard](https://cloudinary.com/console)
2. Go to **Media Library**
3. Check which folders exist:
   - `weight-entries/` ✓ or ✗
   - `selisih-berat/` ✓ or ✗
   - `selisih_berat/` ✓ or ✗

4. Verify if images exist in any of these folders

### Step 3: Choose Fix Strategy

#### Option A: Images Exist in Cloudinary (Different Folder)

If images exist but in wrong folder:

1. **Update environment variable** to match Cloudinary folder:
   ```bash
   # In production .env or Vercel env vars
   NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries
   ```

2. **Or rename folder in Cloudinary:**
   - Go to Cloudinary Media Library
   - Select all images in old folder
   - Bulk rename/move to new folder `weight-entries`

#### Option B: Images Don't Exist in Cloudinary

If images never uploaded successfully:

1. **Check upload preset configuration:**
   - Go to Cloudinary → Settings → Upload
   - Find your upload preset
   - Verify folder setting matches `NEXT_PUBLIC_CLOUDINARY_FOLDER`

2. **Check upload logs:**
   - Review server logs for upload errors
   - Check browser console during image upload

3. **Test image upload:**
   - Create a new weight entry with photo
   - Monitor network tab in browser DevTools
   - Verify image appears in Cloudinary dashboard

#### Option C: CORS Issues (Recent Change)

Recent commit `59a2704` mentions CORS fix for Cloudinary images.

If images exist but won't load:

1. **Verify Cloudinary CORS settings:**
   - Go to Cloudinary → Settings → Security
   - Allowed fetch domains should include your domain
   - Enable CORS headers

2. **Check Next.js image config:**
   ```js
   // next.config.js
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'res.cloudinary.com',
       },
     ],
   }
   ```

### Step 4: Fix Environment Variables

Update your production environment:

**Vercel:**
```bash
# Via Vercel dashboard
Settings → Environment Variables → Add
NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries

# Or via CLI
vercel env add NEXT_PUBLIC_CLOUDINARY_FOLDER
```

**Netlify:**
```bash
# Via Netlify dashboard
Site settings → Build & deploy → Environment → Add variable
NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries
```

**Docker/Self-hosted:**
```bash
# In .env.local or docker-compose.yml
NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries
```

### Step 5: Redeploy

After updating environment variables:

```bash
# Trigger new deployment
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push
```

Or use platform's redeploy button.

## Quick Diagnosis Script

Run this in browser console to check current configuration:

```javascript
// Check environment variables
console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('Folder:', process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER);

// Check a sample image URL
const sampleImage = document.querySelector('img[src*="cloudinary"]');
if (sampleImage) {
  console.log('Sample URL:', sampleImage.src);
  const match = sampleImage.src.match(/\/v\d+\/([^\/]+)\//);
  if (match) {
    console.log('Actual folder:', match[1]);
  }
}
```

## Prevention

### 1. Consistent Environment Variables

Use the same `NEXT_PUBLIC_CLOUDINARY_FOLDER` across all environments:

```bash
# .env.local (development)
NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries

# .env.production (production)
NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries

# .env.example (documentation)
NEXT_PUBLIC_CLOUDINARY_FOLDER=weight-entries
```

### 2. Upload Preset Configuration

Ensure Cloudinary upload preset has folder set:

```json
{
  "name": "your_preset_name",
  "unsigned": true,
  "folder": "weight-entries"
}
```

### 3. Add Validation

Add startup validation in `lib/config/env.ts`:

```typescript
// Warn if Cloudinary folder doesn't match expected
if (env.cloudinary.folder !== 'weight-entries') {
  console.warn(`⚠️  Cloudinary folder mismatch: expected 'weight-entries', got '${env.cloudinary.folder}'`);
}
```

## Verification

After applying fix:

1. **Create new weight entry with photos**
2. **Check browser console** - no more 404 errors
3. **Verify in Cloudinary** - image appears in correct folder
4. **Check existing entries** - old images should load

## Related Files

- Environment config: `lib/config/env.ts:110`
- Cloudinary utils: `lib/utils/cloudinary.ts:176`
- Photo upload: `components/entry/photo-upload.tsx:33`
- Example env: `.env.example:25`

## Support

If issues persist:

1. Share Cloudinary dashboard screenshot (folder structure)
2. Share network tab screenshot (failed requests)
3. Share environment variables (sanitized - no secrets!)
4. Check Cloudinary upload quota/limits

## References

- Cloudinary Folders: https://cloudinary.com/documentation/folders_uploads
- Next.js Env Vars: https://nextjs.org/docs/basic-features/environment-variables
- Recent CORS fix: Commit `59a2704`
