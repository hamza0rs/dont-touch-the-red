import { useEffect, useRef } from 'react';
import { Game } from '../game/Game';
import type { GameCallbacks } from '../types/game';

export function useGame(callbacks: GameCallbacks) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const game = new Game(host, {
      onSnapshot: (snapshot) => callbacksRef.current.onSnapshot(snapshot),
      onEvent: (message, tone) => callbacksRef.current.onEvent(message, tone),
      onSettings: (settings) => callbacksRef.current.onSettings(settings),
    });
    gameRef.current = game;

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  return { hostRef, gameRef };
}
