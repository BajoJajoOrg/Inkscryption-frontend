import { FC } from 'react';
import styles from './styles.module.scss';
import returnIcon from ':svg/icons/return.svg';
import { useNavigate } from 'react-router-dom';
import { saveCanvasExternal } from ':lib';

type TCanvasHeader = {
	title: string;
};
export const CanvasHeader: FC<TCanvasHeader> = ({ title }) => {
	const navigate = useNavigate();
	return (
		<div className={styles.container}>
			<button
				className={styles.button}
				onClick={() => {
					saveCanvasExternal();
					navigate('/');
				}}
			>
				<img className={styles.icon} src={returnIcon} />
			</button>
			<h1 className={styles.truncateText}>{title}</h1>
		</div>
	);
};
