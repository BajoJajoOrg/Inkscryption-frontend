import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ErrorResponse } from ':api';
import { useAuthStore } from ':store';
import { Form, Input, Button, Alert, Typography, Layout } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import styles from '../Login/styles.module.scss';
import { login } from ':api/auth';
import { Link } from 'react-router-dom';

const { Title } = Typography;
const { Content } = Layout;

const RegisterPage: React.FC = () => {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const mutation = useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			setAuth(data.access_token, data.refresh_token);
			navigate('/');
		},
		onError: (error: ErrorResponse) => {
			console.error('Ошибка регистрации:', error.message);
		},
	});

	const handleRegister = () => {
		// Имитация входа (без реального API)
		console.log('Регистрация выполнена (фиктивный пользователь)');
		navigate('/');
	};

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
							{mutation.isPending ? 'Регистрируем...' : 'Продолжить'}
						</Button>
					</Form.Item>
					{mutation.isError && (
						<Alert
							message="Ошибка регистрации"
							description={(mutation.error as ErrorResponse).message}
							type="error"
							showIcon
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
