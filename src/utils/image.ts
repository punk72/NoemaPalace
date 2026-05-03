export async function imageUrlToBase64(url: string): Promise<string> {
	const response = await fetch(url);
	const blob = await response.blob();

	return fileToBase64(blob);
}

export function fileToBase64(file: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;

		reader.readAsDataURL(file);
	});
}

export async function resizeImage(base64: string, maxWidth = 300): Promise<string> {
	return new Promise((resolve) => {
		const img = new Image();
		img.src = base64;

		img.onload = () => {
			const canvas = document.createElement('canvas');
			const scale = maxWidth / img.width;

			canvas.width = maxWidth;
			canvas.height = img.height * scale;

			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			resolve(canvas.toDataURL('image/jpeg', 0.7));
		};
	});
}