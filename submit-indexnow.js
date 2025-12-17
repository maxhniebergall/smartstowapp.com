#!/usr/bin/env node

/**
 * IndexNow URL Submission Script
 * Submits URLs to IndexNow (api.indexnow.org) to notify search engines of updates
 *
 * Usage: node submit-indexnow.js [url1] [url2] ...
 * Or: node submit-indexnow.js (submits default pages)
 */

const https = require('https');

const INDEXNOW_KEY = '6d9af243f9b246a5bbcfb9e406f2bcf4';
const INDEXNOW_API = 'api.indexnow.org';
const KEY_LOCATION = 'https://smartstowapp.com/6d9af243f9b246a5bbcfb9e406f2bcf4.txt';

// Default URLs to submit if none provided
const DEFAULT_URLS = [
  'https://smartstowapp.com/',
  'https://smartstowapp.com/blog/',
  'https://smartstowapp.com/calculator/',
  'https://smartstowapp.com/privacy-policy.html',
  'https://smartstowapp.com/terms-and-conditions.html',
  'https://smartstowapp.com/account-deletion.html',
];

function submitToIndexNow(urls) {
  const payload = {
    host: 'smartstowapp.com',
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  const postData = JSON.stringify(payload);

  const options = {
    hostname: INDEXNOW_API,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log('✓ Successfully submitted to IndexNow');
          console.log(`  URLs submitted: ${urls.length}`);
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          console.error(`✗ IndexNow submission failed with status ${res.statusCode}`);
          if (data) console.error(`  Response: ${data}`);
          resolve({ success: false, statusCode: res.statusCode, data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('✗ Error submitting to IndexNow:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  const urlsToSubmit = process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : DEFAULT_URLS;

  console.log('IndexNow Submission Script');
  console.log('------------------------');
  console.log(`Host: smartstowapp.com`);
  console.log(`URLs to submit: ${urlsToSubmit.length}\n`);

  try {
    await submitToIndexNow(urlsToSubmit);
  } catch (error) {
    process.exit(1);
  }
}

main();
