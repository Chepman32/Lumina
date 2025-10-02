import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation.types';
import * as ImagePicker from 'expo-image-picker';
import { useEditorStore } from '../../stores/editorStore';
import { ProjectService } from '../../services/ProjectService';
import type { ProjectMetadata } from '../../services/ProjectService';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
} from '../../utils/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addLayer, reset } = useEditorStore();
  const [recentProjects, setRecentProjects] = useState<ProjectMetadata[]>([]);

  const loadRecentProjects = React.useCallback(() => {
    const projects = ProjectService.getRecentProjects(6); // Show last 6 projects
    setRecentProjects(projects);
  }, []);

  // Load recent projects when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentProjects();
    }, [loadRecentProjects]),
  );

  const loadProject = async (projectId: string) => {
    try {
      const project = ProjectService.getProject(projectId);
      if (!project) {
        Alert.alert('Error', 'Project not found.');
        return;
      }

      // Reset editor state
      reset();

      // Load project layers
      project.editorState.layers.forEach(layer => {
        addLayer(layer);
      });

      // Navigate to editor
      navigation.navigate('Editor');
    } catch (error) {
      console.error('Failed to load project:', error);
      Alert.alert('Error', 'Failed to load project.');
    }
  };

  const handleCreateNew = () => {
    // Reset editor state and navigate
    reset();
    navigation.navigate('Editor');
  };

  const handleImportFromGallery = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to import images.',
          [{ text: 'OK' }],
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Reset editor state
        reset();

        // Add image as base layer
        addLayer({
          id: `image_${Date.now()}`,
          type: 'image',
          visible: true,
          locked: false,
          opacity: 1,
          blendMode: 'normal',
          transform: {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
          },
          data: {
            path: asset.uri,
            width: asset.width || 1080,
            height: asset.height || 1080,
          },
        });

        // Save as new project
        try {
          const projectName = `Photo ${new Date().toLocaleDateString()}`;
          await ProjectService.saveProject({
            name: projectName,
            editorState: {
              layers: [
                {
                  id: `image_${Date.now()}`,
                  type: 'image',
                  visible: true,
                  locked: false,
                  opacity: 1,
                  blendMode: 'normal',
                  transform: { x: 0, y: 0, scale: 1, rotation: 0 },
                  data: {
                    path: asset.uri,
                    width: asset.width || 1080,
                    height: asset.height || 1080,
                  },
                },
              ],
              activeLayerId: null,
              canvasSize: {
                width: asset.width || 1080,
                height: asset.height || 1080,
              },
              zoom: 1,
              pan: { x: 0, y: 0 },
              history: [],
              historyIndex: -1,
              filters: [],
              adjustments: {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                temperature: 0,
                tint: 0,
                exposure: 0,
                highlights: 0,
                shadows: 0,
                whites: 0,
                blacks: 0,
                sharpness: 0,
                clarity: 0,
                vibrance: 0,
                grain: 0,
                vignette: 0,
              },
            },
          });

          // Refresh projects list
          loadRecentProjects();
        } catch (projectError) {
          console.error('Failed to save project:', projectError);
        }

        // Navigate to editor
        navigation.navigate('Editor');
      }
    } catch (error) {
      console.error('Error importing image:', error);
      Alert.alert(
        'Import Failed',
        'Failed to import image. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning!</Text>
        <Text style={styles.title}>LUMINA</Text>
      </View>

      <View style={styles.quickActionCard}>
        <Text style={styles.cardTitle}>Start Creating</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCreateNew}
        >
          <Text style={styles.primaryButtonText}>Create New</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleImportFromGallery}
        >
          <Text style={styles.secondaryButtonText}>Import from Gallery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Projects</Text>
        {recentProjects.length > 0 ? (
          <FlatList
            data={recentProjects}
            numColumns={3}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.projectCard}
                onPress={() => loadProject(item.id)}
              >
                <View style={styles.projectThumbnail}>
                  <Text style={styles.projectPlaceholder}>📷</Text>
                </View>
                <Text style={styles.projectName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.projectDate}>
                  {new Date(item.modifiedAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.projectGrid}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>
              Import a photo or create a new project to get started
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SPACING.l,
  },
  greeting: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.black,
    letterSpacing: 2,
  },
  quickActionCard: {
    margin: SPACING.l,
    padding: SPACING.l,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    ...SHADOWS.level2,
  },
  cardTitle: {
    fontSize: FONT_SIZES.h3,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.m,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.m,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.lighterGray,
  },
  secondaryButtonText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.button,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    padding: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.m,
  },
  emptyText: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.s,
  },
  projectGrid: {
    paddingTop: SPACING.m,
  },
  projectCard: {
    flex: 1,
    margin: SPACING.s,
    alignItems: 'center',
    maxWidth: '30%',
  },
  projectThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.lightestGray,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  projectPlaceholder: {
    fontSize: 32,
  },
  projectName: {
    fontSize: FONT_SIZES.bodySmall,
    color: COLORS.black,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xxs,
  },
  projectDate: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
