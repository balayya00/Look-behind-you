import { useCallback, useEffect } from 'react';
import { findNote } from '../data/notes';
import { useGameStore } from '../stores/gameStore';
import { requestGamePointerLock } from '../game/player/pointerLock';

export const NoteOverlay = (): React.JSX.Element | null => {
  const id = useGameStore((state) => state.activeNoteId);
  const closeNote = useGameStore((state) => state.closeNote);
  const note = id ? findNote(id) : null;
  const close = useCallback(async (): Promise<void> => {
    closeNote();
    await requestGamePointerLock();
  }, [closeNote]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.code === 'KeyE') {
        event.preventDefault();
        void close();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  if (!note) return null;
  return (
    <section className="note-overlay">
      <article className="note-paper">
        <header>
          <p>{note.eyebrow}</p>
          {note.date && <time>{note.date}</time>}
        </header>
        <h2>{note.title}</h2>
        {note.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {note.footer && <footer>{note.footer}</footer>}
        <button className="note-close" onClick={() => void close()}>
          <kbd>E</kbd> CLOSE
        </button>
      </article>
    </section>
  );
};
