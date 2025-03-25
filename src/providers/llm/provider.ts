import { LLMProvider } from '../../types';
import { OpenAIProvider } from './openai';

export class LLMProviderFactory {
  static getProvider(providerName: string = 'openai'): LLMProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      default:
        throw new Error(`Unsupported LLM provider: ${providerName}`);
    }
  }
}

export default LLMProviderFactory;
