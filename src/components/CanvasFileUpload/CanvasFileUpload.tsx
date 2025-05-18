import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';

type CanvasFileUploadProps = {
	onImageUpload?: (file: File) => void;
};

export const CanvasFileUpload = ({ onImageUpload }: CanvasFileUploadProps) => {
	return (
		<Upload
			accept="image/*"
			showUploadList={false}
			beforeUpload={(file: RcFile) => {
				console.log('uploading');
				onImageUpload?.(file);
				return false;
			}}
		>
			<Button icon={<UploadOutlined />}>Выбрать файл</Button>
		</Upload>
	);
};
