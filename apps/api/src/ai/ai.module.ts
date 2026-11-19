import { Global, Module } from '@nestjs/common';
import { config } from '../config';
import { AI_PROVIDER, AiProvider } from './ai.provider';
import { GeminiProvider } from './gemini.provider';
import { MockProvider } from './mock.provider';

@Global()
@Module({
  providers: [
    {
      provide: AI_PROVIDER,
      useFactory: (): AiProvider =>
        config.ai.provider === 'gemini' && config.ai.geminiApiKey
          ? new GeminiProvider(config.ai.geminiApiKey, config.ai.geminiModel)
          : new MockProvider(),
    },
  ],
  exports: [AI_PROVIDER],
})
export class AiModule {}
