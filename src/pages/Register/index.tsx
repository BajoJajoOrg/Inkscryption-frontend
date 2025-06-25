import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ErrorResponse, register } from ':api';
import { useAuthStore } from ':store';
import { Form, Input, Button, Alert, Layout } from 'antd';
import styles from '../Login/styles.module.scss';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const RegisterPage: React.FC = () => {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: register,
		onSuccess: (data) => {
			setAuth(data.access_token, data.refresh_token);
			navigate('/');
		},
		onError: (error: ErrorResponse) => {
			console.error('Ошибка регистрации:', error.message);
			const errorMessages: Record<string, string> = {
				'email already exists': 'Пользователь с таким email уже существует.',
				'failed to get user': 'Ошибка сервера. Пожалуйста, попробуйте позже.',
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
				<span className={styles.header}>Регистрация</span>
				<Form
					className={styles.form}
					name="login"
					initialValues={{ remember: true }}
					onFinish={(values) => mutation.mutate({ email: values.email, password: values.password })}
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
							{mutation.isPending ? 'Регистрируем...' : 'Продолжить'}
						</Button>
					</Form.Item>
					{mutation.isError && (
						<Alert
							message="Ошибка регистрации"
							description={errorMessage}
							type="error"
							showIcon
							closable
							onClose={() => setErrorMessage(null)}
						/>
					)}
					<p className={styles.footer}>
						Есть аккаунт?
						<Link className={styles.link} to="/login">
							Вход
						</Link>
					</p>
				</Form>
			</div>
		</Layout>
	);
};

export default RegisterPage;
