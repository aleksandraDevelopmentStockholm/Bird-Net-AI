# Bird Image Fetcher

Automatically downloads high-quality, research-grade bird images from iNaturalist for all species in `labels.json`.

## Features

- ✅ Fetches images for 6,500+ bird species from iNaturalist
- 🔬 **Research-grade observations only** - community-verified species IDs
- 📜 **Creative Commons licensed** - legal to use and redistribute
- 📊 Progress tracking with resume capability
- 🔄 Rate limiting (60 requests/minute, following iNaturalist guidelines)
- 📁 Batch saving every 50 species
- ❌ Error handling with failed species logging
- 🐦 Uses scientific names for accurate matching
- 📷 **Attribution tracking** - saves photographer credits and license info

## Usage

### Run the script

```bash
pnpm fetch-bird-images
```

### Output

Images are saved to: `infra/bird-images/`

For each species, you'll get:

- **Image file**: `abroscopus_albogularis_rufous-faced_warbler.jpg`
- **Attribution file**: `abroscopus_albogularis_rufous-faced_warbler.attribution.txt` (photographer credits and license)

Filenames are sanitized versions of the labels, e.g.:

- `abroscopus_albogularis_rufous-faced_warbler.jpg`
- `accipiter_cooperii_cooper_s_hawk.jpg`

### Progress tracking

The script automatically saves progress to `fetch-progress.json`:

- Resume from where you left off if interrupted
- Track completed and failed species
- Save every 50 species processed

### Failed species

Species without available images are logged to:
`infra/bird-images/failed-species.txt`

## Configuration

Edit `infra/scripts/fetch-bird-images.ts`:

```typescript
// Fetching Configuration
const RATE_LIMIT_MS = 1000; // Delay between API calls (1000ms = 60/min, iNaturalist recommends 60/min max)
const BATCH_SIZE = 50; // Save progress interval

// iNaturalist API Configuration
const QUALITY_GRADE = 'research'; // Only get research-grade observations (verified)
const PHOTO_LICENSE = 'cc-by,cc-by-nc,cc-by-sa,cc-by-nc-sa,cc0'; // Creative Commons licenses

// Security Configuration
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max file size
const MIN_FILE_SIZE = 1024; // 1KB minimum
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
```

## Security Features

The script includes multiple security layers to ensure downloaded images are safe:

### 1. **Pre-Download Validation**

- ✅ URL validation (only iNaturalist CDN and AWS S3 domains)
- ✅ File extension verification (.jpg, .png, .webp, .gif only)
- ✅ License verification (only Creative Commons licensed images)

### 2. **Download Security**

- ✅ User-Agent header required (prevents basic bot blocking)
- ✅ HTTP redirect handling (up to 5 redirects maximum)
- ✅ Status code validation (only 200 OK accepted)

### 3. **Post-Download Validation**

- ✅ File size verification (matches expected size)
- ✅ **Magic byte checking** - Verifies file headers to ensure it's actually an image:
  - JPEG: `FF D8 FF`
  - PNG: `89 50 4E 47`
  - GIF: `47 49 46`
  - WEBP: `57 45 42 50`
- ✅ Invalid files are automatically deleted

**Why magic bytes matter:** Even if a file has a `.jpg` extension, it could be a malicious executable or script. Magic byte checking reads the first bytes of the file to verify it's genuinely an image, preventing disguised malware.

## How it works

1. **Load species** from `labels.json` (format: `ScientificName_Common Name`)
2. **Query iNaturalist API** for research-grade observations with photos
3. **Sort by votes** to get the highest quality images
4. **Validate image URL** (iNaturalist CDN, extension, license)
5. **Download the best image** with redirect handling
6. **Verify downloaded file** using magic bytes
7. **Save attribution** (photographer, license, source URL)
8. **Save progress** periodically for resume capability
9. **Handle errors** gracefully and continue with next species

## API Source

Uses the [iNaturalist API v1](https://api.inaturalist.org/v1/docs/):

- **No API key required** for read-only access
- **Research-grade observations** - community-verified species IDs
- **Creative Commons licensing** - all images have proper attribution
- **Rate limit**: 60 requests/minute (we use exactly this limit)
- **Vote-based quality sorting** - highest quality images first

## Estimated Time

With 6,522 species and 1000ms (1 second) delay per request:

- ~1.8 hours total runtime
- Better image quality than Wikimedia due to community curation
- Some species may not have research-grade observations available
- Progress is saved automatically for interruptions

## Example Output

```
🐦 Bird Image Fetcher - iNaturalist
==========================================

📖 Reading labels from: /path/to/labels.json
✅ Loaded 6522 species

🚀 Starting fetch from index 0/6522

[1/6522] 🔍 Searching: Abroscopus albogularis (Rufous-faced Warbler)
   📥 Downloading from iNaturalist (cc-by)
   📷 Attribution: (c) carnifex, some rights reserved (CC BY)
   ✅ Saved: abroscopus_albogularis_rufous-faced_warbler.jpg
[2/6522] 🔍 Searching: Abroscopus schisticeps (Black-faced Warbler)
   ⚠️  No images found
[3/6522] 🔍 Searching: Example species (Example bird)
   🚫 URL validation failed: URL not from iNaturalist or trusted CDN
...

💾 Progress saved (50 completed)

==========================================
✨ Fetch Complete!
✅ Successfully downloaded: 5847
❌ Failed: 675
📁 Images saved to: /path/to/bird-images
📝 Failed species list: /path/to/failed-species.txt
```

## Troubleshooting

**Script crashes or is interrupted:**

- Just run `pnpm fetch-bird-images` again - it will resume from where it left off

**"Invalid JSON response" errors:**

- Check your internet connection
- iNaturalist may be rate limiting - verify `RATE_LIMIT_MS` is at least 1000ms (60 requests/min)

**No images found for many species:**

- Some birds may not have research-grade observations on iNaturalist
- Rare or recently described species may lack high-quality observations
- Scientific names must match exactly
- Check `failed-species.txt` for the list

**Want to retry failed species:**

- Delete the failed species from `fetch-progress.json`
- Or delete the entire file to start fresh

**Attribution files:**

- Each image has a corresponding `.attribution.txt` file
- This contains photographer credits and license information
- Keep these files for proper attribution and legal compliance
