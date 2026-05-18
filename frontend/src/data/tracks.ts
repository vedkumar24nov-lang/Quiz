import type { Track, Subject } from '@/types';
import { PHYSICS, CHEMISTRY, MATHEMATICS } from './subjects';

// ─── Competitive tracks ────────────────────────────────────────────────────
// Wrap the existing Physics / Chemistry / Maths content (already authored
// in subjects.ts) under the JEE Main competitive track.

export const JEE_MAIN: Track = {
  id: 'track-jee-main',
  kind: 'competitive',
  name: 'JEE Main',
  code: 'JEE-MAIN',
  description: 'Joint Entrance Examination (Main) — engineering admissions in India. NTA-conducted; ~10L candidates per session.',
  formatId: 'fmt-jee-main',
  isPublished: true,
  subjects: [PHYSICS, CHEMISTRY, MATHEMATICS],
};

// Placeholder syllabus — author fills the rest in via the console.
export const NEET_UG: Track = {
  id: 'track-neet-ug',
  kind: 'competitive',
  name: 'NEET (UG)',
  code: 'NEET',
  description: 'National Eligibility-cum-Entrance Test (Undergraduate) — medical / dental admissions. Physics + Chemistry + Biology.',
  formatId: 'fmt-neet-ug',
  isPublished: true,
  subjects: [
    {
      id: 'subj-neet-physics',
      trackId: 'track-neet-ug',
      name: 'Physics',
      chapters: [
        {
          id: 'ch-neet-mechanics',
          subjectId: 'subj-neet-physics',
          name: 'Mechanics (NEET scope)',
          classLevel: 11,
          topics: [
            {
              id: 'tp-neet-laws-motion',
              chapterId: 'ch-neet-mechanics',
              name: "Laws of Motion",
              questionCount: 0,
              subtopics: [
                { id: 'st-neet-newtons', topicId: 'tp-neet-laws-motion', name: "Newton's Laws (NEET-level applications)" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'subj-neet-chemistry',
      trackId: 'track-neet-ug',
      name: 'Chemistry',
      chapters: [
        {
          id: 'ch-neet-organic',
          subjectId: 'subj-neet-chemistry',
          name: 'Organic Chemistry Basics',
          classLevel: 11,
          topics: [],
        },
      ],
    },
    {
      id: 'subj-neet-biology',
      trackId: 'track-neet-ug',
      name: 'Biology',
      chapters: [
        {
          id: 'ch-neet-cell',
          subjectId: 'subj-neet-biology',
          name: 'Cell Structure & Function',
          classLevel: 11,
          topics: [
            {
              id: 'tp-neet-cell-organelles',
              chapterId: 'ch-neet-cell',
              name: 'Cell Organelles',
              questionCount: 0,
              subtopics: [],
            },
          ],
        },
        {
          id: 'ch-neet-genetics',
          subjectId: 'subj-neet-biology',
          name: 'Genetics & Evolution',
          classLevel: 12,
          topics: [],
        },
      ],
    },
  ],
};

// ─── Class-stream tracks (demo placeholders) ──────────────────────────────
// Empty syllabus — authors populate via the console. Demonstrates the
// class-stream pattern: same student picks "Class 11 PCM" + "JEE Main"
// in parallel.

export const CLASS_11_PCM: Track = {
  id: 'track-class-11-pcm',
  kind: 'class-stream',
  classLevel: 11,
  stream: 'PCM',
  name: 'Class 11 PCM',
  code: '11-PCM',
  description: 'NCERT Class 11 — Physics, Chemistry, Mathematics. School-curriculum track.',
  formatId: 'fmt-topic-test',
  isPublished: true,
  subjects: [],
};

export const CLASS_12_PCB: Track = {
  id: 'track-class-12-pcb',
  kind: 'class-stream',
  classLevel: 12,
  stream: 'PCB',
  name: 'Class 12 PCB',
  code: '12-PCB',
  description: 'NCERT Class 12 — Physics, Chemistry, Biology. Medical-stream school curriculum.',
  formatId: 'fmt-topic-test',
  isPublished: true,
  subjects: [],
};

// ─── Catalogue ─────────────────────────────────────────────────────────────

export const TRACKS: Track[] = [JEE_MAIN, NEET_UG, CLASS_11_PCM, CLASS_12_PCB];

// ─── Lookup helpers ────────────────────────────────────────────────────────

export function getAllTracks(): Track[] {
  return TRACKS;
}

export function getActiveTracks(): Track[] {
  return TRACKS.filter((t) => !t.archivedAt);
}

export function getPublishedTracks(): Track[] {
  return TRACKS.filter((t) => !t.archivedAt && t.isPublished !== false);
}

export function getTrackById(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function getTrackBySubject(subjectId: string): Track | undefined {
  return TRACKS.find((t) => t.subjects.some((s) => s.id === subjectId));
}

export function getAllSubjectsAcrossTracks(): Subject[] {
  return TRACKS.flatMap((t) => t.subjects);
}

export function getSubjectsForTrack(trackId: string): Subject[] {
  return TRACKS.find((t) => t.id === trackId)?.subjects ?? [];
}
