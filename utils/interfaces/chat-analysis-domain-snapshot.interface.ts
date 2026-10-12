import { ChatAnalysisConfig } from './chat-analysis-config.interface';

export interface ChatAnalysisDomainSnapshot {
  readonly domainId: string;
  readonly config: ChatAnalysisConfig;
}
