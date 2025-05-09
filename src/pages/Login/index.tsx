import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ErrorResponse } from ':api';
import { useAuthStore } from ':store';
import { Form, Input, Button, Alert, Typography, Layout } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import styles from './styles.module.scss';

const { Title } = Typography;
const { Content } = Layout;

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	// const mutation = useMutation({
	// 	mutationFn: login,
	// 	onSuccess: (data) => {
	// 		setAuth(data.access_token, data.refresh_token);
	// 		navigate('/');
	// 	},
	// 	onError: (error: ErrorResponse) => {
	// 		console.error('Ошибка входа:', error.message);
	// 	},
	// });

	const handleLogin = () => {
		// Имитация входа (без реального API)
		console.log('Вход выполнен (фиктивный пользователь)');
		navigate('/');
	  };

	return (
		<Layout
			style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
		>
			<div className={styles.root}>
				<span className={styles.header}>Войти</span>
				<Button type="primary" size="large" block onClick={handleLogin}>
					Войти (тестовый режим)
				</Button>
				{/* <Form
					className={styles.form}
                    name="login"
					initialValues={{ remember: true }}
					onFinish={(values) => mutation.mutate({ email: values.email, password: values.password })}
				>
					<Form.Item
						name="email"
						rules={[
							{ required: true, message: 'Введите email!' },
							{ type: 'email', message: 'Некорректный email!' },
						]}
					>
						<Input placeholder="Email" size="large" />
					</Form.Item>
					<Form.Item name="password" rules={[{ required: true, message: 'Введите пароль!' }]}>
						<Input.Password placeholder="Пароль" size="large" />
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={mutation.isPending}
							size="large"
							block
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
				</Form> */}
			</div>
		</Layout>
	);
};

export default LoginPage;
