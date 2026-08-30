const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://books.toscrape.com/catalogue/';
const START_PAGES = [
  'page-1.html',
  'page-2.html',
  'page-3.html'
];

// Polite Scraper Config: Custom User-Agent & Delay
const customAxios = axios.create({
  headers: {
    'User-Agent': 'PoliteStudentScraper/1.0 (Contact: student@example.com)'
  },
  timeout: 10000
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parsePrice = (priceStr) => {
  if (!priceStr) return 0.0;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0.0;
};

const validateBook = (book) => {
  return (
    typeof book.title === 'string' && book.title.trim().length > 0 &&
    typeof book.price === 'number' && !isNaN(book.price) &&
    typeof book.availability === 'string' &&
    typeof book.rating === 'string'
  );
};

async function scrapePage(pageName) {
  const url = `${BASE_URL}${pageName}`;
  console.log(`Fetching: ${url}...`);

  try {
    const response = await customAxios.get(url);
    const $ = cheerio.load(response.data);
    const pageBooks = [];

    $('.product_pod').each((_, element) => {
      const title = $(element).find('h3 a').attr('title') || $(element).find('h3 a').text().trim();
      const rawPrice = $(element).find('.price_color').text().trim();
      const price = parsePrice(rawPrice);
      const availability = $(element).find('.instock.availability').text().trim();
      
      const ratingClass = $(element).find('.star-rating').attr('class') || '';
      const rating = ratingClass.replace('star-rating', '').trim() || 'Unknown';

      const book = { title, price, availability, rating };

      if (validateBook(book)) {
        pageBooks.push(book);
      } else {
        console.warn(`[Validation Warning] Skipping invalid record on page ${pageName}`);
      }
    });

    return pageBooks;
  } catch (error) {
    console.error(`[Scrape Error] Failed to fetch ${pageName}: ${error.message}`);
    return []; // Return empty array to survive broken page without crashing
  }
}

async function runScraper() {
  console.log("Starting polite book scraper...");
  let allBooks = [];

  for (let i = 0; i < START_PAGES.length; i++) {
    const pageName = START_PAGES[i];
    const books = await scrapePage(pageName);
    allBooks = allBooks.concat(books);

    // Polite delay (1 second) between requests
    if (i < START_PAGES.length - 1) {
      console.log("Waiting 1 second before next request...");
      await sleep(1000);
    }
  }

  console.log(`Scraping complete. Total valid books collected: ${allBooks.length}`);

  // Save results to clean JSON file
  fs.writeFileSync('books.json', JSON.stringify(allBooks, null, 2), 'utf-8');
  console.log("Data saved successfully to books.json");
}

runScraper();
