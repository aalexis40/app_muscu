import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';

type Session = {
  id: string;
  name: string;
  exerciseIds: string[];
};

type RouteParams = {
  sessionId: string;
};

type Props = {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
};

export default function EditSessionScreen({ sessions, setSessions }: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params as RouteParams;

  const [name, setName] = useState('');

  const session = sessions.find((s) => s.id === sessionId);

  useEffect(() => {
    if (session) setName(session.name);
  }, [session]);

  // Mise à jour du storage AsyncStorage après modification de la liste sessions
  const saveSessionsToStorage = async (newSessions: Session[]) => {
    try {
      await AsyncStorage.setItem('sessions', JSON.stringify(newSessions));
    } catch (e) {
      console.error('Erreur sauvegarde sessions', e);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }

    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, name: name.trim() } : s
    );
    setSessions(updated);
    saveSessionsToStorage(updated);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer cette séance ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const filtered = sessions.filter((s) => s.id !== sessionId);
            setSessions(filtered);
            saveSessionsToStorage(filtered);
            navigation.navigate('SessionsList'); // ou navigation.goBack() si ça marche mieux
          },
        },
      ]
    );
  };

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
        <Button title="Séance introuvable, retour" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
      <TextInput
        style={[styles.input, { color: theme === 'dark' ? '#fff' : '#000' }]}
        value={name}
        onChangeText={setName}
        placeholder="Nom de la séance"
        placeholderTextColor={theme === 'dark' ? '#888' : '#aaa'}
      />
      <Button title="💾 Sauvegarder" onPress={handleSave} />
      <View style={{ height: 10 }} />
      <Button title="🗑️ Supprimer la séance" onPress={handleDelete} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    fontSize: 18,
    padding: 10,
  },
});
