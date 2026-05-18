import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track, TrackKind, Subject, Topic, Subtopic } from '@/types';
import { TRACKS as SEED_TRACKS } from '@/data/tracks';
import { inferFormatIdFromExamName, DEFAULT_FORMAT_ID } from '@/data/examFormats';
import { auditLog } from './auditStore';

// ─── Types ─────────────────────────────────────────────────────────────────

interface HierarchyState {
  tracks: Track[];

  // ─── Tracks ───
  addTrack: (payload: {
    name: string;
    kind: TrackKind;
    code?: string;
    description?: string;
    formatId: string;
    classLevel?: 11 | 12;
    stream?: string;
  }) => string;
  updateTrack: (
    trackId: string,
    payload: {
      name?: string;
      kind?: TrackKind;
      code?: string;
      description?: string;
      formatId?: string;
      classLevel?: 11 | 12;
      stream?: string;
      isPublished?: boolean;
    }
  ) => void;
  archiveTrack: (trackId: string) => void;
  restoreTrack: (trackId: string) => void;
  reorderTrack: (trackId: string, direction: 'up' | 'down') => void;

  // ─── Subjects ───
  addSubject: (trackId: string, payload: { name: string }) => void;
  updateSubject: (subjectId: string, payload: { name?: string }) => void;
  archiveSubject: (subjectId: string) => void;
  restoreSubject: (subjectId: string) => void;
  reorderSubject: (subjectId: string, direction: 'up' | 'down') => void;

  // ─── Chapters ───
  addChapter: (subjectId: string, payload: { name: string; classLevel: 11 | 12 }) => void;
  updateChapter: (chapterId: string, payload: { name?: string; classLevel?: 11 | 12 }) => void;
  archiveChapter: (chapterId: string) => void;
  restoreChapter: (chapterId: string) => void;
  reorderChapter: (chapterId: string, direction: 'up' | 'down') => void;

  // ─── Topics ───
  addTopic: (chapterId: string, payload: { name: string }) => void;
  updateTopic: (topicId: string, payload: { name?: string }) => void;
  archiveTopic: (topicId: string) => void;
  restoreTopic: (topicId: string) => void;
  reorderTopic: (topicId: string, direction: 'up' | 'down') => void;
  moveTopic: (topicId: string, newChapterId: string) => void;

  // ─── Subtopics ───
  addSubtopic: (topicId: string, payload: { name: string }) => void;
  updateSubtopic: (subtopicId: string, payload: { name?: string }) => void;
  archiveSubtopic: (subtopicId: string) => void;
  restoreSubtopic: (subtopicId: string) => void;
  reorderSubtopic: (subtopicId: string, direction: 'up' | 'down') => void;
  moveSubtopic: (subtopicId: string, newTopicId: string) => void;

  resetToSeed: () => void;
}

// ─── ID generation ─────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Helpers (pure) ────────────────────────────────────────────────────────

function findSubject(tracks: Track[], subjectId: string) {
  for (const track of tracks) {
    const subject = track.subjects.find((s) => s.id === subjectId);
    if (subject) return { track, subject };
  }
  return null;
}

function findChapter(tracks: Track[], chapterId: string) {
  for (const track of tracks) {
    for (const subj of track.subjects) {
      const ch = subj.chapters.find((c) => c.id === chapterId);
      if (ch) return { track, subject: subj, chapter: ch };
    }
  }
  return null;
}

function findTopic(tracks: Track[], topicId: string) {
  for (const track of tracks) {
    for (const subj of track.subjects) {
      for (const ch of subj.chapters) {
        const tp = ch.topics.find((t) => t.id === topicId);
        if (tp) return { track, subject: subj, chapter: ch, topic: tp };
      }
    }
  }
  return null;
}

function findSubtopic(tracks: Track[], subtopicId: string) {
  for (const track of tracks) {
    for (const subj of track.subjects) {
      for (const ch of subj.chapters) {
        for (const tp of ch.topics) {
          const st = tp.subtopics.find((s) => s.id === subtopicId);
          if (st) return { track, subject: subj, chapter: ch, topic: tp, subtopic: st };
        }
      }
    }
  }
  return null;
}

