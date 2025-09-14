import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../ThemeContext';
import { RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

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

type Props = {
  route: RouteProp<{ params: { exercise: Exercise } }, 'params'>;
};

export default function ExerciseDetailScreen({ route }: Props) {
  const { theme } = useTheme();
  const { exercise } = route.params;

  const getYouTubeEmbedUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/
    );
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const videoUrl = getYouTubeEmbedUrl(exercise.youtubeUrl);

  return (
    <ScrollView
      style={[
        styles.container,
        theme === 'dark' ? styles.containerDark : undefined,
      ]}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.title, theme === 'dark' && styles.textDark]}>
        {exercise.name}
      </Text>

      <Text style={[styles.label, theme === 'dark' && styles.textDark]}>
        Groupe Musculaire : <Text style={styles.value}>{exercise.muscleGroup}</Text>
      </Text>

      <Text style={[styles.label, theme === 'dark' && styles.textDark]}>
        Séries : <Text style={styles.value}>{exercise.sets}</Text>
      </Text>

      <Text style={[styles.label, theme === 'dark' && styles.textDark]}>
        Répétitions : <Text style={styles.value}>{exercise.reps}</Text>
      </Text>

      <Text style={[styles.label, theme === 'dark' && styles.textDark]}>
        Charge : <Text style={styles.value}>{exercise.charge ?? 'N/A'} kg</Text>
      </Text>

      {exercise.notes ? (
        <Text style={[styles.label, theme === 'dark' && styles.textDark]}>
          Notes : <Text style={styles.value}>{exercise.notes}</Text>
        </Text>
      ) : null}

      {videoUrl && (
        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: videoUrl }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      )}
    </ScrollView>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#111',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  value: {
    fontWeight: '600',
    color: '#007bff',
  },
  textDark: {
    color: '#fff',
  },
  videoContainer: {
    marginTop: 20,
    width: '100%',
    height: (screenWidth - 32) * 0.5625, // 16:9 ratio
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
});
