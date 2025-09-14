// ./screens/AddSessionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../ThemeContext';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  navigation: any;
  addSession: (session: { id: string; name: string; exerciseIds: string[] }) => void;
};

export default function AddSessionScreen({ navigation, addSession }: Props) {
  const { theme } = useTheme();
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom de la séance est requis.');
      return;
    }
    const newSession = { id: uuidv4(), name: name.trim(), exerciseIds: [] };
    addSession(newSession);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
      <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>Nom de la séance :</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme === 'dark' ? '#222' : '#eee', color: theme === 'dark' ? '#fff' : '#000' }]}
        placeholder="Entrez le nom"
        placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme === 'dark' ? '#444' : '#007AFF' }]}
        onPress={handleSave}
      >
        <Text style={styles.buttonText}>Sauvegarder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  input: { borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  button: { padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
