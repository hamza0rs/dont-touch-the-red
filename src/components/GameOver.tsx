import type { GameSnapshot } from '../types/game';

interface Props { snapshot: GameSnapshot; onRestart: () => void; onMenu: () => void; }

const messages = [
  'The red wins this round.',
  'You touched the forbidden color.',
  'Maybe keep looking at the red objects.',
  'Your survival career has ended.',
  'That escalated quickly.',
];

export function GameOver({ snapshot, onRestart, onMenu }: Props) {
  const message = messages[snapshot.score % messages.length];
  return (
    <div className="overlay-card compact-overlay gameover-overlay">
      <div className="kicker bad-text">GAME OVER</div>
      <h3>{message}</h3>
      {snapshot.isNewBest && <div className="record-badge">NEW PERSONAL RECORD 🏆</div>}
      <div className="result-grid">
        <div><span>SCORE</span><strong>{snapshot.score.toLocaleString()}</strong></div>
        <div><span>BEST</span><strong>{snapshot.bestScore.toLocaleString()}</strong></div>
        <div><span>COMBO</span><strong>x{snapshot.bestCombo}</strong></div>
        <div><span>RUN</span><strong>{(snapshot.runMs / 1000).toFixed(1)}s</strong></div>
      </div>
      <div className="gameover-actions">
        <button className="primary-btn" onClick={onRestart}>PLAY AGAIN <span>↻</span></button>
        <button className="mini-btn" onClick={onMenu}>MAIN MENU</button>
      </div>
    </div>
  );
}
