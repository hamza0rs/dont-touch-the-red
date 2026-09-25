import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameOver } from './components/GameOver';
import { GameHUD } from './components/GameHUD';
import { HowToPlay } from './components/HowToPlay';
import { MainMenu } from './components/MainMenu';
import { PauseMenu } from './components/PauseMenu';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';
import { loadSettings, loadStats, resetStats, saveSettings } from './services/storage';
import { useGame } from './hooks/useGame';
import type { EventTone, GameSettings, GameSnapshot } from './types/game';
import './styles/global.css';

const initialSettings = loadSettings();
const initialSnapshot: GameSnapshot = {
  phase: 'menu',
  score: 0,
  bestScore: loadStats().bestScore,
  combo: 0,
  lives: 3,
  speed: 360,
  level: 1,
  difficulty: 1,
  powerUp: null,
  powerUpMs: 0,
  coins: 0,
  runMs: 0,
  collisions: 0,
  bestCombo: 0,
  isNewBest: false,
  settings: initialSettings,
};

type EventItem = { id: number; message: string; tone: EventTone };

export default function App() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(initialSnapshot);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [stats, setStats] = useState(loadStats());
  const [modal, setModal] = useState<'help' | 'stats' | 'settings' | null>(null);

  const onEvent = useCallback((message: string, tone: EventTone = 'neutral') => {
    const id = Date.now() + Math.random();
    setEvents((current) => [...current.slice(-3), { id, message, tone }]);
    window.setTimeout(() => setEvents((current) => current.filter((event) => event.id !== id)), 2200);
  }, []);

  const onSettings = useCallback((next: GameSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const callbacks = useMemo(() => ({
    onSnapshot: setSnapshot,
    onEvent,
    onSettings,
  }), [onEvent, onSettings]);

  const { hostRef, gameRef } = useGame(callbacks);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (snapshot.phase === 'playing' && ['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(event.key)) {
        event.preventDefault();
      }
      if (event.key === 'Escape' && (snapshot.phase === 'playing' || snapshot.phase === 'paused')) {
        event.preventDefault();
        gameRef.current?.pause();
      }
      if (event.key === 'Enter' && (snapshot.phase === 'menu' || snapshot.phase === 'gameover')) {
        event.preventDefault();
        gameRef.current?.start();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameRef, snapshot.phase]);

  useEffect(() => {
    if (snapshot.phase === 'gameover') setStats(loadStats());
  }, [snapshot.phase]);

  const start = () => gameRef.current?.start();
  const pause = () => gameRef.current?.pause();
  const restart = () => gameRef.current?.start();
  const toMenu = () => gameRef.current?.menu();

  const changeSettings = (next: GameSettings) => {
    setSettings(next);
    saveSettings(next);
    gameRef.current?.setSettings(next);
  };

  const resetAllStats = () => {
    resetStats();
    setStats(loadStats());
    onEvent('STATS RESET.', 'neutral');
  };

  return (
    <main className="app-shell">
      <div className="background-noise" aria-hidden="true" />
      <div className="background-grid" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">◈</div>
          <div><h1>DON'T TOUCH THE RED</h1><p>INFINITE REFLEX LAB</p></div>
        </div>
        <div className="header-actions">
          <button className="ghost-btn" onClick={() => setModal('stats')}>STATS</button>
          <button className="ghost-btn" onClick={() => setModal('help')}>HOW TO PLAY</button>
          <button className="icon-btn" onClick={() => changeSettings({ ...settings, sound: !settings.sound })} aria-label={settings.sound ? 'Mute sound' : 'Unmute sound'}>
            {settings.sound ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      <section className="hero-copy">
        <div>
          <span className="eyebrow">REFLEX / REACTION / CHAOS</span>
          <h2>Touch <span>anything</span> except red.</h2>
          <p>Nine lanes. Infinite waves. Four powers. One bad color.</p>
        </div>
        <div className="run-meta">
          <div><span>BEST</span><strong>{snapshot.bestScore.toLocaleString()}</strong></div>
          <div><span>LEVEL</span><strong>{snapshot.level}</strong></div>
          <div><span>SPEED</span><strong>{snapshot.speed}</strong></div>
        </div>
      </section>

      <section className="game-card">
        {(snapshot.phase === 'playing' || snapshot.phase === 'paused') && <GameHUD snapshot={snapshot} onPause={pause} />}
        <div className="game-stage">
          <div ref={hostRef} className="phaser-host" />

          <div className="event-stack" aria-live="polite">
            {events.map((event) => <div key={event.id} className={`event-pill ${event.tone}`}>{event.message}</div>)}
          </div>

          {snapshot.phase === 'playing' && (
            <div className="touch-controls" aria-label="Movement controls">
              <button type="button" onPointerDown={() => gameRef.current?.moveLeft()} aria-label="Move left">←</button>
              <div><b>MOVE</b><small>9 LANES</small></div>
              <button type="button" onPointerDown={() => gameRef.current?.moveRight()} aria-label="Move right">→</button>
            </div>
          )}

          {snapshot.phase === 'menu' && <MainMenu onStart={start} onHelp={() => setModal('help')} onStats={() => setModal('stats')} onSettings={() => setModal('settings')} />}
          {snapshot.phase === 'paused' && <PauseMenu onResume={pause} onRestart={restart} onMenu={toMenu} />}
          {snapshot.phase === 'gameover' && <GameOver snapshot={snapshot} onRestart={restart} onMenu={toMenu} />}
        </div>
      </section>

      <section className="feature-strip">
        <div><span>∞</span><b>INFINITE WAVES</b><small>procedural obstacles with viable paths</small></div>
        <div><span>⚡</span><b>4 POWER-UPS</b><small>shield · slow-mo · magnet · ghost</small></div>
        <div><span>🔥</span><b>COMBO SYSTEM</b><small>chain coins for score multipliers</small></div>
        <div><span>◫</span><b>LOCAL SAVE</b><small>runs and settings persist in-browser</small></div>
      </section>

      <footer className="footer">
        <span>REACT + TYPESCRIPT + PHASER + VITE</span>
        <span>F1 DEV DEBUG • ESC PAUSE</span>
      </footer>

      {modal === 'help' && <HowToPlay onClose={() => setModal(null)} />}
      {modal === 'stats' && <StatsPanel stats={stats} onClose={() => setModal(null)} onReset={resetAllStats} />}
      {modal === 'settings' && <SettingsPanel settings={settings} onChange={changeSettings} onClose={() => setModal(null)} />}
    </main>
  );
}
