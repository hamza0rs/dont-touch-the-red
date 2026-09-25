import type { GameSnapshot, PowerUpKind } from '../types/game';

const labels: Record<PowerUpKind, string> = { shield: 'SHIELD', slow: 'SLOW-MO', magnet: 'MAGNET', ghost: 'GHOST' };
const icons: Record<PowerUpKind, string> = { shield: 'S', slow: 'T', magnet: 'M', ghost: 'G' };

interface Props { snapshot: GameSnapshot; onPause: () => void; }

export function GameHUD({ snapshot, onPause }: Props) {
  const powerProgress = snapshot.powerUp ? Math.max(0, snapshot.powerUpMs / ({ shield: 6000, slow: 5000, magnet: 6000, ghost: 4000 }[snapshot.powerUp])) : 0;
  return (
    <div className="hud-row">
      <div className="hud-stat main-stat"><span>SCORE</span><strong>{snapshot.score.toLocaleString()}</strong></div>
      <div className="hud-stat"><span>COMBO</span><strong className="combo">x{snapshot.combo}</strong></div>
      <div className="hud-stat"><span>LIVES</span><strong className="lives">{'♥'.repeat(snapshot.lives)}<span className="lost">{'♥'.repeat(3 - snapshot.lives)}</span></strong></div>
      <div className="hud-stat"><span>LEVEL</span><strong>{snapshot.level}</strong></div>
      <div className="power-stat">
        <span>POWER</span>
        <strong>{snapshot.powerUp ? `${icons[snapshot.powerUp]} · ${labels[snapshot.powerUp]}` : '—'}</strong>
        {snapshot.powerUp && <div className="power-meter"><i style={{ transform: `scaleX(${powerProgress})` }} /></div>}
      </div>
      <button className="pause-btn" onClick={onPause}>PAUSE</button>
    </div>
  );
}
