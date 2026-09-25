import { Modal } from './Modal';

interface Props { onClose: () => void; }

export function HowToPlay({ onClose }: Props) {
  return (
    <Modal eyebrow="HOW TO PLAY" title="Survive. Collect. Flex." onClose={onClose}>
      <div className="help-grid">
        <article><strong>01</strong><p><b>MOVE FAST</b><br />Use ← → or A / D. Tap the on-screen controls or swipe on mobile.</p></article>
        <article><strong>02</strong><p><b>NEVER TOUCH RED</b><br />Every red object is dangerous. Shapes vary, but the danger color stays obvious.</p></article>
        <article><strong>03</strong><p><b>COLLECT GOLD</b><br />Coins increase score and build your combo multiplier.</p></article>
        <article><strong>04</strong><p><b>USE POWERS</b><br />Shield blocks one hit, Slow-Mo slows hazards, Magnet pulls coins, Ghost gives immunity.</p></article>
        <article><strong>05</strong><p><b>WATCH THE SPEED</b><br />The arena accelerates forever. Keep moving instead of waiting for red to arrive.</p></article>
        <article><strong>06</strong><p><b>PAUSE</b><br />Press Escape or the pause button. While paused, score and obstacles freeze.</p></article>
      </div>
      <div className="tip">TIP: The safest lane is never guaranteed twice. Read the next wave early.</div>
    </Modal>
  );
}
