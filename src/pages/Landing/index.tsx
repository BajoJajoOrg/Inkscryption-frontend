import { Button } from 'antd';
import styles from './styles.module.scss';
import { Link } from 'react-router-dom';
import mainImage from ':png/landing_img_1.webp';
import featureImage1 from ':png/landing_img_2.webp';
import featureOverview from ':png/feature_overview.webp';
import feat1 from ':png/feat_1.webp';
import feat2 from ':png/feat_2.webp';
import feat3 from ':png/feat_3.webp';
import icon from ':svg/logo.svg';

const Header: React.FC = () => {
	return (
		<div className={styles.headerWrapper}>
			<div className={styles.headerInner}>
				<img src={icon} className={styles.logo} />
				<div className={styles.navButtons}>
					{/* <Button className={styles.customButtonB}>
						<Link to="/landing">контакты</Link>
					</Button>
					<Button className={styles.customButtonB}>
						<Link to="/landing">о нас</Link>
					</Button> */}
					<Button className={styles.customButtonB}>
						<Link to="/login">войти</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};

const MainBlock: React.FC = () => {
	return (
		<div className={styles.mainBlock}>
			<img className={styles.mainImage} src={mainImage} />
		</div>
	);
};

const FeatureBlock: React.FC = () => {
	return (
		<div className={styles.featureBlock}>
			<div className={styles.featureHeader}>
				<img className={styles.featureImage} src={featureImage1} />
				<p className={styles.featureText}>
					Переводите любой рукописный текст в электронные заметки, используя наше приложение
				</p>
			</div>
			<Button className={styles.customButtonA} size="large">
				<Link to="/register">Отведать</Link>
			</Button>
			<div className={styles.overviewWrapper}>
				<img className={styles.featureOverview} src={featureOverview} />
				<div className={styles.featuresOnTop}>
					<div className={styles.featureItem} style={{ marginTop: '25%' }}>
						<img src={feat1} className={styles.featureImg} />
						<p>когда?</p>
						<p className={styles.featureCaption}>В блистательные темные двадцатые</p>
					</div>
					<div className={styles.featureItem} style={{ marginTop: '15%' }}>
						<img src={feat2} className={styles.featureImg} />
						<p>кому?</p>
						<p className={styles.featureCaption}>
							Если ты студент психолог поэт проф ученик бизнесмен
						</p>
					</div>
					<div className={styles.featureItem} style={{ marginTop: '15%' }}>
						<img src={feat3} className={styles.featureImg} />
						<p>зачем?</p>
						<p className={styles.featureCaption}>Если ваши заметки теряются в хаосе почерка</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const LandingPage: React.FC = () => {
	return (
		<div className={styles.scrollContainer}>
			<Header />
			<MainBlock />
			<FeatureBlock />
		</div>
	);
};

export default LandingPage;
