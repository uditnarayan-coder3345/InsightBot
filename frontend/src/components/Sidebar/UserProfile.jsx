import { MoreHorizontal } from 'lucide-react';
import Avatar from '../common/Avatar';
export default function UserProfile() { return <div className="profile-row"><Avatar label="U" /><span className="profile-copy"><strong>Udit</strong><small>User Account</small></span><button type="button" className="icon-button profile-more" aria-label="More account options"><MoreHorizontal size={19} /></button></div>; }
