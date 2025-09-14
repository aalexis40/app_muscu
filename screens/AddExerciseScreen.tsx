import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '../ThemeContext';  // Assure-toi que ce context existe
import AsyncStorage from '@react-native-async-storage/async-storage';

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  charge?: number;
  notes?: string;
  youtubeUrl?: string;
};

type AddExerciseScreenProps = {
  navigation: any;
};


export default function AddExerciseScreen({ navigation }: AddExerciseScreenProps) {
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [charge, setCharge] = useState('');
  const [notes, setNotes] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const isValidYoutubeUrl = (url: string) => {
    return (
      url === '' ||
      /^https:\/\/(www\.)?youtube\.com\/watch\?v=/.test(url) ||
      /^https:\/\/youtu\.be\//.test(url)
    );
  };

  const onSave = () => {
    if (!name.trim() || !muscleGroup.trim() || !sets.trim() || !reps.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
  
    if (!isValidYoutubeUrl(youtubeUrl.trim())) {
      Alert.alert(
        'URL invalide',
        'Merci de saisir une URL YouTube valide ou laissez le champ vide.'
      );
      return;
    }
  
    if (charge && (isNaN(Number(charge)) || Number(charge) < 0)) {
      Alert.alert('Charge invalide', 'Merci de saisir une charge valide (nombre positif).');
      return;
    }
  
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: name.trim(),
      muscleGroup: muscleGroup.trim(),
      sets: Number(sets),
      reps: Number(reps),
      charge: charge ? Number(charge) : undefined,
      notes: notes.trim(),
      youtubeUrl: youtubeUrl.trim() || undefined,
    };
  
    const saveToAsyncStorage = async (exercise: Exercise) => {
      try {
        const stored = await AsyncStorage.getItem('exercises');
        const exercises = stored ? JSON.parse(stored) : [];
  
        const updated = [...exercises, exercise];
        await AsyncStorage.setItem('exercises', JSON.stringify(updated));
        navigation.goBack();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde', error);
        Alert.alert('Erreur', 'La sauvegarde a échoué. Veuillez réessayer.');
      }
    };
  
    saveToAsyncStorage(newExercise);
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
        Nom de l'exercice *
      </Text>
      <TextInput
        style={[styles.input, theme === 'dark' && styles.inputDark]}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Développé couché"
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
      />

      <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
        Groupe musculaire *
      </Text>
      <TextInput
        style={[styles.input, theme === 'dark' && styles.inputDark]}
        value={muscleGroup}
        onChangeText={setMuscleGroup}
        placeholder="Ex: Pectoraux"
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
      />

      <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
        Nombre de séries *
      </Text>
      <TextInput
        style={[styles.input, theme === 'dark' && styles.inputDark]}
        value={sets}
        onChangeText={setSets}
        keyboardType="numeric"
        placeholder="Ex: 4"
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
      />

      <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
        Nombre de répétitions *
      </Text>
      <TextInput
        style={[styles.input, theme === 'dark' && styles.inputDark]}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        placeholder="Ex: 12"
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
      />

      <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
        Charge (kg)
      </Text>
      <TextInput
        style={[styles.input, theme === 'dark' && styles.inputDark]}
        value={charge}
        onChangeText={setCharge}
        keyboardType="numeric"
        placeholder="Ex: 50"
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
      />

      <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
        Description / Notes
      </Text>
      <TextInput
        style={[styles.input, { height: 80 }, theme === 'dark' && styles.inputDark]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Infos supplémentaires"
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
      />

      <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
        Vidéo YouTube (URL)
      </Text>
      <TextInput
        style={[styles.input, theme === 'dark' && styles.inputDark]}
        value={youtubeUrl}
        onChangeText={setYoutubeUrl}
        placeholder="https://youtube.com/watch?v=..."
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Sauvegarder" onPress={onSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#000', // clair par défaut
  },
  labelDark: {
    color: '#fff', // blanc en sombre
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputDark: {
    borderColor: '#555',
    backgroundColor: '#222',
    color: '#eee',
  },
});
