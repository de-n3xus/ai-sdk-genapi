import { z, ZodSchema } from 'zod'

export const genApiErrorDataSchema = z.object({
	error: z.object({
		message: z.string(),

		// The additional information below is handled loosely to support
		// genapi providers that have slightly different error
		// responses:
		type: z.string().nullish(),
		param: z.any().nullish(),
		code: z.union([z.string(), z.number()]).nullish(),
	}),
})

export type GenApiErrorData = z.infer<
	typeof genApiErrorDataSchema
>;

export type ProviderErrorStructure<T> = {
	errorSchema: ZodSchema<T>;
	errorToMessage: (error: T) => string;
	isRetryable?: (response: Response, error?: T) => boolean;
};

export const defaultGenApiErrorStructure: ProviderErrorStructure<GenApiErrorData> =
	{
		errorSchema: genApiErrorDataSchema,
		errorToMessage: data => data.error.message,
	}
