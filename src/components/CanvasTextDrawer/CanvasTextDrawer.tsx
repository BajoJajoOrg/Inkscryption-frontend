import React, { JSX, useEffect, useState } from 'react';
import { Button, Drawer, Input } from 'antd';
import { extractTextExternal } from ':lib';

function escapeRegExp(string: string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const CanvasTextDrawer = (): [JSX.Element, () => void] => {
	const [open, setOpen] = useState(false);
	const [text, setText] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [highlightIndex, setHighlightIndex] = useState(0);

	const showDrawer = () => {
		setOpen(true);
	};

	const onClose = () => {
		setOpen(false);
	};

	useEffect(() => {
		let interval: number;
		if (open) {
			interval = setInterval(() => {
				setText(
					localStorage.getItem('aitext') !== ''
						? String(localStorage.getItem('aitext'))
						: 'Ничего нет.'
				);
			}, 200) as unknown as number;
		}
		return () => {
			clearInterval(interval);
		};
	}, [open]);

	useEffect(() => {
		setHighlightIndex(0);
	}, [searchTerm, text]);

	let totalMatches = 0;
	let processedText: React.ReactNode = text;

	if (text && searchTerm) {
		const escapedSearchTerm = escapeRegExp(searchTerm);
		const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
		const parts = text.split(regex);

		processedText = parts.map((part, index) => {
			if (index % 2 === 1) {
				const currentMatchIndex = totalMatches;
				totalMatches++;
				return (
					<mark
						key={index}
						style={{
							backgroundColor: currentMatchIndex === highlightIndex ? '#ff0' : '#ffeeba',
							transition: 'background-color 0.3s',
						}}
					>
						{part}
					</mark>
				);
			} else {
				return <React.Fragment key={index}>{part}</React.Fragment>;
			}
		});
	}

	return [
		<Drawer title="Извлеченный текст" onClose={onClose} open={open}>
			<Button onClick={() => extractTextExternal()}>Извлечь текст</Button>
			<Input
				placeholder="Поиск"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				style={{ marginBottom: 16, marginTop: 16 }}
			/>
			<div style={{ marginBottom: 16 }}>
				<Button
					onClick={() => setHighlightIndex((prev) => Math.max(prev - 1, 0))}
					disabled={highlightIndex === 0}
					style={{ marginRight: 8 }}
				>
					Назад
				</Button>
				<Button
					onClick={() => setHighlightIndex((prev) => Math.min(prev + 1, totalMatches - 1))}
					disabled={totalMatches === 0 || highlightIndex >= totalMatches - 1}
				>
					Вперед
				</Button>
				<span style={{ marginLeft: 8 }}>
					{totalMatches > 0 ? `${highlightIndex + 1} из ${totalMatches}` : '0 совпадений'}
				</span>
			</div>
			<div className="text-container">{processedText}</div>
		</Drawer>,
		showDrawer,
	];
};
