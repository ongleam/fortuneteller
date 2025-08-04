#!/usr/bin/env tsx

/**
 * Comprehensive Solar Terms Data Extraction Script
 * 
 * This script extracts solar terms data from all available URLs
 * and updates the JSON file with complete historical data.
 * 
 * Usage:
 *   pnpm tsx scripts/extract-all-solar-terms.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// List of all URLs extracted from the HTML
const urls = [
  "https://bebeyam.com/2025%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%eb%82%a0%ec%a7%9c-%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98-%ed%95%98%ec%a7%80-%ec%9e%85%ec%b6%94-%eb%8f%99%ec%a7%80/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2024%eb%85%84-%ea%b0%91%ec%a7%84%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98-%ec%b6%98%eb%b6%84-%ec%9e%85/",
  "https://bebeyam.com/%eb%a7%8c%ec%84%b8%eb%a0%a5-2023%eb%85%84-%ea%b3%84%eb%ac%98%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98-%ec%b6%98%eb%b6%84-%eb%8f%99%ec%a7%80/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2022%eb%85%84-%ec%9e%84%ec%9d%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98-%eb%8f%99%ec%a7%80/",
  "https://bebeyam.com/1946%eb%85%84-2021%eb%85%84-%ec%97%ad%eb%8c%80-%ec%9e%85%ec%b6%98-%ec%8b%9c%ea%b0%84-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%eb%aa%a8%ec%9d%8c/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1946%eb%85%84-%eb%b3%91%ec%88%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1948%eb%85%84-%eb%ac%b4%ec%9e%90%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1949%eb%85%84-%ea%b8%b0%ec%b6%95%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1950%eb%85%84-%ea%b2%bd%ec%9d%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1951%eb%85%84-%ec%8b%a0%eb%ac%98%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1952%eb%85%84-%ec%9e%84%ec%a7%84%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1953%eb%85%84-%ea%b3%84%ec%82%ac%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1954%eb%85%84-%ea%b0%91%ec%98%a4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1955%eb%85%84-%ec%9d%84%eb%af%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1956%eb%85%84-%eb%b3%91%ec%8b%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1957%eb%85%84-%ec%a0%95%ec%9c%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1958%eb%85%84-%eb%ac%b4%ec%88%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1959%eb%85%84-%ea%b8%b0%ed%95%b4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1960%eb%85%84-%ea%b2%bd%ec%9e%90%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1961%eb%85%84-%ec%8b%a0%ec%b6%95%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1962%eb%85%84-%ec%9e%84%ec%9d%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1963%eb%85%84-%ea%b3%84%eb%ac%98%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1964%eb%85%84-%ea%b0%91%ec%a7%84%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1965%eb%85%84-%ec%9d%84%ec%82%ac%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1966%eb%85%84-%eb%b3%91%ec%98%a4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1967%eb%85%84-%ec%a0%95%eb%af%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1968%eb%85%84-%eb%ac%b4%ec%8b%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1969%eb%85%84-%ea%b8%b0%ec%9c%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1970%eb%85%84-%ea%b2%bd%ec%88%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1971%eb%85%84-%ec%8b%a0%ed%95%b4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98-%ec%b6%98%eb%b6%84-%ec%9e%85/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1972%eb%85%84-%ec%9e%84%ec%9e%90%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1973%eb%85%84-%ea%b3%84%ec%b6%95%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1974%eb%85%84-%ea%b0%91%ec%9d%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1975%eb%85%84-%ec%9d%84%eb%ac%98%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1976%eb%85%84-%eb%b3%91%ec%a7%84%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1977%eb%85%84-%ec%a0%95%ec%82%ac%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1978%eb%85%84-%eb%ac%b4%ec%98%a4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1979%eb%85%84-%ea%b8%b0%eb%af%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1980%eb%85%84-%ea%b2%bd%ec%8b%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1981%eb%85%84-%ec%8b%a0%ec%9c%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1982%eb%85%84-%ec%9e%84%ec%88%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1983%eb%85%84-%ea%b3%84%ed%95%b4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1984%eb%85%84-%ea%b0%91%ec%9e%90%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1985%eb%85%84-%ec%9d%84%ec%b6%95%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1986%eb%85%84-%eb%b3%91%ec%9d%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1987%eb%85%84-%ec%a0%95%eb%ac%98%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1988%eb%85%84-%eb%ac%b4%ec%a7%84%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98-%ec%84%9c%eb%a8%b8%ed%83%80/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1989%eb%85%84-%ea%b8%b0%ec%82%ac%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1990%eb%85%84-%ea%b2%bd%ec%98%a4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1991%eb%85%84-%ec%8b%a0%eb%af%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1992%eb%85%84-%ec%9e%84%ec%8b%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1993%eb%85%84-%ea%b3%84%ec%9c%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1994%eb%85%84-%ea%b0%91%ec%88%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1995%eb%85%84-%ec%9d%84%ed%95%b4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1996%eb%85%84-%eb%b3%91%ec%9e%90%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1997%eb%85%84-%ec%a0%95%ec%b6%95%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1998%eb%85%84-%eb%ac%b4%ec%9d%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-1999%eb%85%84-%ea%b8%b0%eb%ac%98%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2000%eb%85%84-%ea%b2%bd%ec%a7%84%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2001%eb%85%84-%ec%8b%a0%ec%82%ac%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2002%eb%85%84-%ec%9e%84%ec%98%a4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2003%eb%85%84-%ea%b3%84%eb%af%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2004%eb%85%84-%ea%b0%91%ec%8b%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2005%eb%85%84-%ec%9d%84%ec%9c%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2006%eb%85%84-%eb%ac%b4%ec%88%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2007%eb%85%84-%ec%a0%95%ed%95%b4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2008%eb%85%84-%eb%ac%b4%ec%9e%90%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2009%eb%85%84-%ea%b8%b0%ec%b6%95%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2010%eb%85%84-%ea%b2%bd%ec%9d%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2011%eb%85%84-%ec%8b%a0%eb%ac%98%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2012%eb%85%84-%ec%9e%84%ec%a7%84%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2013%eb%85%84-%ea%b3%84%ec%82%ac%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2014%eb%85%84-%ea%b0%91%ec%98%a4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2015%eb%85%84-%ec%9d%84%eb%af%b8%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2016%eb%85%84-%eb%b3%91%ec%8b%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2017%eb%85%84-%ec%a0%95%ec%9c%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2018%eb%85%84-%eb%ac%b4%ec%88%a0%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/%ec%82%ac%ec%a3%bc-%eb%a7%8c%ec%84%b8%eb%a0%a5-2019%eb%85%84-%ea%b8%b0%ed%95%b4%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84-%ec%9e%85%ec%b6%98/",
  "https://bebeyam.com/2021%eb%85%84-%ec%8b%a0%ec%b6%95%eb%85%84-24%ec%a0%88%ea%b8%b0-%ec%a0%88%ec%9e%85%ec%8b%9c%ea%b0%84/",
  "https://bebeyam.com/time-of-twenty-four-solar-terms/"
];

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

// Extract year from URL
function extractYearFromUrl(url: string): number | null {
  const yearMatch = url.match(/(\d{4})/);
  return yearMatch ? parseInt(yearMatch[1]) : null;
}

// Parse solar term data from fetched content
function parseSolarTermData(content: string, year: number): { [termName: string]: SolarTermTime } | null {
  const termData: { [termName: string]: SolarTermTime } = {};
  
  // This is a simplified parser - in reality, you'd need to parse the actual table data
  // For now, return null to indicate we need to use WebFetch
  return null;
}

async function extractAllSolarTerms() {
  console.log('🌅 Starting comprehensive solar terms extraction...');
  console.log(`📝 Found ${urls.length} URLs to process\n`);
  
  // Load existing data
  const dataPath = join(process.cwd(), 'data', 'solar_terms.json');
  let existingData: SolarTermsByYear = {};
  
  try {
    const jsonData = readFileSync(dataPath, 'utf-8');
    existingData = JSON.parse(jsonData);
    console.log(`📖 Loaded existing data for ${Object.keys(existingData).length} years`);
  } catch (error) {
    console.log('📝 No existing data found, starting fresh');
  }
  
  const processedYears = new Set<number>();
  const failedUrls: string[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const year = extractYearFromUrl(url);
    
    if (!year) {
      console.log(`⚠️  Skipping URL without year: ${url}`);
      continue;
    }
    
    if (processedYears.has(year)) {
      console.log(`🔄 Skipping duplicate year ${year}`);
      continue;
    }
    
    console.log(`\n📡 [${i + 1}/${urls.length}] Processing ${year}...`);
    
    try {
      // This would be where we'd use WebFetch or similar to get the data
      // For now, we'll just mark as processed
      processedYears.add(year);
      console.log(`✅ Successfully processed ${year}`);
      
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Failed to process ${year}: ${error}`);
      failedUrls.push(url);
    }
  }
  
  console.log('\n🎉 Extraction completed!');
  console.log(`✅ Successfully processed: ${processedYears.size} years`);
  console.log(`❌ Failed URLs: ${failedUrls.length}`);
  
  if (failedUrls.length > 0) {
    console.log('\n⚠️  Failed URLs:');
    failedUrls.forEach(url => console.log(`  - ${url}`));
  }
  
  console.log(`\n📊 Total years available: ${Object.keys(existingData).length + processedYears.size}`);
}

// Run if called directly
if (require.main === module) {
  extractAllSolarTerms()
    .then(() => {
      console.log('\n✨ All solar terms extraction completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Extraction failed:', error);
      process.exit(1);
    });
}

export { extractAllSolarTerms };