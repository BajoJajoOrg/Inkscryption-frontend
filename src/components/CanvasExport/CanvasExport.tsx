import { Button, Dropdown, MenuProps } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

type CanvasExportPopoverProps = {
	onExportPNG?: () => void;
	onExportJPEG?: () => void;
	onExportSVG?: () => void;
	onExportPDF?: () => void;
};

export const CanvasExportPopover = ({
	onExportPNG,
	onExportJPEG,
	onExportSVG,
	onExportPDF,
}: CanvasExportPopoverProps) => {
	const items: MenuProps['items'] = [
		{
			key: 'png',
			label: 'Скачать PNG',
			onClick: () => onExportPNG?.(),
		},
		{
			key: 'jpeg',
			label: 'Скачать JPEG',
			onClick: () => onExportJPEG?.(),
		},
		{
			key: 'svg',
			label: 'Скачать SVG',
			onClick: () => onExportSVG?.(),
		},
		{
			key: 'pdf',
			label: 'Скачать PDF',
			onClick: () => onExportPDF?.(),
		},
	];

	return (
		<Dropdown menu={{ items }} trigger={['click']}>
			<Button icon={<DownloadOutlined />}>Экспорт</Button>
		</Dropdown>
	);
};
