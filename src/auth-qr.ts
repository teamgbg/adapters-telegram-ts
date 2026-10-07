/**
 * @system telegram
 * @status handwritten
 * @edit edit directly
 */
import { createLogger } from "@teamscala/logger/creator";

const logger = createLogger({ service: "telegram" });

export async function requestTdlibQrCode<
	TClient extends {
		invoke: (request: {
			_: "requestQrCodeAuthentication";
			other_user_ids: string[];
		}) => Promise<unknown>;
	},
>(client: TClient): Promise<void> {
	// QR-code login: Telegram returns a tg://login link the user scans from an
	// existing authorized device — the documented code-free path, required when the
	// number already has an active session (authenticationCodeTypeTelegramMessage)
	// and next_type is null (no SMS fallback available).
	// The invoke result/error is logged for observability; the auth-state transition
	// logger captures what TDLib does after (WaitQrCode vs error/stuck).
	try {
		const result = await client.invoke({ _: "requestQrCodeAuthentication", other_user_ids: [] });
		logger.info("requestQrCodeAuthentication invoke returned", { result });
	} catch (err) {
		logger.warn(
			"requestQrCodeAuthentication threw",
			{ error: err instanceof Error ? `${err.name}: ${err.message}` : String(err) },
		);
		throw err;
	}
}
