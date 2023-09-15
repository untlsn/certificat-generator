import { backgroundImage } from './backgroundImage.ts';
const PORT = 3333;
import * as ejs from 'ejs'
import puppeteer from 'puppeteer';
import { Hono } from 'hono'

async function exportWebsiteAsPdf(html: string) {
	// Create a browser instance
	const browser = await puppeteer.launch({
		headless: 'new'
	});
	// Create a new page
	const page = await browser.newPage();
	await page.setContent(html, { waitUntil: 'domcontentloaded' });
	// To reflect CSS used for screens instead of print
	await page.emulateMediaType('screen');
	// Download the PDF
	const PDF = await page.pdf({
		margin: { right: '1px', left: '1px', top: '1px', bottom: '1px' },
		printBackground: true,
		format: 'A4',
	});
	// Close the browser instance
	await browser.close();
	return PDF;
}

const app = new Hono();
const defaultQuery = {
	background: backgroundImage,
	name: 'Marek Floriańczyk',
	title: 'Franki',
	score: 84,
	avg: 78,
	time: {
		min: 1,
		sec: 20,
	},
	place: 7334,
	count: 123,
	date: '2023.08.07'
}

app.get('/', async (c) => {
	const file = await Bun.file('./index.html').text()
	const query = c.req.query();
	const safeQuery = new Proxy(query, {
		get(target, p: string) {
			return target[p] ?? defaultQuery[p]
		}
	})

	const html = ejs.render(file, {
		background: backgroundImage,
		name: safeQuery.name,
		title: safeQuery.title,
		score: +safeQuery.score,
		avg: +safeQuery.avg,
		time: {
			min: +safeQuery.min,
			sec: +safeQuery.sec,
		},
		place: +safeQuery.place,
		count: +safeQuery.count,
		date: safeQuery.date,
	})
	const res = await exportWebsiteAsPdf(html);

	return new Response(res, {
		headers: {
			'Content-Type': 'application/pdf',
		}
	})
})

Bun.serve({
	fetch: app.fetch,
	port: PORT,
})

console.log(`Server listen on http://localhost:${PORT}`);
