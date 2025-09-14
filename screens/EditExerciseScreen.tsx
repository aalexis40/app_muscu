import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';

export default function EditExerciseScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const { exercise } = route.params;

  const [name, setName] = useState(exercise.name);
  const [muscleGroup, setMuscleGroup] = useState(exercise.muscleGroup);
  const [sets, setSets] = useState(String(exercise.sets));
  const [reps, setReps] = useState(String(exercise.reps));
  const [charge, setCharge] = useState(exercise.charge ? String(exercise.charge) : '');  // <-- ajouté
  const [notes, setNotes] = useState(exercise.notes || '');
  const [video, setVideo] = useState(exercise.video || '');

  const saveChanges = async () => {
    if (!name || !muscleGroup || !sets || !reps) {
      Alert.alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Vérification charge si renseignée
    if (charge && (isNaN(Number(charge)) || Number(charge) < 0)) {
      Alert.alert('Charge invalide', 'Merci de saisir une charge valide (nombre positif).');
      return;
    }

    const updatedExercise = {
      ...exercise,
      name,
      muscleGroup,
      sets: parseInt(sets),
      reps: parseInt(reps),
      charge: charge ? Number(charge) : undefined,  // <-- ajouté
      notes,
      video,
    };

    try {
      const stored = await AsyncStorage.getItem('exercises');
      const exercises = stored ? JSON.parse(stored) : [];
      const updatedList = exercises.map((ex: any) =>
        ex.id === exercise.id ? updatedExercise : ex
      );

      await AsyncStorage.setItem('exercises', JSON.stringify(updatedList));
      navigation.goBack();
    } catch (error) {
      console.error('Erreur de mise à jour', error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        theme === 'dark' && styles.containerDark,
      ]}
    >
      <Text style={styles.header}>Modifier l'exercice</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom de l'exercice"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Groupe musculaire"
        placeholderTextColor="#888"
        value={muscleGroup}
        onChangeText={setMuscleGroup}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre de séries"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={sets}
        onChangeText={setSets}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre de répétitions"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
      />

      <TextInput
        style={styles.input}
        placeholder="Charge (kg)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={charge}
        onChangeText={setCharge}
      />

      <TextInput
        style={styles.input}
        placeholder="Notes ou description"
        placeholderTextColor="#888"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Lien vidéo YouTube"
        placeholderTextColor="#888"
        value={video}
        onChangeText={setVideo}
      />

      <TouchableOpacity style={styles.button} onPress={saveChanges}>
        <Text style={styles.buttonText}>💾 Sauvegarder les modifications</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  containerDark: {
    backgroundColor: '#111',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
