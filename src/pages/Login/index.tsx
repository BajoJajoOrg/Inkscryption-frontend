import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ErrorResponse, login } from ':api';
import { useAuthStore } from ':store';
import { Form, Input, Button, Alert, Layout } from 'antd';

import styles from './styles.module.scss';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const mutation = useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			setAuth(data.access_token, data.refresh_token);
			navigate('/');
		},
		onError: (error: ErrorResponse) => {
			console.error('Ошибка входа:', error.message);
		},
	});

	return (
		<Layout
			style={{
				minHeight: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<div className={styles.root}>
				<span className={styles.header}>Вход</span>
				{/* <Button type="primary" size="large" block onClick={handleLogin}>
					Войти (тестовый режим)
				</Button> */}
				<Form
					className={styles.form}
					name="login"
					initialValues={{ remember: true }}
					onFinish={(values) => mutation.mutate({ email: values.email, password: values.password })}
				>
					<Form.Item
						name="email"
						// style={{ textAlign: 'center', fontFamily: 'Postironic-Hill' }}
						className={styles.customItem}
						rules={[
							{ required: true, message: 'Введите email!' },
							{ type: 'email', message: 'Некорректный email!' },
						]}
					>
						<Input placeholder="Email" size="large" className={styles.customInput} />
					</Form.Item>
					<Form.Item
						name="password"
						className={styles.customItem}
						style={{ marginBottom: 30 }}
						rules={[{ required: true, message: 'Введите пароль!' }]}
					>
						<Input.Password placeholder="Пароль" size="large" className={styles.customInput} />
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={mutation.isPending}
							size="large"
							block
							className={styles.continueBtn}
						>
							{mutation.isPending ? 'Вход...' : 'Войти'}
						</Button>
					</Form.Item>
					{mutation.isError && (
						<Alert
							message="Ошибка входа"
							description={(mutation.error as ErrorResponse).message}
							type="error"
							showIcon
						/>
					)}
					<p className={styles.footer}>
						Нет аккаунта?
						<Link className={styles.link} to="/register">
							Регистрация
						</Link>
					</p>
				</Form>
			</div>
		</Layout>
	);
};

export default LoginPage;
