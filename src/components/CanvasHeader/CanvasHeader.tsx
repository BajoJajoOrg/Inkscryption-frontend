import { FC } from 'react';
import styles from './styles.module.scss';
import returnIcon from ':svg/icons/return.svg';
import { useNavigate } from 'react-router-dom';
import { saveCanvasExternal } from ':lib';

type TCanvasHeader = {
	title: string;
	parent_id: number;
};
export const CanvasHeader: FC<TCanvasHeader> = ({ title, parent_id }) => {
	const navigate = useNavigate();
	return (
		<div className={styles.container}>
			<button
				className={styles.button}
				onClick={() => {
					saveCanvasExternal();
					navigate(parent_id == 0 ? '/' : `/directory/${parent_id}`);
				}}
			>
				<img className={styles.icon} src={returnIcon} />
			</button>
			<h1 className={styles.truncateText}>{title}</h1>
		</div>
	);
};
