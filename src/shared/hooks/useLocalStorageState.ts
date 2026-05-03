import { useEffect, useState } from 'react';

export function useLocalStorageState<T extends string | boolean>(
	key: string,
	defaultValue: T,
) {
	const [value, setValue] = useState<T>(() => {
		const storedValue = localStorage.getItem(key);
		if (storedValue === null) return defaultValue;

		if (typeof defaultValue === 'boolean') {
			return (storedValue === 'true') as T;
		}

		return storedValue as T;
	});

	useEffect(() => {
		localStorage.setItem(key, String(value));
	}, [key, value]);

	return [value, setValue] as const;
}
