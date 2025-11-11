#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const LABELS_FILE = path.join(__dirname, '../model-data/model/labels.json');
const OUTPUT_FILE = path.join(__dirname, '../../src/assets/data/bird-image-urls.json');
const RATE_LIMIT_MS = 1000; // 60 requests/minute (iNaturalist recommended limit)
const BATCH_SIZE = 50; // Save progress every 50 species

// iNaturalist API Configuration
const INATURALIST_API_BASE = 'https://api.inaturalist.org/v1';
const QUALITY_GRADE = 'research'; // Only get research-grade observations (verified)
const PHOTO_LICENSE = 'cc-by,cc-by-nc,cc-by-sa,cc-by-nc-sa,cc0'; // Creative Commons licenses

interface BirdSpecies {
  scientificName: string;
  commonName: string;
  fullLabel: string;
}

interface BirdImageData {
  scientificName: string;
  commonName: string;
  imageUrl: string;
  mediumUrl: string;
  largeUrl: string;
  thumbnailUrl: string;
  attribution: string;
  license: string;
  observationId: number;
  photoId: number;
  qualityGrade: string; // 'research' = community verified
  numIdentificationAgreements?: number; // How many people agreed on ID
  faves?: number; // Number of favorites (quality indicator)
}

interface ImageUrlMapping {
  [label: string]: BirdImageData | null;
}

interface ProgressData {
  completed: string[];
  failed: string[];
  lastProcessedIndex: number;
  mapping: ImageUrlMapping;
}

class BirdImageUrlFetcher {
  private species: BirdSpecies[] = [];
  private progress: ProgressData = {
    completed: [],
    failed: [],
    lastProcessedIndex: -1,
    mapping: {},
  };
  private progressFile = OUTPUT_FILE.replace('.json', '.progress.json');

  async init() {
    console.log('🐦 Bird Image URL Fetcher - iNaturalist');
    console.log('==========================================\n');

    // Load species
    this.loadSpecies();

    // Load progress if exists
    this.loadProgress();
  }

  private loadSpecies() {
    console.log(`📖 Reading labels from: ${LABELS_FILE}`);
    const labelsData = fs.readFileSync(LABELS_FILE, 'utf-8');
    const labels: string[] = JSON.parse(labelsData);

    this.species = labels.map((label) => {
      const [scientificName, ...commonNameParts] = label.split('_');
      return {
        scientificName,
        commonName: commonNameParts.join(' '),
        fullLabel: label,
      };
    });

    console.log(`✅ Loaded ${this.species.length} species\n`);
  }

  private loadProgress() {
    if (fs.existsSync(this.progressFile)) {
      this.progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf-8'));
      console.log(
        `📊 Resuming from previous run: ${this.progress.completed.length} completed, ${this.progress.failed.length} failed\n`
      );
    }
  }

  private saveProgress() {
    fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
  }

  private saveFinalOutput() {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(this.progress.mapping, null, 2));
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https
        .get(
          url,
          {
            headers: {
              'User-Agent': 'BirdNetImageFetcher/2.0 (iNaturalist URL Collector)',
              Accept: 'application/json',
            },
          },
          (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                if (res.statusCode !== 200) {
                  reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
                  return;
                }
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error(`Invalid JSON response: ${data.substring(0, 100)}`));
              }
            });
          }
        )
        .on('error', reject);
    });
  }

  private async searchiNaturalistImageUrl(
    scientificName: string,
    commonName: string
  ): Promise<BirdImageData | null> {
    const params = new URLSearchParams({
      taxon_name: scientificName,
      quality_grade: QUALITY_GRADE,
      photos: 'true',
      per_page: '10', // Get top 10 to have options
      order: 'desc',
      order_by: 'votes', // Prioritize most voted (quality) observations
      photo_license: PHOTO_LICENSE,
    });

    const apiUrl = `${INATURALIST_API_BASE}/observations?${params.toString()}`;

    try {
      const response = await this.fetchJson(apiUrl);

      if (!response.results || response.results.length === 0) {
        return null;
      }

      // Find the best observation with photos
      for (const obs of response.results) {
        if (obs.photos && obs.photos.length > 0) {
          const photo = obs.photos[0];

          // iNaturalist photo URLs have size variants
          const baseUrl = photo.url.replace('/square.', '/');
          const photoIdMatch = baseUrl.match(/\/photos\/(\d+)\//);
          const photoId = photoIdMatch ? parseInt(photoIdMatch[1]) : 0;

          return {
            scientificName,
            commonName,
            imageUrl: photo.url.replace('square', 'large'),
            mediumUrl: photo.url.replace('square', 'medium'),
            largeUrl: photo.url.replace('square', 'large'),
            thumbnailUrl: photo.url, // square is the thumbnail
            attribution: photo.attribution,
            license: photo.license_code || 'unknown',
            observationId: obs.id,
            photoId: photoId,
            qualityGrade: obs.quality_grade, // Will always be 'research' due to our filter
            numIdentificationAgreements: obs.num_identification_agreements,
            faves: obs.faves_count,
          };
        }
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  async fetchImageUrls() {
    const startIndex = this.progress.lastProcessedIndex + 1;
    const total = this.species.length;

    console.log(`🚀 Starting fetch from index ${startIndex}/${total}\n`);

    for (let i = startIndex; i < total; i++) {
      const species = this.species[i];

      // Skip if already processed
      if (
        this.progress.completed.includes(species.fullLabel) ||
        this.progress.failed.includes(species.fullLabel)
      ) {
        continue;
      }

      try {
        console.log(
          `[${i + 1}/${total}] 🔍 Searching: ${species.scientificName} (${species.commonName})`
        );

        const imageData = await this.searchiNaturalistImageUrl(
          species.scientificName,
          species.commonName
        );

        if (!imageData) {
          console.log(`   ⚠️  No images found`);
          this.progress.failed.push(species.fullLabel);
          this.progress.mapping[species.fullLabel] = null;
        } else {
          console.log(`   ✅ Found image (${imageData.license})`);
          console.log(`   📷 ${imageData.attribution}`);
          this.progress.completed.push(species.fullLabel);
          this.progress.mapping[species.fullLabel] = imageData;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        this.progress.failed.push(species.fullLabel);
        this.progress.mapping[species.fullLabel] = null;
      }

      // Update progress
      this.progress.lastProcessedIndex = i;

      // Save progress periodically
      if ((i + 1) % BATCH_SIZE === 0) {
        this.saveProgress();
        this.saveFinalOutput();
        console.log(`\n💾 Progress saved (${this.progress.completed.length} completed)\n`);
      }

      // Rate limiting
      await this.sleep(RATE_LIMIT_MS);
    }

    // Final save
    this.saveProgress();
    this.saveFinalOutput();

    // Print summary
    console.log('\n==========================================');
    console.log('✨ Fetch Complete!');
    console.log(`✅ Successfully found URLs: ${this.progress.completed.length}`);
    console.log(`❌ Failed: ${this.progress.failed.length}`);
    console.log(`📁 URLs saved to: ${OUTPUT_FILE}`);

    // Write failed species to file for review
    if (this.progress.failed.length > 0) {
      const failedFile = OUTPUT_FILE.replace('.json', '.failed.txt');
      fs.writeFileSync(failedFile, this.progress.failed.join('\n'));
      console.log(`📝 Failed species list: ${failedFile}`);
    }
  }
}

// Main execution
async function main() {
  const fetcher = new BirdImageUrlFetcher();
  await fetcher.init();
  await fetcher.fetchImageUrls();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
