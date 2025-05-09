import { FC } from 'react';
import styles from './styles.module.scss';
import returnIcon from ':svg/icons/return.svg';
import editIcon from ':svg/icons/edit.svg';

type TCanvasHeader = {
	title: string;
};
export const CanvasHeader: FC<TCanvasHeader> = ({ title }) => {
	return (
		<div className={styles.container}>
			<button className={styles.button}>
				<img className={styles.icon} src={returnIcon} />
			</button>
			<h1>{title}</h1>
			<button className={styles.button}>
				<img className={styles.icon} src={editIcon} />
			</button>
		</div>
	);
};
