import type { PersistentStats } from '../types/game';
import { Modal } from './Modal';

interface Props { stats: PersistentStats; onClose: () => void; onReset: () => void; }

function seconds(ms: number) { return `${(ms / 1000).toFixed(1)}s`; }

export function StatsPanel({ stats, onClose, onReset }: Props) {
  return (
    <Modal eyebrow="RUN TELEMETRY" title="Your reflex dashboard" onClose={onClose} className="stats-modal">
      <div className="stats-list">
        <div><span>Personal best</span><b>{stats.bestScore.toLocaleString()}</b></div>
        <div><span>Total games</span><b>{stats.totalGames.toLocaleString()}</b></div>
        <div><span>Total survival</span><b>{seconds(stats.totalSurvivalMs)}</b></div>
        <div><span>Longest run</span><b>{seconds(stats.longestRunMs)}</b></div>
        <div><span>Total coins</span><b>{stats.totalCoins.toLocaleString()}</b></div>
        <div><span>Highest combo</span><b>x{stats.highestCombo}</b></div>
        <div><span>Best difficulty</span><b>{stats.bestDifficulty}</b></div>
        <div><span>Red collisions</span><b>{stats.totalCollisions.toLocaleString()}</b></div>
      </div>
      <button className="danger-outline" onClick={onReset}>RESET STATS</button>
    </Modal>
  );
}
