import { EmbeddingModelV1, LanguageModelV1, ProviderV1 } from '@ai-sdk/provider'
import { FetchFunction, withoutTrailingSlash } from '@ai-sdk/provider-utils'
import { GenApiChatLanguageModel } from './genapi-chat-language-model'
import { GenApiChatSettings } from './genapi-chat-settings'
import { GenApiCompletionLanguageModel } from './genapi-completion-language-model'
import { GenApiCompletionSettings } from './genapi-completion-settings'
import { GenApiEmbeddingModel } from './genapi-embedding-model'
import { GenApiEmbeddingSettings } from './genapi-embedding-settings'

export interface GenApiProvider<
	CHAT_MODEL_IDS extends string = string,
	COMPLETION_MODEL_IDS extends string = string,
	EMBEDDING_MODEL_IDS extends string = string,
> extends ProviderV1 {
	(
		modelId: CHAT_MODEL_IDS,
		settings?: GenApiChatSettings,
	): LanguageModelV1;

	languageModel (
		modelId: CHAT_MODEL_IDS,
		settings?: GenApiChatSettings,
	): LanguageModelV1;

	chatModel (
		modelId: CHAT_MODEL_IDS,
		settings?: GenApiChatSettings,
	): LanguageModelV1;

	completionModel (
		modelId: COMPLETION_MODEL_IDS,
		settings?: GenApiCompletionSettings,
	): LanguageModelV1;

	textEmbeddingModel (
		modelId: EMBEDDING_MODEL_IDS,
		settings?: GenApiEmbeddingSettings,
	): EmbeddingModelV1<string>;
}

export interface GenApiProviderSettings {
	/**
Base URL for the API calls.
	 */
	baseURL?: string;

	/**
Provider name.
	 */
	name: string;

	/**
API key for authenticating requests. If specified, adds an `Authorization`
header to request headers with the value `Bearer <apiKey>`. This will be added
before any headers potentially specified in the `headers` option. Default is `process.env.GENAPI_API_KEY`
	 */
	apiKey?: string;

	/**
Optional custom headers to include in requests. These will be added to request headers
after any headers potentially added by use of the `apiKey` option.
	 */
	headers?: Record<string, string>;

	/**
Optional custom url query parameters to include in request urls.
	 */
	queryParams?: Record<string, string>;

	/**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
	 */
	fetch?: FetchFunction;
}

/**
Create an GenApi provider instance.
 */
export function createGenApi<
	CHAT_MODEL_IDS extends string,
	COMPLETION_MODEL_IDS extends string,
	EMBEDDING_MODEL_IDS extends string,
> (
	options: GenApiProviderSettings,
): GenApiProvider<
	CHAT_MODEL_IDS,
	COMPLETION_MODEL_IDS,
	EMBEDDING_MODEL_IDS
> {
	const baseURL = withoutTrailingSlash(options.baseURL || 'https://api.gen-api.ru/api/v1/networks')
	const providerName = options.name

	interface CommonModelConfig {
		provider: string;
		url: ({ path }: { path: string }) => string;
		headers: () => Record<string, string>;
		fetch?: FetchFunction;
	}

	const getHeaders = () => ({
		...(options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {Authorization: `Bearer ${process.env.GENAPI_API_KEY}`}),
		...options.headers,
	})

	const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
		provider: `${providerName}.${modelType}`,
		url: ({ path }) => {
			const url = new URL(`${baseURL}${path}`)
			if (options.queryParams) {
				url.search = new URLSearchParams(options.queryParams).toString()
			}
			return url.toString()
		},
		headers: getHeaders,
		fetch: options.fetch,
	})

	const createLanguageModel = (
		modelId: CHAT_MODEL_IDS,
		settings: GenApiChatSettings = {},
	) => createChatModel(modelId, settings)

	const createChatModel = (
		modelId: CHAT_MODEL_IDS,
		settings: GenApiChatSettings = {},
	) =>
		new GenApiChatLanguageModel(modelId, settings, {
			...getCommonModelConfig('chat'),
			defaultObjectGenerationMode: 'tool',
		})

	const createCompletionModel = (
		modelId: COMPLETION_MODEL_IDS,
		settings: GenApiCompletionSettings = {},
	) =>
		new GenApiCompletionLanguageModel(
			modelId,
			settings,
			getCommonModelConfig('completion'),
		)

	const createEmbeddingModel = (
		modelId: EMBEDDING_MODEL_IDS,
		settings: GenApiEmbeddingSettings = {},
	) =>
		new GenApiEmbeddingModel(
			modelId,
			settings,
			getCommonModelConfig('embedding'),
		)

	const provider = (
		modelId: CHAT_MODEL_IDS,
		settings?: GenApiChatSettings,
	) => createLanguageModel(modelId, settings)

	provider.languageModel = createLanguageModel
	provider.chatModel = createChatModel
	provider.completionModel = createCompletionModel
	provider.textEmbeddingModel = createEmbeddingModel

	return provider as GenApiProvider<
		CHAT_MODEL_IDS,
		COMPLETION_MODEL_IDS,
		EMBEDDING_MODEL_IDS
	>
}
