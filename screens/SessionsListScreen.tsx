import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type Session = {
  id: string;
  name: string;
  exerciseIds: string[];
};

type Props = {
  navigation: any;
};

export default function SessionsListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('sessions');
      const parsed = stored ? JSON.parse(stored) : [];
      setSessions(parsed);
    } catch (err) {
      console.error('Erreur lors du chargement des séances :', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme === 'dark' ? '#222' : '#eee' }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('SessionDetail', { session: item })}
            >
              <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: 18 }}>
                {item.name}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('EditSession', { sessionId: item.id })}
              style={styles.editButton}
            >
              <Icon name="edit" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme === 'dark' ? '#fff' : '#000', textAlign: 'center', marginTop: 20 }}>
            Aucune séance enregistrée.
          </Text>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme === 'dark' ? '#444' : '#007AFF' }]}
        onPress={() => navigation.navigate('AddSession')}
      >
        <Text style={styles.addButtonText}>➕ Ajouter une Séance</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginLeft: 10,
    padding: 5,
  },
  addButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
