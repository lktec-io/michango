import { FiWifiOff } from 'react-icons/fi';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import './NetworkStatusBanner.css';

export default function NetworkStatusBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="network-status-banner" role="status">
      <FiWifiOff />
      <span>You&apos;re offline. Changes won&apos;t be saved until your connection is back.</span>
    </div>
  );
}
