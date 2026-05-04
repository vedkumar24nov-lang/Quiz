import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SubjectId = 'physics' | 'chemistry' | 'mathematics';

interface SubjectState {
  activeSubjectId: SubjectId;
  setActiveSubject: (id: SubjectId) => void;
}

/**
 * Active subject persists across reloads (LocalStorage).
 * Pages that show subject-scoped content (Dashboard, TopicBrowser, Heatmap)
 * read this and filter accordingly.
 *
 * Cross-subject content (recent attempts feed, "resume" card) intentionally
 * IGNORES this — students are doing JEE prep across all 3 subjects, not one.
 */
export const useSubjectStore = create<SubjectState>()(
  persist(
    (set) => ({
      activeSubjectId: 'physics',
      setActiveSubject: (id) => set({ activeSubjectId: id }),
    }),
    {
      name: 'preplab:active-subject',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useActiveSubjectId = () => useSubjectStore((s) => s.activeSubjectId);
