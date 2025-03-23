import { JSONValue, LanguageModelV1Prompt, LanguageModelV1FinishReason, LanguageModelV1ProviderMetadata, LanguageModelV1ObjectGenerationMode } from '@ai-sdk/provider';
import { FetchFunction } from '@ai-sdk/provider-utils';
import { ZodSchema } from 'zod';

type GenApiChatPrompt = Array<GenApiMessage>;
type GenApiMessage = GenApiSystemMessage | GenApiUserMessage | GenApiAssistantMessage | GenApiToolMessage;
type JsonRecord<T = never> = Record<string, JSONValue | JSONValue[] | T | T[] | undefined>;
interface GenApiSystemMessage extends JsonRecord {
    role: 'system';
    content: string;
}
interface GenApiUserMessage extends JsonRecord<GenApiContentPart> {
    role: 'user';
    content: string | Array<GenApiContentPart>;
}
type GenApiContentPart = GenApiContentPartText | GenApiContentPartImage;
interface GenApiContentPartImage extends JsonRecord {
    type: 'image_url';
    image_url: {
        url: string;
    };
}
interface GenApiContentPartText extends JsonRecord {
    type: 'text';
    text: string;
}
interface GenApiAssistantMessage extends JsonRecord<GenApiMessageToolCall> {
    role: 'assistant';
    content?: string | null;
    tool_calls?: Array<GenApiMessageToolCall>;
}
interface GenApiMessageToolCall extends JsonRecord {
    type: 'function';
    id: string;
    function: {
        arguments: string;
        name: string;
    };
}
interface GenApiToolMessage extends JsonRecord {
    role: 'tool';
    content: string;
    tool_call_id: string;
}

declare function convertToGenApiChatMessages(prompt: LanguageModelV1Prompt): GenApiChatPrompt;

declare function mapGenApiFinishReason(finishReason: string | null | undefined): LanguageModelV1FinishReason;

declare function getResponseMetadata({ id, model, created, }: {
    id?: string | undefined | null;
    created?: number | undefined | null;
    model?: string | undefined | null;
}): {
    id: string | undefined;
    modelId: string | undefined;
    timestamp: Date | undefined;
};

type ProviderErrorStructure<T> = {
    errorSchema: ZodSchema<T>;
    errorToMessage: (error: T) => string;
    isRetryable?: (response: Response, error?: T) => boolean;
};

/**
Extracts provider-specific metadata from API responses.
Used to standardize metadata handling across different LLM providers while allowing
provider-specific metadata to be captured.
 */
type MetadataExtractor = {
    /**
     * Extracts provider metadata from a complete, non-streaming response.
     *
     * @param parsedBody - The parsed response JSON body from the provider's API.
     *
     * @returns Provider-specific metadata or undefined if no metadata is available.
     *          The metadata should be under a key indicating the provider id.
     */
    extractMetadata: ({ parsedBody, }: {
        parsedBody: unknown;
    }) => LanguageModelV1ProviderMetadata | undefined;
    /**
     * Creates an extractor for handling streaming responses. The returned object provides
     * methods to process individual chunks and build the final metadata from the accumulated
     * stream data.
     *
     * @returns An object with methods to process chunks and build metadata from a stream
     */
    createStreamExtractor: () => {
        /**
         * Process an individual chunk from the stream. Called for each chunk in the response stream
         * to accumulate metadata throughout the streaming process.
         *
         * @param parsedChunk - The parsed JSON response chunk from the provider's API
         */
        processChunk(parsedChunk: unknown): void;
        /**
         * Builds the metadata object after all chunks have been processed.
         * Called at the end of the stream to generate the complete provider metadata.
         *
         * @returns Provider-specific metadata or undefined if no metadata is available.
         *          The metadata should be under a key indicating the provider id.
         */
        buildMetadata(): LanguageModelV1ProviderMetadata | undefined;
    };
};

type GenApiChatConfig = {
    provider: string;
    headers: () => Record<string, string | undefined>;
    url: (options: {
        modelId: string;
        path: string;
    }) => string;
    fetch?: FetchFunction;
    errorStructure?: ProviderErrorStructure<any>;
    metadataExtractor?: MetadataExtractor;
    /**
Default object generation mode that should be used with this model when
no mode is specified. Should be the mode with the best results for this
model. `undefined` can be specified if object generation is not supported.
     */
    defaultObjectGenerationMode?: LanguageModelV1ObjectGenerationMode;
    /**
     * Whether the model supports structured outputs.
     */
    supportsStructuredOutputs?: boolean;
};

export { type GenApiChatConfig, convertToGenApiChatMessages, getResponseMetadata, mapGenApiFinishReason };
