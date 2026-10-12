import { ChatsPage } from './chats-page';

/**
 * "Conversations" → "Unanswered": the queue an operator picks a chat out of. Everything it can
 * do today is the taking over every chat list shares; what the chat becomes afterwards lives in
 * ActiveChatsPage.
 */
export class UnansweredChatsPage extends ChatsPage {}
