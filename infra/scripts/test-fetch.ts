#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INATURALIST_API_BASE = 'https://api.inaturalist.org/v1';
const QUALITY_GRADE = 'research';
const PHOTO_LICENSE = 'cc-by,cc-by-nc,cc-by-sa,cc-by-nc-sa,cc0';
const OUTPUT_DIR = path.join(__dirname, '../bird-images-test');

// Test with just 2 species
const TEST_SPECIES = [
  'Passer domesticus', // House Sparrow - very common, should definitely have images
  'Cyanocitta cristata', // Blue Jay - also common
];

async function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'BirdNetImageFetcher/2.0 (iNaturalist Test)',
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

async function testFetch(scientificName: string) {
  console.log(`\n🔍 Testing: ${scientificName}`);

  const params = new URLSearchParams({
    taxon_name: scientificName,
    quality_grade: QUALITY_GRADE,
    photos: 'true',
    per_page: '5',
    order: 'desc',
    order_by: 'votes',
    photo_license: PHOTO_LICENSE,
  });

  const apiUrl = `${INATURALIST_API_BASE}/observations?${params.toString()}`;

  console.log(`📡 API URL: ${apiUrl}\n`);

  try {
    const response = await fetchJson(apiUrl);

    console.log(`✅ Total results: ${response.total_results}`);
    console.log(`📦 Results in this page: ${response.results?.length || 0}`);

    if (response.results && response.results.length > 0) {
      const firstObs = response.results[0];
      console.log(`\n📸 First observation:`);
      console.log(`   - ID: ${firstObs.id}`);
      console.log(`   - Quality: ${firstObs.quality_grade}`);
      console.log(`   - Photos: ${firstObs.photos?.length || 0}`);

      if (firstObs.photos && firstObs.photos.length > 0) {
        const photo = firstObs.photos[0];
        console.log(`\n🖼️  First photo:`);
        console.log(`   - URL: ${photo.url}`);
        console.log(`   - Large URL: ${photo.url.replace('square', 'large')}`);
        console.log(`   - Attribution: ${photo.attribution}`);
        console.log(`   - License: ${photo.license_code || 'unknown'}`);
      }
    } else {
      console.log(`⚠️  No results found`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function main() {
  console.log('🧪 iNaturalist API Test');
  console.log('======================\n');

  for (const species of TEST_SPECIES) {
    await testFetch(species);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limit
  }

  console.log('\n✨ Test complete!');
}

main().catch(console.error);
