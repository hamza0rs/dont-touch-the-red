import type { ReactNode } from 'react';

interface ModalProps {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ eyebrow, title, onClose, children, className = '' }: ModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className={`modal ${className}`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <span className="eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        {children}
      </section>
    </div>
  );
}
