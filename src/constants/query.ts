import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

/** Иницилизация клиента квери */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 720,
        },
    },
});

// Создать экземпляр кеша query в локальном хранилище
export const persister = createSyncStoragePersister({
    storage: window.localStorage,
});

persistQueryClient({
    queryClient,
    persister,
});
