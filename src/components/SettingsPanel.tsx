import type { GameSettings } from '../types/game';
import { Modal } from './Modal';

interface Props { settings: GameSettings; onChange: (next: GameSettings) => void; onClose: () => void; }

export function SettingsPanel({ settings, onChange, onClose }: Props) {
  const toggle = (key: keyof GameSettings) => onChange({ ...settings, [key]: !settings[key] });
  const entries: Array<[keyof GameSettings, string, string]> = [
    ['sound', 'Sound', 'UI and gameplay effects'],
    ['music', 'Music', 'Low-volume procedural loop'],
    ['screenShake', 'Screen shake', 'Impact feedback'],
    ['particles', 'Particles', 'Collect / hit / power effects'],
    ['reducedMotion', 'Reduced motion', 'Lower decorative animation'],
  ];

  return (
    <Modal eyebrow="SETTINGS" title="Tune the experience" onClose={onClose}>
      <div className="settings-list">
        {entries.map(([key, label, hint]) => (
          <button key={key} className="setting-row" onClick={() => toggle(key)}>
            <span><b>{label}</b><small>{hint}</small></span>
            <span className={`toggle ${settings[key] ? 'on' : ''}`} aria-hidden="true"><i /></span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
