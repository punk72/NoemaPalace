export const imageUrlToBase64 = async (url: string): Promise<string> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('이미지 fetch 실패');
	}

	const blob = await response.blob();

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onloadend = () => {
			resolve(reader.result as string);
		};

		reader.onerror = () => {
			reject(new Error('FileReader 실패'));
		};

		reader.readAsDataURL(blob);
	});
};

export const fileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result as string);
		};

		reader.onerror = () => {
			reject(new Error('파일 변환 실패'));
		};

		reader.readAsDataURL(file);
	});
};

export const resizeImage = (base64: string, maxWidth = 300): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			try {
				const canvas = document.createElement('canvas');
				const ratio = img.width / img.height;

				const width = Math.min(maxWidth, img.width);
				const height = width / ratio;

				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext('2d');

				if (!ctx) {
					reject(new Error('Canvas context 생성 실패'));
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);

				const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
				resolve(resizedBase64);
			} catch (err) {
				reject(err);
			}
		};

		// 🔥 핵심 추가
		img.onerror = () => {
			reject(new Error('이미지 로드 실패'));
		};

		img.src = base64;
	});
};