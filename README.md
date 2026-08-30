# Web Scraping Track - Build a Polite Scraper

## Overview
This project builds a polite, robust, and validated web scraper in Node.js. It extracts 60 book records across 3 pages from `books.toscrape.com`, cleans raw text strings (e.g., converting `"£51.77"` to `51.77`), validates every record against a schema, handles errors gracefully without crashing, and saves the result to `books.json`.

---

## Polite Scraping Principles Implemented 🤝
1. **Robots & Rules Check:** Respects `robots.txt` guidelines of practice sites.
2. **Identification (User-Agent):** Sends a custom `User-Agent` header identify who is running the scraper and how to contact them.
3. **Rate Limiting (Delays):** Includes a mandatory 1-second delay between page requests to prevent server hammering.
4. **Resilience:** Wraps HTTP requests in `try/catch` blocks so broken pages or network timeouts do not break the execution loop.

---

## How to Run 🚀

1. Clone the repository and install dependencies:
1.5. تعديل README.md:كتابة التوثيق وشرح طريقة التشغيل.افتح ملف README.md واضغط على القلم ✏️ للتعديل.ضع المحتوى التالي بالكامل:Markdown# Web Scraping Track - Build a Polite Scraper

## Overview
This project builds a polite, robust, and validated web scraper in Node.js. It extracts 60 book records across 3 pages from `books.toscrape.com`, cleans raw text strings (e.g., converting `"£51.77"` to `51.77`), validates every record against a schema, handles errors gracefully without crashing, and saves the result to `books.json`.

---

## Polite Scraping Principles Implemented 🤝
1. **Robots & Rules Check:** Respects `robots.txt` guidelines of practice sites.
2. **Identification (User-Agent):** Sends a custom `User-Agent` header identify who is running the scraper and how to contact them.
3. **Rate Limiting (Delays):** Includes a mandatory 1-second delay between page requests to prevent server hammering.
4. **Resilience:** Wraps HTTP requests in `try/catch` blocks so broken pages or network timeouts do not break the execution loop.

---

## How to Run 🚀

1. Clone the repository and install dependencies:
bashnpm install
2. Run the scraper:
bashnpm start
3. Output will be generated at `books.json`.

---

## Data Schema (`books.json`)

json[{"title": "A Light in the Attic","price": 51.77,"availability": "In stock","rating": "Three"}]
---

## AI vs Me

### Prompt Used:
> "Write a Node.js web scraper using axios and cheerio that collects 60 books from 3 pages of books.toscrape.com. Include custom User-Agent, delay between requests, price parsing to numbers, schema validation, and error handling for broken pages."

### Comparisons & Findings:
1. **Rate Limiting:** AI generated sequential `axios.get` calls without any pause. Added `await sleep(1000)` between pages to ensure politeness.
2. **Price Parsing:** AI used `parseFloat(price.replace('£', ''))`, which breaks if other currency symbols or weird HTML entities appear. Replaced with regex `price.replace(/[^0-9.]/g, '')` for safety.
3. **Fault Tolerance:** AI's loop crashed completely when testing a simulated 404/500 error. Wrapped individual page fetches in `try/catch` returning an empty list to keep the rest of the execution alive.
