import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './constants/AppRoutes';
import { QueryClientProvider } from '@tanstack/react-query';
import { persister, queryClient } from ':constants';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const App: React.FC = () => {
	return (
		<PersistQueryClientProvider persistOptions={{ persister }} client={queryClient}>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					<AppRoutes />
				</BrowserRouter>
			</QueryClientProvider>
		</PersistQueryClientProvider>
	);
};

export default App;
