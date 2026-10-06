import { Bot } from 'lucide-react';
export default function Loading() { return <div className="loading-row" role="status" aria-label="Preparing a sample response"><span className="bot-mark"><Bot size={19} /></span><span className="loading-dots"><i /><i /><i /></span></div>; }
