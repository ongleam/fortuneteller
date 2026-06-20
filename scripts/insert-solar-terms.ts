#!/usr/bin/env tsx

/**
 * Solar Terms Data Insertion Script
 *
 * This script reads solar terms data from data/solar_terms.json
 * and inserts it into the Supabase database.
 *
 * Usage:
 *   bun tsx scripts/insert-solar-terms.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { insertSolarTerms, getSolarTermsByYear, getSolarTermByYearAndName } from './db-client';

interface SolarTermData {
  year: number;
  term_name: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

interface SolarTermTime {
  month: number;
  day: number;
  hour: number;
  minute: number;
}

interface SolarTermsByYear {
  [year: string]: {
    [termName: string]: SolarTermTime;
  };
}

async function insertSolarTermsData() {
  try {
    console.log('🌅 Starting solar terms data insertion...');

    // Read JSON data file
    const dataPath = join(process.cwd(), 'data', 'solar_terms.json');
    const jsonData = readFileSync(dataPath, 'utf-8');
    const solarTermsByYear: SolarTermsByYear = JSON.parse(jsonData);

    // Convert new structure to flat array for database insertion
    const solarTermsData: SolarTermData[] = [];
    let totalTerms = 0;

    for (const [yearStr, termsData] of Object.entries(solarTermsByYear)) {
      const year = parseInt(yearStr);
      for (const [termName, termTime] of Object.entries(termsData)) {
        solarTermsData.push({
          year,
          term_name: termName,
          month: termTime.month,
          day: termTime.day,
          hour: termTime.hour,
          minute: termTime.minute,
        });
        totalTerms++;
      }
    }

    console.log(`📖 Read ${totalTerms} solar terms from JSON file across ${Object.keys(solarTermsByYear).length} years`);

    // Validate data structure
    for (const term of solarTermsData) {
      if (
        !term.year ||
        !term.term_name ||
        !term.month ||
        !term.day ||
        term.hour === undefined ||
        term.minute === undefined
      ) {
        throw new Error(`Invalid solar term data: ${JSON.stringify(term)}`);
      }
    }

    console.log('✅ Data validation passed');

    // Check for existing data and filter out duplicates
    console.log('🔍 Checking for existing data...');
    const newDataToInsert: SolarTermData[] = [];
    const duplicates: SolarTermData[] = [];
    
    for (const term of solarTermsData) {
      const existingTerm = await getSolarTermByYearAndName(term.year, term.term_name);
      if (existingTerm) {
        duplicates.push(term);
        console.log(`⚠️  Found existing data: ${term.year} ${term.term_name}`);
      } else {
        newDataToInsert.push(term);
      }
    }

    if (duplicates.length > 0) {
      console.log(`📝 Found ${duplicates.length} existing records, ${newDataToInsert.length} new records to insert`);
    } else {
      console.log(`📝 No existing data found, inserting all ${newDataToInsert.length} records`);
    }

    // Insert only new data
    if (newDataToInsert.length > 0) {
      await insertSolarTerms(newDataToInsert);
      console.log(`🎉 Successfully inserted ${newDataToInsert.length} new solar terms into database`);
    } else {
      console.log(`✅ No new data to insert - all records already exist in database`);
    }

    // Log summary by year
    if (newDataToInsert.length > 0) {
      const yearGroups = newDataToInsert.reduce(
        (acc, term) => {
          acc[term.year] = (acc[term.year] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      console.log('\n📊 Summary of inserted data by year:');
      Object.entries(yearGroups).forEach(([year, count]) => {
        console.log(`  ${year}: ${count} terms`);
      });
    }

    if (duplicates.length > 0) {
      const duplicateYearGroups = duplicates.reduce(
        (acc, term) => {
          acc[term.year] = (acc[term.year] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      console.log('\n📋 Summary of existing data by year:');
      Object.entries(duplicateYearGroups).forEach(([year, count]) => {
        console.log(`  ${year}: ${count} terms (already exists)`);
      });
    }

    console.log('\n🗂️  Available years in database after insertion:');
    const allYears = [...new Set([...newDataToInsert.map(t => t.year), ...duplicates.map(t => t.year)])].sort();
    allYears.forEach(year => {
      const newCount = newDataToInsert.filter(t => t.year === year).length;
      const existingCount = duplicates.filter(t => t.year === year).length;
      const totalCount = newCount + existingCount;
      console.log(`  ${year}: ${totalCount} terms ${newCount > 0 ? `(${newCount} new)` : '(all existing)'}`);
    });
  } catch (error) {
    console.error('❌ Failed to insert solar terms data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  insertSolarTermsData()
    .then(() => {
      console.log('\n✨ Solar terms data insertion completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Solar terms data insertion failed:', error);
      process.exit(1);
    });
}

export { insertSolarTermsData };
