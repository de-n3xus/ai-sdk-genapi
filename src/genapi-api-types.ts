import { JSONValue } from '@ai-sdk/provider'

export type GenApiChatPrompt = Array<GenApiMessage>;

export type GenApiMessage =
	| GenApiSystemMessage
	| GenApiUserMessage
	| GenApiAssistantMessage
	| GenApiToolMessage;

// Allow for arbitrary additional properties for general purpose
// provider-metadata-specific extensibility.
type JsonRecord<T = never> = Record<
	string,
	JSONValue | JSONValue[] | T | T[] | undefined
>;

export interface GenApiSystemMessage extends JsonRecord {
	role: 'system';
	content: string;
}

export interface GenApiUserMessage
	extends JsonRecord<GenApiContentPart> {
	role: 'user';
	content: string | Array<GenApiContentPart>;
}

export type GenApiContentPart =
	| GenApiContentPartText
	| GenApiContentPartImage;

export interface GenApiContentPartImage extends JsonRecord {
	type: 'image_url';
	image_url: { url: string };
}

export interface GenApiContentPartText extends JsonRecord {
	type: 'text';
	text: string;
}

export interface GenApiAssistantMessage
	extends JsonRecord<GenApiMessageToolCall> {
	role: 'assistant';
	content?: string | null;
	tool_calls?: Array<GenApiMessageToolCall>;
}

export interface GenApiMessageToolCall extends JsonRecord {
	type: 'function';
	id: string;
	function: {
		arguments: string;
		name: string;
	};
}

export interface GenApiToolMessage extends JsonRecord {
	role: 'tool';
	content: string;
	tool_call_id: string;
}
