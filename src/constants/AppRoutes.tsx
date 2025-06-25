import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import CanvasPage from '../pages/CanvasPage';
import NotFound from '../pages/NotFound';
import { JSX, useEffect, useState } from 'react';
import { useAuthStore } from ':store';
import LoginPage from ':pages/Login';
import RegisterPage from ':pages/Register';
import { refreshToken } from ':api';

interface ProtectedRouteProps {
	children: JSX.Element;
}

const PrivateRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated) {
                const refresh = localStorage.getItem('refresh_token');
                if (refresh) {
                    try {
                        await refreshToken(refresh);
                    } catch {
                        useAuthStore.getState().logout();
                    }
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, [isAuthenticated]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
	return (
		<Routes>
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
