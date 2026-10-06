import Avatar from '../common/Avatar';
export default function UserMessage({ message }) { return <article className="user-message-row"><Avatar label="U" className="message-avatar user-avatar" /><div className="user-message-body"><span className="pixel-label message-role">YOU</span><div className="user-bubble">{message.content}</div></div></article>; }
