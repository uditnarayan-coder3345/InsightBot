import { Bot, FileText, Search, Sparkles } from 'lucide-react';
const prompts = ['Summarize a document', 'Find key concepts', 'Explain a section'];
export default function EmptyChat({ onSuggestedPrompt }) {
  return <div className="empty-state"><div className="empty-icon"><Bot size={31} /><Sparkles className="empty-sparkle" size={15} /></div><p className="pixel-label empty-eyebrow">YOUR DOCUMENT DESK</p><h1>HOW CAN I HELP YOU TODAY?</h1><p className="empty-description">Ask a question about your documents and get a clear, grounded answer with sources.</p><div className="empty-flow"><span><FileText size={17} /> UPLOAD DOCUMENT</span><i /><span><Search size={17} /> ASK A QUESTION</span><i /><span><Sparkles size={17} /> GET INSIGHTS</span></div><div className="prompt-grid">{prompts.map((prompt) => <button type="button" key={prompt} onClick={() => onSuggestedPrompt(prompt)}>{prompt}<span aria-hidden="true">↗</span></button>)}</div></div>;
}
