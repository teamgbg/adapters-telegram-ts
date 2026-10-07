/**
 * @system telegram
 * @status handwritten
 * @edit edit directly
 */
import type { TdlibClientEntry } from "@teamscala/telegram-types/types";

export async function closeTrackedTdlibClients<
	TClient extends { close(): Promise<void> },
>(options: {
	clients: Map<string, TdlibClientEntry<TClient>>;
	onError?: (key: string, error: unknown) => void;
}): Promise<void> {
	const closePromises: Promise<void>[] = [];

	for (const [key, entry] of options.clients) {
		closePromises.push(
			entry.client.close().catch((error) => {
				options.onError?.(key, error);
			}),
		);
	}

	await Promise.all(closePromises);
	options.clients.clear();
}
