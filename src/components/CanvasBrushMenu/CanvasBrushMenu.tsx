import { BRUSH_SETTINGS } from ':lib';
import { ColorPicker, Slider } from 'antd';
import { AggregationColor } from 'antd/es/color-picker/color';
import { useState } from 'react';

type CanvasBrushMenuProps = {
	onToggleDraw: () => void;
};

export const CanvasBrushMenu = ({ onToggleDraw }: CanvasBrushMenuProps) => {
	const [color, setColor] = useState<AggregationColor>('#000000');
	const handleColorChange = (value: AggregationColor) => {
		setColor(value);
		BRUSH_SETTINGS.BRUSH_COLOR = value.toHexString();
	};

	const [penWidth, setPenWidth] = useState<number>(3);
	const handleWidthChange = (value: number) => {
		setPenWidth(value);
		BRUSH_SETTINGS.BRUSH_WIDTH = value;
	};

	return (
		<div
			style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', flexDirection: 'column' }}
		>
			<ColorPicker
				value={color}
				onChange={handleColorChange}
				placement="bottom"
				showText={false}
				arrow={false}
				onOpenChange={onToggleDraw}
			/>
			<Slider
				defaultValue={penWidth}
				min={1}
				max={10}
				style={{ width: '50px' }}
				onChange={handleWidthChange}
				onChangeComplete={onToggleDraw}
			/>
		</div>
	);
};
