/**
 * @system telegram
 * @status handwritten
 * @edit edit directly
 *
 * TDLib authentication step actions — submitPhoneNumber, submitAuthCode,
 * submitPassword (one per Telegram auth-flow step) plus isTdlibConfigured
 * (sanity check for apiId/apiHash). The portal auth flow drives these in
 * sequence; they form one canonical "TDLib auth actions" surface.
 */
import { waitForTdlibAuthState } from "@teamscala/telegram-auth-lifecycle/auth-lifecycle";

import type { TdlibClientEntry } from "@teamscala/telegram-types/types";

export async function submitTdlibPhoneNumber<
	TClient extends {
		invoke: (request: {
			_: "setAuthenticationPhoneNumber";
			phone_number: string;
		}) => Promise<unknown>;
	},
>(options: {
	client: TClient;
	clients: Map<string, TdlibClientEntry<TClient>>;
	key: string;
	phoneNumber: string;
	timeoutMs?: number;
}): Promise<void> {
	const entry = options.clients.get(options.key);
	if (entry) {
		entry.state = { ...entry.state, phoneNumber: options.phoneNumber };
	}

	const currentStatus = entry?.state.status;
	if (currentStatus === "ready") {
		return;
	}

	if (
		currentStatus !== "waiting_phone" &&
		currentStatus !== "waiting_code" &&
		currentStatus !== "waiting_password"
	) {
		await waitForTdlibAuthState({
			clients: options.clients,
			key: options.key,
			targetStatus: "waiting_phone",
			timeoutMs: options.timeoutMs,
		});
	}

	const postWaitEntry = options.clients.get(options.key);
	if (postWaitEntry?.state.status === "ready") {
		return;
	}

	await options.client.invoke({
		_: "setAuthenticationPhoneNumber",
		phone_number: options.phoneNumber,
	});
}

export async function submitTdlibAuthCode<
	TClient extends {
		invoke: (request: {
			_: "checkAuthenticationCode";
			code: string;
		}) => Promise<unknown>;
	},
>(client: TClient, code: string): Promise<void> {
	await client.invoke({
		_: "checkAuthenticationCode",
		code,
	});
}

export async function submitTdlibPassword<
	TClient extends {
		invoke: (request: {
			_: "checkAuthenticationPassword";
			password: string;
		}) => Promise<unknown>;
	},
>(client: TClient, password: string): Promise<void> {
	await client.invoke({
		_: "checkAuthenticationPassword",
		password,
	});
}

export function isTdlibConfigured(apiId: number, apiHash: string): boolean {
	return apiId > 0 && apiHash.length > 0;
}