function shiftItem<T>(arr: T[], index: number, direction: 'up' | 'down'): T[] {
  const next = [...arr];
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= next.length) return arr;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function mapTrack(tracks: Track[], trackId: string, fn: (t: Track) => Track): Track[] {
  return tracks.map((t) => (t.id === trackId ? fn(t) : t));
}

function mapTrackBySubject(tracks: Track[], subjectId: string, fn: (t: Track) => Track): Track[] {
  return tracks.map((t) =>
    t.subjects.some((s) => s.id === subjectId) ? fn(t) : t
  );
}

function cloneSeed(): Track[] {
  return JSON.parse(JSON.stringify(SEED_TRACKS));
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useHierarchyStore = create<HierarchyState>()(
  persist(
    (set) => ({
      tracks: cloneSeed(),

      // ─── Tracks ──────────────────────────────────────────────────────────

      addTrack: ({ name, kind, code, description, formatId, classLevel, stream }) => {
        const id = makeId('track');
        set((state) => ({
          tracks: [
            ...state.tracks,
            {
              id,
              kind,
              name,
              code,
              description,
              formatId,
              classLevel: kind === 'class-stream' ? classLevel : undefined,
              stream: kind === 'class-stream' ? stream : undefined,
              isPublished: false, // authors create unpublished
              subjects: [],
            },
          ],
        }));
        auditLog({
          type: 'track',
          action: 'create',
          id,
          label: name,
          details: { kind, formatId, classLevel, stream },
        });
        return id;
      },

      updateTrack: (trackId, payload) =>
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (!track) return state;
          const isPublishToggle =
            Object.keys(payload).length === 1 && 'isPublished' in payload;
          auditLog({
            type: 'track',
            action: isPublishToggle
              ? payload.isPublished
                ? 'publish'
                : 'unpublish'
              : 'update',
            id: trackId,
            label: track.name,
            details: payload as Record<string, unknown>,
          });
          return {
            tracks: state.tracks.map((t) =>
              t.id === trackId ? { ...t, ...payload } : t
            ),
          };
        }),

      archiveTrack: (trackId) =>
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) auditLog({ type: 'track', action: 'archive', id: trackId, label: track.name });
          return {
            tracks: state.tracks.map((t) =>
              t.id === trackId ? { ...t, archivedAt: new Date().toISOString() } : t
            ),
          };
        }),

      restoreTrack: (trackId) =>
        set((state) => {
          const track = state.tracks.find((t) => t.id === trackId);
          if (track) auditLog({ type: 'track', action: 'restore', id: trackId, label: track.name });
          return {
            tracks: state.tracks.map((t) => {
              if (t.id !== trackId) return t;
              const { archivedAt: _omit, ...rest } = t;
              return rest;
            }),
          };
        }),

      reorderTrack: (trackId, direction) =>
        set((state) => {
          const idx = state.tracks.findIndex((t) => t.id === trackId);
          if (idx < 0) return state;
          const track = state.tracks[idx];
          auditLog({
            type: 'track',
            action: 'reorder',
            id: trackId,
            label: track.name,
            details: { direction },
          });
          return { tracks: shiftItem(state.tracks, idx, direction) };
        }),

      // ─── Subjects ────────────────────────────────────────────────────────

      addSubject: (trackId, { name }) => {
        const id = makeId('subj');
        set((state) => ({
          tracks: mapTrack(state.tracks, trackId, (t) => ({
            ...t,
            subjects: [
              ...t.subjects,
              { id, trackId, name, chapters: [] },
            ],
          })),
        }));
        auditLog({ type: 'subject', action: 'create', id, label: name });
      },

      updateSubject: (subjectId, payload) =>
        set((state) => {
          const found = findSubject(state.tracks, subjectId);
          if (found) {
            auditLog({
              type: 'subject',
              action: 'update',
              id: subjectId,
              label: found.subject.name,
              details: payload as Record<string, unknown>,
            });
          }
          return {
            tracks: mapTrackBySubject(state.tracks, subjectId, (t) => ({
              ...t,
              subjects: t.subjects.map((s) =>
                s.id === subjectId ? { ...s, ...payload } : s
              ),
            })),
          };
        }),

      archiveSubject: (subjectId) =>
        set((state) => {
          const found = findSubject(state.tracks, subjectId);
          if (found) {
            auditLog({
              type: 'subject',
              action: 'archive',
              id: subjectId,
              label: found.subject.name,
            });
          }
          return {
            tracks: mapTrackBySubject(state.tracks, subjectId, (t) => ({
              ...t,
              subjects: t.subjects.map((s) =>
                s.id === subjectId ? { ...s, archivedAt: new Date().toISOString() } : s
              ),
            })),
          };
        }),

      restoreSubject: (subjectId) =>
        set((state) => {
          const found = findSubject(state.tracks, subjectId);
          if (found) {
            auditLog({
              type: 'subject',
              action: 'restore',
              id: subjectId,
              label: found.subject.name,
            });
          }
          return {
            tracks: mapTrackBySubject(state.tracks, subjectId, (t) => ({
              ...t,
              subjects: t.subjects.map((s) => {
                if (s.id !== subjectId) return s;
                const { archivedAt: _omit, ...rest } = s;
                return rest;
              }),
            })),
          };
        }),

      reorderSubject: (subjectId, direction) =>
        set((state) => {
          const found = findSubject(state.tracks, subjectId);
          if (found) {
            auditLog({
              type: 'subject',
              action: 'reorder',
              id: subjectId,
              label: found.subject.name,
              details: { direction },
            });
          }
          return {
            tracks: mapTrackBySubject(state.tracks, subjectId, (t) => {
              const idx = t.subjects.findIndex((s) => s.id === subjectId);
              if (idx < 0) return t;
              return { ...t, subjects: shiftItem(t.subjects, idx, direction) };
            }),
          };
        }),

      // ─── Chapters ────────────────────────────────────────────────────────

      addChapter: (subjectId, { name, classLevel }) => {
        const id = makeId('ch');
        set((state) => ({
          tracks: state.tracks.map((t) => ({
            ...t,
            subjects: t.subjects.map((subj) =>
              subj.id !== subjectId
                ? subj
                : {
                    ...subj,
                    chapters: [
                      ...subj.chapters,
                      { id, subjectId, name, classLevel, topics: [] },
                    ],
                  }
            ),
          })),
        }));
        auditLog({
          type: 'chapter',
          action: 'create',
          id,
          label: name,
          details: { classLevel },
        });
      },

      updateChapter: (chapterId, payload) =>
        set((state) => {
          const found = findChapter(state.tracks, chapterId);
          if (found) {
            auditLog({
              type: 'chapter',
              action: 'update',
              id: chapterId,
              label: found.chapter.name,
              details: payload as Record<string, unknown>,
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) =>
                  ch.id === chapterId ? { ...ch, ...payload } : ch
                ),
              })),
            })),
          };
        }),

      archiveChapter: (chapterId) =>
        set((state) => {
          const found = findChapter(state.tracks, chapterId);
          if (found) {
            auditLog({
              type: 'chapter',
              action: 'archive',
              id: chapterId,
              label: found.chapter.name,
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) =>
                  ch.id === chapterId ? { ...ch, archivedAt: new Date().toISOString() } : ch
                ),
              })),
            })),
          };
        }),

      restoreChapter: (chapterId) =>
        set((state) => {
          const found = findChapter(state.tracks, chapterId);
          if (found) {
            auditLog({
              type: 'chapter',
              action: 'restore',
              id: chapterId,
              label: found.chapter.name,
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => {
                  if (ch.id !== chapterId) return ch;
                  const { archivedAt: _omit, ...rest } = ch;
                  return rest;
                }),
              })),
            })),
          };
        }),

      reorderChapter: (chapterId, direction) =>
        set((state) => {
          const found = findChapter(state.tracks, chapterId);
          if (found) {
            auditLog({
              type: 'chapter',
              action: 'reorder',
              id: chapterId,
              label: found.chapter.name,
              details: { direction },
            });
          }
          return {
            // Reorders within the same class group only.
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => {
                const target = subj.chapters.find((c) => c.id === chapterId);
                if (!target) return subj;
                const sameClass = subj.chapters.filter((c) => c.classLevel === target.classLevel);
                const idxInGroup = sameClass.findIndex((c) => c.id === chapterId);
                const swapIdx = direction === 'up' ? idxInGroup - 1 : idxInGroup + 1;
                if (swapIdx < 0 || swapIdx >= sameClass.length) return subj;
                const swapWith = sameClass[swapIdx];
                const newChapters = [...subj.chapters];
                const a = newChapters.findIndex((c) => c.id === chapterId);
                const b = newChapters.findIndex((c) => c.id === swapWith.id);
                [newChapters[a], newChapters[b]] = [newChapters[b], newChapters[a]];
                return { ...subj, chapters: newChapters };
              }),
            })),
          };
        }),

      // ─── Topics ──────────────────────────────────────────────────────────

      addTopic: (chapterId, { name }) => {
        const id = makeId('tp');
        set((state) => ({
          tracks: state.tracks.map((t) => ({
            ...t,
            subjects: t.subjects.map((subj) => ({
              ...subj,
              chapters: subj.chapters.map((ch) =>
                ch.id !== chapterId
                  ? ch
                  : {
                      ...ch,
                      topics: [
                        ...ch.topics,
                        { id, chapterId, name, questionCount: 0, subtopics: [] },
                      ],
                    }
              ),
            })),
          })),
        }));
        auditLog({ type: 'topic', action: 'create', id, label: name });
      },

      updateTopic: (topicId, payload) =>
        set((state) => {
          const found = findTopic(state.tracks, topicId);
          if (found) {
            auditLog({
              type: 'topic',
              action: 'update',
              id: topicId,
              label: found.topic.name,
              details: payload as Record<string, unknown>,
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => ({
                  ...ch,
                  topics: ch.topics.map((tp) =>
                    tp.id === topicId ? { ...tp, ...payload } : tp
                  ),
                })),
              })),
            })),
          };
        }),

      archiveTopic: (topicId) =>
        set((state) => {
          const found = findTopic(state.tracks, topicId);
          if (found) {
            auditLog({ type: 'topic', action: 'archive', id: topicId, label: found.topic.name });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => ({
                  ...ch,
                  topics: ch.topics.map((tp) =>
                    tp.id === topicId ? { ...tp, archivedAt: new Date().toISOString() } : tp
                  ),
                })),
              })),
            })),
          };
        }),

      restoreTopic: (topicId) =>
        set((state) => {
          const found = findTopic(state.tracks, topicId);
          if (found) {
            auditLog({ type: 'topic', action: 'restore', id: topicId, label: found.topic.name });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => ({
                  ...ch,
                  topics: ch.topics.map((tp) => {
                    if (tp.id !== topicId) return tp;
                    const { archivedAt: _omit, ...rest } = tp;
                    return rest;
                  }),
                })),
              })),
            })),
          };
        }),

      reorderTopic: (topicId, direction) =>
        set((state) => {
          const found = findTopic(state.tracks, topicId);
          if (found) {
            auditLog({
              type: 'topic',
              action: 'reorder',
              id: topicId,
              label: found.topic.name,
              details: { direction },
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => {
                  const idx = ch.topics.findIndex((tp) => tp.id === topicId);
                  if (idx < 0) return ch;
                  return { ...ch, topics: shiftItem(ch.topics, idx, direction) };
                }),
              })),
            })),
          };
        }),

      moveTopic: (topicId, newChapterId) =>
        set((state) => {
          const found = findTopic(state.tracks, topicId);
          const targetChapter = findChapter(state.tracks, newChapterId);
          if (!found || !targetChapter) return state;
          // Within-subject moves only.
          if (found.subject.id !== targetChapter.subject.id) return state;
          if (found.chapter.id === newChapterId) return state;

          const movedTopic: Topic = { ...found.topic, chapterId: newChapterId };

          auditLog({
            type: 'topic',
            action: 'move',
            id: topicId,
            label: found.topic.name,
            details: {
              from: found.chapter.name,
              to: targetChapter.chapter.name,
            },
          });

          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => {
                  if (ch.id === found.chapter.id) {
                    return { ...ch, topics: ch.topics.filter((tp) => tp.id !== topicId) };
                  }
                  if (ch.id === newChapterId) {
                    return { ...ch, topics: [...ch.topics, movedTopic] };
                  }
                  return ch;
                }),
              })),
            })),
          };
        }),

      // ─── Subtopics ───────────────────────────────────────────────────────

      addSubtopic: (topicId, { name }) => {
        const id = makeId('st');
        set((state) => ({
          tracks: state.tracks.map((t) => ({
            ...t,
            subjects: t.subjects.map((subj) => ({
              ...subj,
              chapters: subj.chapters.map((ch) => ({
                ...ch,
                topics: ch.topics.map((tp) =>
                  tp.id !== topicId
                    ? tp
                    : {
                        ...tp,
                        subtopics: [
                          ...tp.subtopics,
                          { id, topicId, name },
                        ],
                      }
                ),
              })),
            })),
          })),
        }));
        auditLog({ type: 'subtopic', action: 'create', id, label: name });
      },

      updateSubtopic: (subtopicId, payload) =>
        set((state) => {
          const found = findSubtopic(state.tracks, subtopicId);
          if (found) {
            auditLog({
              type: 'subtopic',
              action: 'update',
              id: subtopicId,
              label: found.subtopic.name,
              details: payload as Record<string, unknown>,
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => ({
                  ...ch,
                  topics: ch.topics.map((tp) => ({
                    ...tp,
                    subtopics: tp.subtopics.map((st) =>
                      st.id === subtopicId ? { ...st, ...payload } : st
                    ),
                  })),
                })),
              })),
            })),
          };
        }),

      archiveSubtopic: (subtopicId) =>
        set((state) => {
          const found = findSubtopic(state.tracks, subtopicId);
          if (found) {
            auditLog({
              type: 'subtopic',
              action: 'archive',
              id: subtopicId,
              label: found.subtopic.name,
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => ({
                  ...ch,
                  topics: ch.topics.map((tp) => ({
                    ...tp,
                    subtopics: tp.subtopics.map((st) =>
                      st.id === subtopicId ? { ...st, archivedAt: new Date().toISOString() } : st
                    ),
                  })),
                })),
              })),
            })),
          };
        }),

      restoreSubtopic: (subtopicId) =>
        set((state) => {
          const found = findSubtopic(state.tracks, subtopicId);
          if (found) {
            auditLog({
              type: 'subtopic',
              action: 'restore',
              id: subtopicId,
              label: found.subtopic.name,
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => ({
                  ...ch,
                  topics: ch.topics.map((tp) => ({
                    ...tp,
                    subtopics: tp.subtopics.map((st) => {
                      if (st.id !== subtopicId) return st;
                      const { archivedAt: _omit, ...rest } = st;
                      return rest;
                    }),
                  })),
                })),
              })),
            })),
          };
        }),

      reorderSubtopic: (subtopicId, direction) =>
        set((state) => {
          const found = findSubtopic(state.tracks, subtopicId);
          if (found) {
            auditLog({
              type: 'subtopic',
              action: 'reorder',
              id: subtopicId,
              label: found.subtopic.name,
              details: { direction },
            });
          }
          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => ({
                  ...ch,
                  topics: ch.topics.map((tp) => {
                    const idx = tp.subtopics.findIndex((s) => s.id === subtopicId);
                    if (idx < 0) return tp;
                    return { ...tp, subtopics: shiftItem(tp.subtopics, idx, direction) };
                  }),
                })),
              })),
            })),
          };
        }),

      moveSubtopic: (subtopicId, newTopicId) =>
        set((state) => {
          const found = findSubtopic(state.tracks, subtopicId);
          const targetTopic = findTopic(state.tracks, newTopicId);
          if (!found || !targetTopic) return state;
          // Within-subject moves only.
          if (found.subject.id !== targetTopic.subject.id) return state;
          if (found.topic.id === newTopicId) return state;

          const movedSubtopic: Subtopic = { ...found.subtopic, topicId: newTopicId };

          auditLog({
            type: 'subtopic',
            action: 'move',
            id: subtopicId,
            label: found.subtopic.name,
            details: {
              from: found.topic.name,
              to: targetTopic.topic.name,
            },
          });

          return {
            tracks: state.tracks.map((t) => ({
              ...t,
              subjects: t.subjects.map((subj) => ({
                ...subj,
                chapters: subj.chapters.map((ch) => ({
                  ...ch,
                  topics: ch.topics.map((tp) => {
                    if (tp.id === found.topic.id) {
                      return { ...tp, subtopics: tp.subtopics.filter((s) => s.id !== subtopicId) };
                    }
                    if (tp.id === newTopicId) {
                      return { ...tp, subtopics: [...tp.subtopics, movedSubtopic] };
                    }
                    return tp;
                  }),
                })),
              })),
            })),
          };
        }),

      // ─── Reset ───────────────────────────────────────────────────────────

      resetToSeed: () => {
        set({ tracks: cloneSeed() });
        auditLog({
          type: 'track',
          action: 'reset-seed',
          id: 'all',
          label: 'Reset hierarchy to seed',
        });
      },
    }),
    {
      name: 'preplab-hierarchy',
      // v4 = top-level renamed `exams` → `tracks`; each track has `kind`.
      version: 4,
      migrate: (persisted, version) => {
        // v1 = flat subjects[]; incompatible
        if (version < 2) return { tracks: cloneSeed() } as HierarchyState;

        // v2 → v3 backfilled formatId on Exam rows. We can ignore that
        // step's output here because v3 → v4 reshapes exams → tracks anyway.

        // v2 / v3 → v4: reshape exams → tracks
        if (
          version < 4 &&
          persisted &&
          typeof persisted === 'object' &&
          'exams' in persisted
        ) {
          const old = persisted as {
            exams: Array<{
              id?: string;
              name: string;
              code?: string;
              description?: string;
              formatId?: string;
              isPublished?: boolean;
              archivedAt?: string;
              subjects?: Array<{
                id: string;
                examId?: string;
                trackId?: string;
                name: string;
                chapters: Array<{ id: string; subjectId: string; name: string; classLevel: 11 | 12; topics: Array<{ id: string; chapterId: string; name: string; questionCount: number; subtopics: Array<{ id: string; topicId: string; name: string }>; archivedAt?: string }>; archivedAt?: string }>;
                archivedAt?: string;
              }>;
            }>;
          };
          const tracks: Track[] = old.exams.map((e) => {
            const id = e.id ?? makeId('track');
            return {
              id,
              kind: 'competitive', // best guess for legacy records
              name: e.name,
              code: e.code,
              description: e.description,
              formatId: e.formatId ?? inferFormatIdFromExamName(e.name) ?? DEFAULT_FORMAT_ID,
              isPublished: e.isPublished,
              archivedAt: e.archivedAt,
              subjects: (e.subjects ?? []).map((s) => ({
                id: s.id,
                trackId: id,
                name: s.name,
                chapters: s.chapters,
                archivedAt: s.archivedAt,
              })),
            };
          });
          return { tracks } as HierarchyState;
        }

        return persisted as HierarchyState;
      },
    }
  )
);

