// services/nlk.ts
import { normalizeIsbn } from '../utils/isbn';

export const fetchNlkBookByIsbn = async (isbn: string) => {
	const url = `/nlk_api/seoji/contents/S80100000000.do?schM=intgr_detail_view_isbn&isbn=${isbn}`;

    const cleanText = (value: string) => {
        return value
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const getField = (html: string, label: string) => {
        const pattern = new RegExp(
            `<li[^>]*>\\s*<strong>\\s*${label}\\s*<\\/strong>\\s*<div[^>]*>([\\s\\S]*?)<\\/div>\\s*<\\/li>`,
            'i'
        );

        const match = html.match(pattern);
        return match ? cleanText(match[1]) : '';
    };

    const getTitle = (html: string) => {
        const match = html.match(
            /<div class="tit">[\s\S]*?<\/b>\s*([^<]+)<\/div>/i
        );

        return match ? cleanText(match[1]) : '';
    };

    const getCoverUrl = (html: string) => {
        const match = html.match(
            /<div class="thumb">\s*<img[^>]+src="([^"]+)"/i
        );

        if (!match) return '';

        const src = match[1];

        if (src.includes('noImg')) return '';
        if (src.startsWith('http')) return src;
        if (src.startsWith('//')) return `https:${src}`;
        if (src.startsWith('/')) return `https://www.nl.go.kr${src}`;

        return `https://www.nl.go.kr/${src}`;
    };
    
	const res = await fetch(url);

	const html = await res.text();
	const title = getTitle(html);
    
	if (!title) return null;

	return {
		title: getTitle(html),
		author: getField(html, '저자'),
		publisher: getField(html, '발행처'),
		pubDate: getField(html, '발행\\(예정\\)일'),
		isbn13: normalizeIsbn(getField(html, 'ISBN')) || isbn,
		cover: getCoverUrl(html),
	};
};