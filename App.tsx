import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from './ThemeContext';

import ExerciseListScreen from './screens/ExerciseListScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import EditExerciseScreen from './screens/EditExerciseScreen';
import ExerciseDetailScreen from './screens/ExerciseDetailScreen'; // ✅ Ajouté ici
import SessionsStack from './screens/SessionsStack';
import SettingsScreen from './screens/SettingsScreen';

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  notes?: string;
  youtubeUrl?: string;
};

export type Session = {
  id: string;
  name: string;
  exerciseIds: string[];
};

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function ExercisesStack({ exercises, addExercise, updateExercise }: {
  exercises: Exercise[];
  addExercise: (ex: Exercise) => void;
  updateExercise: (ex: Exercise) => void;
}) {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => {
        const state = navigation.getState();
        const isRoot = state.routes.length === 1;
        return {
          headerShown: true,
          headerStyle: {
            backgroundColor: theme === 'dark' ? '#222' : '#fff',
          },
          headerTintColor: theme === 'dark' ? '#fff' : '#000',
          headerLeft: () =>
            isRoot ? (
              <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 15 }}>
                <Icon name="bars" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                <Icon name="arrow-left" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            ),
        };
      }}
    >
      <Stack.Screen name="ExerciseList" options={{ title: '🏋️ Mes Exercices' }}>
        {(props) => <ExerciseListScreen {...props} exercises={exercises} />}
      </Stack.Screen>

      <Stack.Screen name="AddExercise" options={{ title: '➕ Ajouter un Exercice' }}>
        {(props) => <AddExerciseScreen {...props} addExercise={addExercise} />}
      </Stack.Screen>

      <Stack.Screen name="EditExercise" options={{ title: '✏️ Modifier l\'Exercice' }}>
        {(props) => <EditExerciseScreen {...props} updateExercise={updateExercise} />}
      </Stack.Screen>

      <Stack.Screen name="ExerciseDetail" options={{ title: '📋 Détails de l\'Exercice' }}>
        {(props) => <ExerciseDetailScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function SettingsStack() {
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
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: '⚙️ Paramètres' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { theme } = useTheme();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const storedExercises = await AsyncStorage.getItem('exercises');
      if (storedExercises) setExercises(JSON.parse(storedExercises));

      const storedSessions = await AsyncStorage.getItem('sessions');
      if (storedSessions) setSessions(JSON.parse(storedSessions));
    };
    loadData();
  }, []);

  const addExercise = async (exercise: Exercise) => {
    const newList = [...exercises, exercise];
    setExercises(newList);
    await AsyncStorage.setItem('exercises', JSON.stringify(newList));
  };

  const updateExercise = async (updatedExercise: Exercise) => {
    const updatedList = exercises.map(ex =>
      ex.id === updatedExercise.id ? updatedExercise : ex
    );
    setExercises(updatedList);
    await AsyncStorage.setItem('exercises', JSON.stringify(updatedList));
  };

  const addSession = async (session: Session) => {
    const newList = [...sessions, session];
    setSessions(newList);
    await AsyncStorage.setItem('sessions', JSON.stringify(newList));
  };

  const updateSession = async (updatedSession: Session) => {
    const updatedList = sessions.map(s =>
      s.id === updatedSession.id ? updatedSession : s
    );
    setSessions(updatedList);
    await AsyncStorage.setItem('sessions', JSON.stringify(updatedList));
  };

  return (
    <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme === 'dark' ? '#222' : '#fff',
            width: '75%',
          },
        }}
      >
        <Drawer.Screen name="Exercises" options={{ title: '🏋️ Mes Exercices' }}>
          {(props) => (
            <ExercisesStack
              {...props}
              exercises={exercises}
              addExercise={addExercise}
              updateExercise={updateExercise}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Sessions" options={{ title: '📂 Mes Séances' }}>
          {(props) => (
            <SessionsStack
              {...props}
              sessions={sessions}
              setSessions={setSessions}
              exercises={exercises}
              addSession={addSession}
              updateSession={updateSession}
            />
          )}
        </Drawer.Screen>

        <Drawer.Screen name="Settings" options={{ title: '⚙️ Paramètres' }}>
          {() => <SettingsStack />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
