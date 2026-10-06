import EmptyChat from './EmptyChat';
import UserMessage from './UserMessage';
import AIMessage from './AIMessage';
import Loading from '../common/Loading';
export default function MessageList({ messages, loading, loadingConversation, copiedId, feedback, onFeedback, onCopy, onRegenerate, regeneratingId, messageScrollRef, onSuggestedPrompt }) {
  return <div className="message-scroll" ref={messageScrollRef} aria-live="polite">{loadingConversation ? <div className="message-column"><Loading /></div> : messages.length === 0 ? <EmptyChat onSuggestedPrompt={onSuggestedPrompt} /> : <div className="message-column">{messages.map((message) => message.role === 'user' ? <UserMessage key={message.id} message={message} /> : <AIMessage key={message.id} message={message} onCopy={() => onCopy(message)} copied={copiedId === message.id} feedback={feedback[message.id]} onFeedback={(value) => onFeedback(message.id, value)} onRegenerate={() => onRegenerate(message)} regenerating={regeneratingId === message.id} />)}{loading && <Loading />}</div>}</div>;
}
