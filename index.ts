import { backgroundImage } from './backgroundImage.ts';
const PORT = 3333;
import * as ejs from 'ejs'
import puppeteer from 'puppeteer';

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



Bun.serve({
	async fetch(req) {
		const file = await Bun.file('./index.html').text()
		const html = ejs.render(file, {
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
		})
		const res = await exportWebsiteAsPdf(html);

		return new Response(res, {
			headers: {
				'Content-Type': 'application/pdf',
			}
		})
	},
	port: PORT,
})

console.log(`Server listen on http://localhost:${PORT}`);
