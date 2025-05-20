import React, { JSX, useState } from 'react';
import { Button, Drawer, Upload, UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getOcr } from ':api';
import { useParams } from 'react-router-dom';
import { canvasRef, fromTextToObject } from ':lib';

// interface FileUploadDrawerProps {
// 	onFileUpload?: (file: File) => void;
// }

export const CanvasUploadDrawer = (): [JSX.Element, () => void] => {
	const [open, setOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [processing, setProcessing] = useState(false);
	const { id } = useParams<{ id: string }>();

	const uploadProps: UploadProps = {
		beforeUpload: (file) => {
			setSelectedFile(file);
			return false;
		},
		multiple: false,
		showUploadList: false,
		accept: '.png, .jpg, .jpeg',
	};

	const processImage = async (file: File): Promise<File> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const url = URL.createObjectURL(file);

			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;

				const ctx = canvas.getContext('2d');
				if (!ctx) return reject('Canvas context not available');

				ctx.drawImage(img, 0, 0);

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;

				for (let i = 0; i < data.length; i += 4) {
					const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

					const value = avg > 128 ? 255 : 0;

					data[i] = value; // R
					data[i + 1] = value; // G
					data[i + 2] = value; // B
				}

				ctx.putImageData(imageData, 0, 0);

				canvas.toBlob((blob) => {
					if (!blob) return reject('Failed to create blob');

					URL.revokeObjectURL(url);
					resolve(new File([blob], file.name, { type: 'image/png' }));
				}, 'image/png');
			};

			img.onerror = reject;
			img.src = url;
		});
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		setProcessing(true);
		try {
			const processedFile = await processImage(selectedFile);
			getOcr(processedFile, id || '0').then((res) => fromTextToObject(canvasRef, res.text, 10, 10));
			setOpen(false);
		} catch (error) {
			console.error('Image processing failed:', error);
		} finally {
			setProcessing(false);
		}
	};

	const showDrawer = () => {
		setOpen(true);
	};

	return [
		<Drawer
			title="Загрузка изображения"
			onClose={() => {
				setOpen(false);
				setSelectedFile(null);
			}}
			open={open}
		>
			<div style={{ padding: 20 }}>
				<Upload {...uploadProps}>
					<Button icon={<UploadOutlined />} size="large">
						Выбрать файл
					</Button>
				</Upload>

				{selectedFile && (
					<div style={{ margin: '16px 0' }}>
						<p>Выбранный файл: {selectedFile.name}</p>
						<p style={{ fontSize: 12, color: '#666' }}>
							Изображение будет автоматически преобразовано в чёрно-белое с максимальной
							контрастностью
						</p>
					</div>
				)}

				<Button
					type="primary"
					onClick={handleUpload}
					disabled={!selectedFile || processing}
					loading={processing}
					style={{ marginTop: 16 }}
				>
					{processing ? 'Обработка...' : 'Загрузить файл'}
				</Button>

				<p style={{ marginTop: 16, color: '#666' }}>
					Поддерживается: PNG (изображение будет преобразовано автоматически)
				</p>
			</div>
		</Drawer>,
		showDrawer,
	];
};
