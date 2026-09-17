import { ConversationAnalysis } from './conversation-analysis.interface';

export interface AnalysedConversation {
  readonly conversationId: string;
  readonly analysis: ConversationAnalysis;
}
