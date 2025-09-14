import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../ThemeContext';

import SessionsListScreen from './SessionsListScreen';
import AddSessionScreen from './AddSessionScreen';
import EditSessionScreen from './EditSessionScreen';
import SessionDetailScreen from './SessionDetailScreen';

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  notes?: string;
  youtubeUrl?: string;
};

type Session = {
  id: string;
  name: string;
  exerciseIds: string[];
};

const Stack = createStackNavigator();

export default function SessionsStack({
  sessions,
  setSessions,
  exercises,
  addSession,
  updateSession,
}: {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  exercises: Exercise[];
  addSession: (session: Session) => void;
  updateSession: (session: Session) => void;
}) {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#222' : '#fff',
        },
        headerTintColor: theme === 'dark' ? '#fff' : '#000',
        headerLeft: () =>
          navigation.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
              <Icon name="arrow-left" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 15 }}>
              <Icon name="bars" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          ),
      })}
    >
      <Stack.Screen
        name="SessionsList"
        options={{ title: '📂 Mes Séances' }}
      >
        {(props) => (
          <SessionsListScreen
            {...props}
            sessions={sessions}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="AddSession"
        options={{ title: '➕ Ajouter une Séance' }}
      >
        {(props) => (
          <AddSessionScreen
            {...props}
            addSession={addSession}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="EditSession"
        options={{ title: '✏️ Modifier la Séance' }}
      >
        {(props) => (
          <EditSessionScreen
            {...props}
            sessions={sessions}
            setSessions={setSessions}
            updateSession={updateSession}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="SessionDetail"
        options={{ title: '📋 Détails de la Séance' }}
      >
        {(props) => (
          <SessionDetailScreen
            {...props}
            exercises={exercises}
            sessions={sessions}
            setSessions={setSessions}
            updateSession={updateSession}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
