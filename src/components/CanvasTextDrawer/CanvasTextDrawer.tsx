import React, { JSX, useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { extractTextExternal } from ':lib';
import styles from './styles.module.scss';

function escapeRegExp(string: string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const CanvasTextDrawer = (): [JSX.Element, () => void] => {
	const [open, setOpen] = useState(false);
	const [text, setText] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [highlightIndex, setHighlightIndex] = useState(0);

	const showModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	useEffect(() => {
		let interval: number;
		if (open) {
			interval = setInterval(() => {
				const stored = localStorage.getItem('aitext') || '';
				setText(stored !== '' ? stored : 'Ничего нет.');
			}, 200) as unknown as number;
		}
		return () => clearInterval(interval);
	}, [open]);

	useEffect(() => {
		setHighlightIndex(0);
	}, [searchTerm, text]);

	let totalMatches = 0;
	let processedText: React.ReactNode = text;

	if (text && searchTerm) {
		const escaped = escapeRegExp(searchTerm);
		const regex = new RegExp(`(${escaped})`, 'gi');
		const parts = text.split(regex);

		processedText = parts.map((part, index) => {
			if (index % 2 === 1) {
				const matchIndex = totalMatches++;
				return (
					<mark
						key={index}
						className={matchIndex === highlightIndex ? styles.activeMark : styles.mark}
					>
						{part}
					</mark>
				);
			}
			return <React.Fragment key={index}>{part}</React.Fragment>;
		});
	}

	return [
		<Modal
			title="Извлеченный текст"
			open={open}
			onCancel={closeModal}
			footer={null}
			width={700}
			className={styles.modalWrapper}
		>
			<div className={styles.controls}>
				<Button onClick={extractTextExternal} className="customModalButton">
					Извлечь текст
				</Button>
				<input
					type="text"
					placeholder="Поиск"
					className={styles.searchInput}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<div className={styles.highlightControls}>
					<Button
						onClick={() => setHighlightIndex((prev) => Math.max(prev - 1, 0))}
						disabled={highlightIndex === 0}
						className="customModalButton"
					>
						Назад
					</Button>
					<Button
						onClick={() => setHighlightIndex((prev) => Math.min(prev + 1, totalMatches - 1))}
						disabled={totalMatches === 0 || highlightIndex >= totalMatches - 1}
						className="customModalButton"
					>
						Вперед
					</Button>
					<span>
						{totalMatches > 0 ? `${highlightIndex + 1} из ${totalMatches}` : '0 совпадений'}
					</span>
				</div>
			</div>

			<div className={styles.textContainer}>{processedText}</div>
		</Modal>,
		showModal,
	];
};
