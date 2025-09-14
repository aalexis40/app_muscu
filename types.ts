// types.ts

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;   // nombre de séries par défaut
  reps: number;   // répétitions par défaut
  notes?: string;
  youtubeUrl?: string;
};

export type SessionExercise = {
  exerciseId: string;
  sets: {
    reps: number;
    weight: number;
  }[];
};

export type Session = {
  id: string;
  name: string;
  exercises: SessionExercise[];
};
