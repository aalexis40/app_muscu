import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Swipeable } from 'react-native-gesture-handler';

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  charge?: number;
  notes?: string;
  video?: string;
};

type SortCriteria = 'name' | 'muscleGroup' | 'charge' | 'recent';

export default function ExerciseListScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [localExercises, setLocalExercises] = useState<Exercise[]>([]);
  const [searchText, setSearchText] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('name');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadExercises);
    return unsubscribe;
  }, [navigation]);

  const loadExercises = async () => {
    try {
      const stored = await AsyncStorage.getItem('exercises');
      if (stored) {
        const parsed: Exercise[] = JSON.parse(stored);
        setLocalExercises(parsed);
      } else {
        setLocalExercises([]);
      }
    } catch (error) {
      console.error('Erreur de chargement des exercices', error);
    }
  };

  const deleteExercise = async (id: string) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous vraiment supprimer cet exercice ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updatedList = localExercises.filter((ex) => ex.id !== id);
            setLocalExercises(updatedList);
            await AsyncStorage.setItem('exercises', JSON.stringify(updatedList));
          },
        },
      ]
    );
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExercise(id)}>
      <Text style={styles.deleteButtonText}>Supprimer</Text>
    </TouchableOpacity>
  );

  const filteredExercises = useMemo(() => {
    return localExercises.filter((ex) => {
      const lowerSearch = searchText.toLowerCase();
      return (
        ex.name.toLowerCase().includes(lowerSearch) ||
        ex.muscleGroup.toLowerCase().includes(lowerSearch)
      );
    });
  }, [localExercises, searchText]);

  const sortedExercises = useMemo(() => {
    const sorted = [...filteredExercises];
    switch (sortCriteria) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'muscleGroup':
        sorted.sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup));
        break;
      case 'charge':
        sorted.sort((a, b) => (b.charge ?? 0) - (a.charge ?? 0));
        break;
      case 'recent':
        sorted.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }
    return sorted;
  }, [filteredExercises, sortCriteria]);

  const cycleSort = () => {
    if (sortCriteria === 'name') setSortCriteria('muscleGroup');
    else if (sortCriteria === 'muscleGroup') setSortCriteria('charge');
    else if (sortCriteria === 'charge') setSortCriteria('recent');
    else setSortCriteria('name');
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity
        style={[styles.item, theme === 'dark' && styles.itemDark]}
        onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, theme === 'dark' && styles.textDark]}>{item.name}</Text>
          <Text style={[styles.sub, theme === 'dark' && styles.textDark]}>
            {item.muscleGroup} - {item.sets} x {item.reps} - {item.charge ?? 'N/A'} kg
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditExercise', { exercise: item })}
          style={styles.editButton}
        >
          <Icon name="edit" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );

  const sortIconName = () => {
    switch (sortCriteria) {
      case 'name':
        return 'sort-alpha-asc';
      case 'muscleGroup':
        return 'th-list';
      case 'charge':
        return 'sort-numeric-desc';
      case 'recent':
        return 'clock-o';
    }
  };

  const groupByMuscleGroup = (exList: Exercise[]) => {
    const grouped: Record<string, Exercise[]> = {};

    exList.forEach((ex) => {
      if (!grouped[ex.muscleGroup]) {
        grouped[ex.muscleGroup] = [];
      }
      grouped[ex.muscleGroup].push(ex);
    });

    return Object.entries(grouped).map(([group, exercises]) => ({
      group,
      exercises,
    }));
  };

  return (
    <View style={[styles.container, theme === 'dark' && styles.containerDark]}>
      <View style={styles.searchSortContainer}>
        <TextInput
          style={[styles.searchInput, theme === 'dark' && styles.searchInputDark]}
          placeholder="Rechercher nom ou groupe musculaire..."
          placeholderTextColor={theme === 'dark' ? '#ccc' : '#888'}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.sortButton} onPress={cycleSort}>
          <Icon name={sortIconName()} size={22} color={theme === 'dark' ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      {sortCriteria === 'muscleGroup' ? (
        <FlatList
          data={groupByMuscleGroup(sortedExercises)}
          keyExtractor={(item, index) => item.group + index}
          renderItem={({ item }) => (
            <View>
              <Text style={[styles.groupHeader, theme === 'dark' && styles.textDark]}>
                {item.group}
              </Text>
              {item.exercises.map((exercise) => (
                <React.Fragment key={exercise.id}>
                  {renderItem({ item: exercise })}
                </React.Fragment>
              ))}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <FlatList
          data={sortedExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={[styles.empty, theme === 'dark' && styles.textDark]}>
              Aucun exercice enregistré.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddExercise')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111',
  },
  searchSortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    color: '#000',
  },
  searchInputDark: {
    borderColor: '#555',
    backgroundColor: '#222',
    color: '#eee',
  },
  sortButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#eee',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDark: {
    backgroundColor: '#333',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  sub: {
    fontSize: 14,
    color: '#555',
  },
  textDark: {
    color: '#fff',
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 4,
    color: '#000',
  },
  empty: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
  },
  editButton: {
    padding: 8,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#d11a2a',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 8,
    marginVertical: 8,
    marginRight: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
