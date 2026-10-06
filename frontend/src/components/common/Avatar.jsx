export default function Avatar({ label = 'U', className = '' }) { return <span className={`avatar ${className}`} aria-hidden="true">{label}</span>; }
