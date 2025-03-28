export type GenApiChatModelId = string;
export type GenApiChatSubModelId = string | undefined;

export interface GenApiChatSettings {
	/**
A unique identifier representing your end-user, which can help the provider to
monitor and detect abuse.
	 */
	user?: string;

	/**
Simulates streaming by using a normal generate call and returning it as a stream.
Enable this if the model that you are using does not support streaming.

Defaults to `false`.
	 */
	simulateStreaming?: boolean;

	/**
	 * Submodel for request `model` field, like a main model is `Claude` and `subModel` is `claude-3-haiku-20240307`
	 */
	subModel?: string,
}
