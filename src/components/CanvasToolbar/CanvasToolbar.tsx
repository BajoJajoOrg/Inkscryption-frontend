import { FC } from 'react';
import BrushIcon from '../../assets/svg/icons/pen.svg';
import EraserIcon from '../../assets/svg/icons/eraser.svg';
import TextIcon from '../../assets/svg/icons/text.svg';
import MoveIcon from '../../assets/svg/icons/pointer.svg';
import UndoIcon from '../../assets/svg/icons/undo.svg';
import RedoIcon from '../../assets/svg/icons/redo.svg';
import SaveIcon from '../../assets/svg/icons/save.svg';
import AIIcon from '../../assets/svg/icons/ai.svg';
import clsx from 'clsx';

import styles from './styles.module.scss';

interface ToolbarProps {
	isDrawing: boolean;
	isErasing: boolean;
	isSelecting: boolean;
	isTextMode: boolean;
	onToggleDraw: () => void;
	onToggleErase: () => void;
	onToggleSelect: () => void;
	onToggleText: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onSave: () => void;
	onExtractText: () => void;
}

export const Toolbar: FC<ToolbarProps> = ({
	isDrawing,
	isErasing,
	isSelecting,
	isTextMode,
	onToggleDraw,
	onToggleErase,
	onToggleSelect,
	onToggleText,
	onUndo,
	onRedo,
	onSave,
	onExtractText,
}) => {
	return (
		<div className={styles.toolbar}>
			<div className={styles.toolbar__content}>
				<button
					className={clsx(styles.toolbar__button, isDrawing && styles.selected)}
					onClick={onToggleDraw}
					title="Toggle Drawing Mode"
				>
					<img className={styles.toolbar__icon} src={BrushIcon} />
				</button>
				<button
					className={clsx(styles.toolbar__button, isErasing && styles.selected)}
					onClick={onToggleErase}
					title="Toggle Erase Mode"
				>
					<img className={styles.toolbar__icon} src={EraserIcon} />
				</button>
				<button
					className={clsx(styles.toolbar__button, isSelecting && styles.selected)}
					onClick={onToggleSelect}
					title="Toggle Select Mode"
				>
					<img className={styles.toolbar__icon} src={MoveIcon} />
				</button>
				<button className={styles.toolbar__button} onClick={onUndo} title="Undo">
					<img className={styles.toolbar__icon} src={UndoIcon} />
				</button>
				<button className={styles.toolbar__button} onClick={onRedo} title="Redo">
					<img className={styles.toolbar__icon} src={RedoIcon} />
				</button>
				<button className={styles.toolbar__button} onClick={onSave} title="Save">
					<img className={styles.toolbar__icon} src={SaveIcon} />
				</button>
				<button className={styles.toolbar__button} onClick={onExtractText} title="Extract Text">
					<img className={styles.toolbar__icon} src={AIIcon} />
				</button>
				<button
					className={clsx(styles.toolbar__button, isTextMode && styles.selected)}
					onClick={onToggleText}
					title="Text Mode"
				>
					<img className={styles.toolbar__icon} src={TextIcon} />
				</button>
			</div>
		</div>
	);
};
