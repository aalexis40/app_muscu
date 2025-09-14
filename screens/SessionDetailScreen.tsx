import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Exercise, Session, SessionExercise } from '../types';

type Props = {
  route: any;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
};

export default function SessionDetailScreen({ route, sessions, setSessions }: Props) {
  const { session } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [localSession, setLocalSession] = useState<Session>({
    ...session,
    exercises: session.exercises || [],
  });
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const stored = await AsyncStorage.getItem('exercises');
        const parsed: Exercise[] = stored ? JSON.parse(stored) : [];
        setAllExercises(parsed);

        const sessionExerciseIds = localSession.exercises.map(e => e.exerciseId);
        const filteredExercises = parsed.filter(ex => sessionExerciseIds.includes(ex.id));
        setSessionExercises(filteredExercises);
      } catch (error) {
        console.error("Erreur chargement exercices", error);
      }
    };

    loadExercises();
  }, [localSession]);

  const saveSession = async (updatedSession: Session) => {
    try {
      const stored = await AsyncStorage.getItem('sessions');
      const sessionsStorage: Session[] = stored ? JSON.parse(stored) : [];

      const updatedSessions = sessionsStorage.map(s =>
        s.id === updatedSession.id ? updatedSession : s
      );

      await AsyncStorage.setItem('sessions', JSON.stringify(updatedSessions));

      setLocalSession(updatedSession);
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Erreur sauvegarde session", error);
    }
  };

  const addExerciseToSession = async (exerciseId: string) => {
    if (localSession.exercises.find(e => e.exerciseId === exerciseId)) {
      Alert.alert('Attention', 'Cet exercice est déjà dans la séance.');
      return;
    }

    const exercise = allExercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newSessionExercise: SessionExercise = {
      exerciseId,
      sets: Array.from({ length: exercise.sets }, () => ({
        reps: exercise.reps,
        weight: 0,
      })),
    };

    const updatedSession: Session = {
      ...localSession,
      exercises: [...localSession.exercises, newSessionExercise],
    };

    await saveSession(updatedSession);
    setIsExpanded(false);
  };

  const removeExerciseFromSession = (exerciseId: string) => {
    Alert.alert(
      "Supprimer l'exercice",
      "Voulez-vous vraiment supprimer cet exercice de la séance ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updatedExercises = localSession.exercises.filter(e => e.exerciseId !== exerciseId);

            const updatedSession: Session = {
              ...localSession,
              exercises: updatedExercises,
            };

            await saveSession(updatedSession);
          },
        },
      ]
    );
  };

  const updateSetDetail = (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weight',
    rawValue: string
  ) => {
    const inputKey = `${exerciseId}_${setIndex}_${field}`;
    setInputValues(prev => ({ ...prev, [inputKey]: rawValue }));

    const normalized = rawValue.replace(',', '.');
    if (!/^(\d+)?([.,]\d*)?$/.test(rawValue)) return;

    const parsed = parseFloat(normalized);
    if (isNaN(parsed)) return;

    const updatedExercises = localSession.exercises.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;

      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: parsed };

      return { ...ex, sets: newSets };
    });

    const updatedSession: Session = {
      ...localSession,
      exercises: updatedExercises,
    };

    setLocalSession(updatedSession);
    setSessions(prev =>
      prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
    );

    AsyncStorage.setItem('sessions', JSON.stringify(
      sessions.map(s => (s.id === updatedSession.id ? updatedSession : s))
    )).catch(console.error);
  };

  const renderRightActions = (exerciseId: string) => (
    <TouchableOpacity
      style={[styles.deleteButton, { backgroundColor: theme === 'dark' ? '#ff5555' : '#ff4444' }]}
      onPress={() => removeExerciseFromSession(exerciseId)}
    >
      <Text style={styles.deleteButtonText}>Supprimer</Text>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const sessionExercise = localSession.exercises.find(e => e.exerciseId === item.id);
    if (!sessionExercise) return null;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <View style={[styles.card, { backgroundColor: theme === 'dark' ? '#222' : '#eee' }]}>
          <Text style={[styles.name, { color: theme === 'dark' ? '#fff' : '#000' }]}>{item.name}</Text>
          <Text style={[styles.details, { color: theme === 'dark' ? '#ccc' : '#333' }]}>
            {item.muscleGroup}
          </Text>

          {sessionExercise.sets.map((set, idx) => {
            const keyReps = `${item.id}_${idx}_reps`;
            const keyWeight = `${item.id}_${idx}_weight`;

            return (
              <View key={idx} style={styles.setRow}>
                <Text style={[styles.setLabel, { color: theme === 'dark' ? '#bbb' : '#555' }]}>
                  Série {idx + 1} :
                </Text>

                <TextInput
                  style={[styles.input, {
                    color: theme === 'dark' ? '#fff' : '#000',
                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                  }]}
                  keyboardType="decimal-pad"
                  value={inputValues[keyReps] ?? set.reps.toString()}
                  onChangeText={text => updateSetDetail(item.id, idx, 'reps', text)}
                  placeholder="Répétitions"
                />

                <TextInput
                  style={[styles.input, {
                    color: theme === 'dark' ? '#fff' : '#000',
                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                  }]}
                  keyboardType="decimal-pad"
                  value={inputValues[keyWeight] ?? set.weight.toString()}
                  onChangeText={text => updateSetDetail(item.id, idx, 'weight', text)}
                  placeholder="Poids (kg)"
                />
              </View>
            );
          })}

          {item.notes ? <Text style={[styles.notes, { color: theme === 'dark' ? '#bbb' : '#555' }]}>{item.notes}</Text> : null}
          {item.youtubeUrl ? (
            <Text style={[styles.link, { color: theme === 'dark' ? '#3399ff' : '#007AFF' }]}>{item.youtubeUrl}</Text>
          ) : null}
        </View>
      </Swipeable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1, paddingBottom: 0 }}>
        <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#000' }]}>
          Exercices de la séance
        </Text>

        <FlatList
          data={sessionExercises}
          keyExtractor={item => item.id}
          renderItem={renderExerciseItem}
          ListEmptyComponent={<Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>Aucun exercice ajouté.</Text>}
        />

        {isExpanded && (
          <View style={[styles.addListContainer, { backgroundColor: theme === 'dark' ? '#111' : '#fafafa' }]}>
            <FlatList
              data={allExercises.filter(e =>
                !localSession.exercises.find(se => se.exerciseId === e.id)
              )}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.addable, { backgroundColor: theme === 'dark' ? '#333' : '#ddd' }]}
                  onPress={() => addExerciseToSession(item.id)}
                >
                  <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 200 }}
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: theme === 'dark' ? '#333' : '#ddd',
            paddingBottom: insets.bottom > 0 ? insets.bottom : 14,
          },
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}>
          {isExpanded ? 'Cacher' : 'Ajouter un exercice existant'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', margin: 16 },
  card: { padding: 12, borderRadius: 8, marginBottom: 10, marginHorizontal: 16 },
  name: { fontSize: 18, fontWeight: '600' },
  details: { fontSize: 14 },
  notes: { fontStyle: 'italic' },
  link: { fontSize: 12 },
  addable: { padding: 10, marginVertical: 4, marginHorizontal: 16, borderRadius: 6 },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  setLabel: {
    width: 60,
    fontSize: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
  },
  toggleButton: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#aaa',
    padding: 14,
  },
  addListContainer: {
    maxHeight: 200,
    marginBottom: 10,
    borderTopWidth: 1,
    borderColor: '#aaa',
  },
});
