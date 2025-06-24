import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import CanvasPage from '../pages/CanvasPage';
import NotFound from '../pages/NotFound';
import { JSX } from 'react';
import { useAuthStore } from ':store';
import LoginPage from ':pages/Login';
import RegisterPage from ':pages/Register';
import LandingPage from ':pages/Landing';

interface ProtectedRouteProps {
	children: JSX.Element;
}

const PrivateRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

const AppRoutes: React.FC = () => {
	return (
		<Routes>
			<Route path="/landing" element={<LandingPage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route
				path="/"
				element={
					<PrivateRoute>
						<Home />
					</PrivateRoute>
				}
			/>
			<Route
				path="/canvas/:id"
				element={
					<PrivateRoute>
						<CanvasPage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/directory/:directoryId"
				element={
					<PrivateRoute>
						<Home />
					</PrivateRoute>
				}
			/>
			<Route
				path="*"
				element={
					<PrivateRoute>
						<NotFound />
					</PrivateRoute>
				}
			/>
			<Route path="/" />
		</Routes>
	);
};

export default AppRoutes;
