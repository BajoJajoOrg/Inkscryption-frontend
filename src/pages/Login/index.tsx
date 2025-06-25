import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ErrorResponse, login } from ':api';
import { useAuthStore } from ':store';
import { Form, Input, Button, Alert, Layout } from 'antd';
import { useState } from 'react';
import styles from './styles.module.scss';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			setErrorMessage(null);
			setAuth(data.access_token, data.refresh_token);
			navigate('/home');
		},
		onError: (error: ErrorResponse) => {
			console.error('Ошибка входа:', error.error);
			const errorMessages: Record<string, string> = {
				'wrong password': 'Неверный пароль. Пожалуйста, проверьте введенные данные.',
				'failed to get user': 'Пользователь с таким email не найден.',
				'user not found': 'Пользователь с таким email не найден.',
			};

			setErrorMessage(
				errorMessages[error.error] || 'Произошла неизвестная ошибка при входе. Попробуйте снова.'
			);
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
				<Form
					className={styles.form}
					name="login"
					initialValues={{ remember: true }}
					onFinish={(values) => {
						setErrorMessage(null); // Сбрасываем ошибку перед новой попыткой
						mutation.mutate({ email: values.email, password: values.password });
					}}
				>
					<Form.Item
						name="email"
						className={styles.customItem}
						rules={[
							{ required: true, message: 'Введите email!' },
							{ type: 'email', message: 'Некорректный email!' },
						]}
					>
						<div className={styles.customInputWrapper}>
							<Input placeholder="Email" size="large" className={styles.customInput} />
						</div>
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
					{errorMessage && (
						<Alert
							message="Ошибка входа"
							description={errorMessage}
							type="error"
							showIcon
							closable
							onClose={() => setErrorMessage(null)}
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
