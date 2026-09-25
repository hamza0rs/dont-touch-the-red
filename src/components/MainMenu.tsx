interface MainMenuProps {
  onStart: () => void;
  onHelp: () => void;
  onStats: () => void;
  onSettings: () => void;
}

export function MainMenu({ onStart, onHelp, onStats, onSettings }: MainMenuProps) {
  return (
    <div className="overlay-card menu-overlay">
      <div className="danger-orbit" aria-hidden="true"><span /><span /><span /></div>
      <div className="kicker">INFINITE REFLEX LAB</div>
      <h3>How long can you survive?</h3>
      <p>Move through 9 lanes, collect the good stuff, and never let a red object touch you.</p>
      <button className="primary-btn huge" onClick={onStart}>PLAY NOW <span>→</span></button>
      <div className="secondary-actions">
        <button className="mini-btn" onClick={onHelp}>HOW TO PLAY</button>
        <button className="mini-btn" onClick={onStats}>STATS</button>
        <button className="mini-btn" onClick={onSettings}>SETTINGS</button>
      </div>
      <div className="micro-copy">No login • No ads • Best score saved locally</div>
    </div>
  );
}
