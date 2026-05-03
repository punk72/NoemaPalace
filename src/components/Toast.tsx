import { useEffect, useRef } from 'react';

type ToastProps = {
	message: string;
	onClose: () => void;
};

export default function Toast({ message, onClose }: ToastProps) {
    const onCloseRef = useRef(onClose);
    
	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		const timer = setTimeout(onCloseRef.current, 2000);
		return () => clearTimeout(timer);
	}, [message]);

	if (!message) return null;

	return (
		<div
			style={{
				position: 'fixed',
				top: 20,
				left: '50%',
				transform: 'translateX(-50%)',
				background: '#333',
				color: '#fff',
				padding: '10px 16px',
				borderRadius: 8,
				zIndex: 9999,
				fontSize: 14,
			}}
		>
			{message}
		</div>
	);
}