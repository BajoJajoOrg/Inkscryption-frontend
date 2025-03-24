import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import CanvasPage from '../pages/CanvasPage';
import NotFound from '../pages/NotFound';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const isAuthenticated = true;
	return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
	return (
		<Routes>
			<Route path="/login" element={<div>Login Page</div>} />
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
