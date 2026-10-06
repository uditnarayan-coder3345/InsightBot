import { Bot } from 'lucide-react';
import SourceCard from './SourceCard';
import MessageActions from './MessageActions';
export default function AIMessage({ message, onCopy, copied, feedback, onFeedback, onRegenerate, regenerating }) {
  return <article className="ai-message-row"><div className="bot-mark"><Bot size={20} /></div><div className="ai-message-body"><span className="pixel-label message-role ai-role">INSIGHTBOT AI</span>{regenerating ? <div className="regenerating-state" role="status"><span className="loading-dots"><i /><i /><i /></span>Regenerating response…</div> : <><div className="answer-copy"><p>{message.content}</p>{message.bullets && <ul>{message.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}{message.outro && <p>{message.outro}</p>}</div>{message.source && <SourceCard source={message.source} />}</>}<MessageActions onCopy={onCopy} copied={copied} feedback={feedback} onFeedback={onFeedback} onRegenerate={onRegenerate} regenerating={regenerating} /></div></article>;
}
