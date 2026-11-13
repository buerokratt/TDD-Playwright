export interface SkmSettings {
  readonly range: string;
  readonly documents: string;
  readonly systemMessage: string;
  readonly maxTokens: string;
  readonly indexName: string;
  readonly queryType: string;
  readonly semanticConfiguration: string;
  readonly inScope: 'true' | 'false';
  readonly useAgentic: 'true' | 'false';
  readonly azureAgentName: string;
  readonly azureAgentType: string;
  readonly azureAgenticMaxOutputTokens: string;
}
