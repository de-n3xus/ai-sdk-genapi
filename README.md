# AI SDK - GenAPI Provider

This package is made from `ai-sdk-genapi` for [GenApi](https://gen-api.ru)

## Setup

The provider is available in the `ai-sdk-genapi` module. You can install it with

```bash
npm i ai-sdk-genapi
```

## Provider Instance

You can import the provider creation method `createGenApi` from `ai-sdk-genapi`:

```ts
import { createGenApi } from 'ai-sdk-genapi';
```

## Api Key
`apiKey` is not required in params, default value is `process.env.GENAPI_API_KEY`

## Example

```ts
import { createGenApi } from 'ai-sdk-genapi';
import { generateText } from 'ai';

const { text } = await generateText({
  model: createGenApi({
    name: 'example',
    apiKey: process.env.MY_API_KEY,
  }).chatModel('gpt-4o-mini'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

### Customizing headers

You can further customize headers if desired. For example, here is an alternate implementation to pass along api key authentication:

```ts
import { createGenApi } from 'ai-sdk-genapi';
import { generateText } from 'ai';

const { text } = await generateText({
  model: createGenApi({
    name: 'example',
    headers: {
      Authorization: `Bearer ${process.env.MY_API_KEY}`,
    },
  }).chatModel('gpt-4o-mini'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

### Including model ids for auto-completion

```ts
import { createGenApi } from 'ai-sdk-genapi';
import { generateText } from 'ai';

type ExampleChatModelIds =
  | 'gpt-4o-mini'
  | 'claude'
  | (string & {});

type ExampleCompletionModelIds =
  | 'deepseek-r1'
  | 'o1-mini'
  | (string & {});

type ExampleEmbeddingModelIds =
  | 'embeddings'
  | 'recraft
  | (string & {});

const model = createGenApi<
  ExampleChatModelIds,
  ExampleCompletionModelIds,
  ExampleEmbeddingModelIds
>({
  name: 'example',
  apiKey: process.env.MY_API_KEY,
});

// Subsequent calls to e.g. `model.chatModel` will auto-complete the model id
// from the list of `ExampleChatModelIds` while still allowing free-form
// strings as well.

const { text } = await generateText({
  model: model.chatModel('gpt-4o-mini'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```
