import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGenApi } from './genapi-provider'
import { GenApiChatLanguageModel } from './genapi-chat-language-model'
import { GenApiCompletionLanguageModel } from './genapi-completion-language-model'
import { GenApiEmbeddingModel } from './genapi-embedding-model'
import { GenApiChatSettings } from './genapi-chat-settings'

const GenApiChatLanguageModelMock = vi.mocked(
	GenApiChatLanguageModel,
)
const GenApiCompletionLanguageModelMock = vi.mocked(
	GenApiCompletionLanguageModel,
)
const GenApiEmbeddingModelMock = vi.mocked(
	GenApiEmbeddingModel,
)

vi.mock('./genapi-chat-language-model', () => ({
	GenApiChatLanguageModel: vi.fn(),
}))

vi.mock('./genapi-completion-language-model', () => ({
	GenApiCompletionLanguageModel: vi.fn(),
}))

vi.mock('./genapi-embedding-model', () => ({
	GenApiEmbeddingModel: vi.fn(),
}))

describe('GenApiProvider', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('createGenApi', () => {
		it('should create provider with correct configuration', () => {
			const options = {
				baseURL: 'https://api.example.com',
				name: 'test-provider',
				apiKey: 'test-api-key',
				headers: { 'Custom-Header': 'value' },
				queryParams: { 'Custom-Param': 'value' },
			}

			const provider = createGenApi(options)
			provider('model-id')

			const constructorCall =
				GenApiChatLanguageModelMock.mock.calls[0]
			const config = constructorCall[2]
			const headers = config.headers()

			expect(headers).toEqual({
				Authorization: 'Bearer test-api-key',
				'Custom-Header': 'value',
			})
			expect(config.provider).toBe('test-provider.chat')
			expect(config.url({ modelId: 'model-id', path: '/v1/chat' })).toBe(
				'https://api.example.com/v1/chat?Custom-Param=value',
			)
		})

		it('should create headers without Authorization when no apiKey provided', () => {
			const options = {
				baseURL: 'https://api.example.com',
				name: 'test-provider',
				headers: { 'Custom-Header': 'value' },
			}

			const provider = createGenApi(options)
			provider('model-id')

			const constructorCall =
				GenApiChatLanguageModelMock.mock.calls[0]
			const config = constructorCall[2]
			const headers = config.headers()

			expect(headers).toEqual({
				'Custom-Header': 'value',
			})
		})
	})

	describe('model creation methods', () => {
		const defaultOptions = {
			baseURL: 'https://api.example.com',
			name: 'test-provider',
			apiKey: 'test-api-key',
			headers: { 'Custom-Header': 'value' },
			queryParams: { 'Custom-Param': 'value' },
		}

		it('should create chat model with correct configuration', () => {
			const provider = createGenApi(defaultOptions)
			const settings: GenApiChatSettings = {}

			provider.chatModel('chat-model', settings)

			const constructorCall =
				GenApiChatLanguageModelMock.mock.calls[0]
			const config = constructorCall[2]
			const headers = config.headers()

			expect(headers).toEqual({
				Authorization: 'Bearer test-api-key',
				'Custom-Header': 'value',
			})
			expect(config.provider).toBe('test-provider.chat')
			expect(config.url({ modelId: 'model-id', path: '/v1/chat' })).toBe(
				'https://api.example.com/v1/chat?Custom-Param=value',
			)
		})

		it('should create completion model with correct configuration', () => {
			const provider = createGenApi(defaultOptions)
			const settings: GenApiChatSettings = {}

			provider.completionModel('completion-model', settings)

			const constructorCall =
				GenApiCompletionLanguageModelMock.mock.calls[0]
			const config = constructorCall[2]
			const headers = config.headers()

			expect(headers).toEqual({
				Authorization: 'Bearer test-api-key',
				'Custom-Header': 'value',
			})
			expect(config.provider).toBe('test-provider.completion')
			expect(
				config.url({ modelId: 'completion-model', path: '/v1/completions' }),
			).toBe('https://api.example.com/v1/completions?Custom-Param=value')
		})

		it('should create embedding model with correct configuration', () => {
			const provider = createGenApi(defaultOptions)
			const settings: GenApiChatSettings = {}

			provider.textEmbeddingModel('embedding-model', settings)

			const constructorCall = GenApiEmbeddingModelMock.mock.calls[0]
			const config = constructorCall[2]
			const headers = config.headers()

			expect(headers).toEqual({
				Authorization: 'Bearer test-api-key',
				'Custom-Header': 'value',
			})
			expect(config.provider).toBe('test-provider.embedding')
			expect(
				config.url({ modelId: 'embedding-model', path: '/v1/embeddings' }),
			).toBe('https://api.example.com/v1/embeddings?Custom-Param=value')
		})

		it('should use languageModel as default when called as function', () => {
			const provider = createGenApi(defaultOptions)
			const settings: GenApiChatSettings = {}

			provider('model-id', settings)

			expect(GenApiChatLanguageModel).toHaveBeenCalledWith(
				'model-id',
				settings,
				expect.objectContaining({
					provider: 'test-provider.chat',
					defaultObjectGenerationMode: 'tool',
				}),
			)
		})

		it('should create URL without query parameters when queryParams is not specified', () => {
			const options = {
				baseURL: 'https://api.example.com',
				name: 'test-provider',
				apiKey: 'test-api-key',
			}

			const provider = createGenApi(options)
			provider('model-id')

			const constructorCall =
				GenApiChatLanguageModelMock.mock.calls[0]
			const config = constructorCall[2]

			expect(config.url({ modelId: 'model-id', path: '/v1/chat' })).toBe(
				'https://api.example.com/v1/chat',
			)
		})
	})
})
