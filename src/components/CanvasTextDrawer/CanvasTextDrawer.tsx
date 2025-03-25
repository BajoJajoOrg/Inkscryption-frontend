import React, { useEffect, useRef, useState } from 'react';
import { Button, Drawer } from 'antd';

export const CanvasTextDrawer: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [text, setText] = useState<string | null>('');

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
				setText(localStorage.getItem('aitext'));
			}, 200) as unknown as number;
		}
		return () => {
			clearInterval(interval);
		};
	}, [open]);

	return (
		<>
			<Button type="primary" onClick={showDrawer}>
				Посмотреть текст
			</Button>
			<Drawer title="Detected text" onClose={onClose} open={open}>
				<p>{text}</p>
			</Drawer>
		</>
	);
};
