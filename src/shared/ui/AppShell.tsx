import type { ReactNode } from 'react';

type AppShellProps = {
	children: ReactNode;
	toolbar: ReactNode;
};

export default function AppShell({ children, toolbar }: AppShellProps) {
	return (
		<div
			style={{
				maxWidth: 720,
				width: '100%',
				minWidth: 0,
				margin: '0 auto',
				padding: '20px 24px 0',
				fontFamily: 'system-ui, sans-serif',
				overflowX: 'hidden',
				height: '100svh',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{children}
			{toolbar}
		</div>
	);
}