// ─── Convenience selectors ─────────────────────────────────────────────────

export const useTracks = () => useHierarchyStore((s) => s.tracks);

export const useTrack = (trackId: string) =>
  useHierarchyStore((s) => s.tracks.find((t) => t.id === trackId));

/**
 * Backward-compat selector: flattens subjects across every track.
 *
 * Keeps non-author screens (Dashboard, Heatmap, TopicBrowser) compiling
 * during the multi-track migration. They'll get track-aware filtering
 * later (Stage C2).
 */
export const useSubjects = (): Subject[] => {
  const tracks = useHierarchyStore((s) => s.tracks);
  return useMemo(() => tracks.flatMap((t) => t.subjects), [tracks]);
};

export const useSubject = (subjectId: string) =>
  useHierarchyStore((s) => {
    for (const t of s.tracks) {
      const subject = t.subjects.find((subj) => subj.id === subjectId);
      if (subject) return subject;
    }
    return undefined;
  });

export const useTrackForSubject = (subjectId: string) =>
  useHierarchyStore((s) => s.tracks.find((t) => t.subjects.some((subj) => subj.id === subjectId)));

// ─── Deprecated aliases (for files that still say `exams` mid-migration) ──

/** @deprecated use `useTracks()` */
export const useExams = useTracks;
