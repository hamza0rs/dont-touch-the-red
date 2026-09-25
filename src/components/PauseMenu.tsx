interface Props { onResume: () => void; onRestart: () => void; onMenu: () => void; }

export function PauseMenu({ onResume, onRestart, onMenu }: Props) {
  return (
    <div className="overlay-card compact-overlay">
      <div className="kicker">PAUSED</div>
      <h3>Reality can wait.</h3>
      <div className="pause-actions">
        <button className="primary-btn" onClick={onResume}>RESUME <span>→</span></button>
        <button className="mini-btn" onClick={onRestart}>RESTART</button>
        <button className="mini-btn" onClick={onMenu}>MAIN MENU</button>
      </div>
    </div>
  );
}
