import { useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ParsedIngredient } from '../../services/ai';

interface ParsedRecipePayload {
  ingredients: ParsedIngredient[];
  instructions: string[];
  title?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

export default function CreateRecipeScreen() {
  const params = useLocalSearchParams<{ data?: string }>();

  const parsedRecipe = useMemo<ParsedRecipePayload | null>(() => {
    if (!params.data) return null;

    try {
      return JSON.parse(params.data) as ParsedRecipePayload;
    } catch (error) {
      console.warn('Failed to parse recipe payload', error);
      return null;
    }
  }, [params.data]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Go back">
          <Text style={styles.backLink}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Create Recipe</Text>
        <Text style={styles.subtitle}>
          Review the details below and make any necessary edits before saving.
        </Text>
      </View>

      {!parsedRecipe && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Waiting for scan data</Text>
          <Text style={styles.cardText}>
            Upload a recipe photo from the Scan tab to auto-fill this screen.
          </Text>
        </View>
      )}

      {parsedRecipe && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{parsedRecipe.title ?? 'Untitled recipe'}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Prep:</Text>
            <Text style={styles.metaValue}>{parsedRecipe.prepTime ?? '—'} min</Text>
            <Text style={styles.metaLabel}>Cook:</Text>
            <Text style={styles.metaValue}>{parsedRecipe.cookTime ?? '—'} min</Text>
            <Text style={styles.metaLabel}>Serves:</Text>
            <Text style={styles.metaValue}>{parsedRecipe.servings ?? '—'}</Text>
          </View>

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {parsedRecipe.ingredients?.length ? (
            parsedRecipe.ingredients.map((ingredient, index) => (
              <Text key={`${ingredient.name}-${index}`} style={styles.listItem}>
                • {ingredient.amount} {ingredient.unit} {ingredient.name}
              </Text>
            ))
          ) : (
            <Text style={styles.cardText}>No ingredients were detected.</Text>
          )}

          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Instructions</Text>
          {parsedRecipe.instructions?.length ? (
            parsedRecipe.instructions.map((instruction, index) => (
              <Text key={`instruction-${index}`} style={styles.listItem}>
                {index + 1}. {instruction}
              </Text>
            ))
          ) : (
            <Text style={styles.cardText}>No instructions were detected.</Text>
          )}
        </View>
      )}

      <Pressable
        style={[styles.primaryButton, !parsedRecipe && styles.primaryButtonDisabled]}
        disabled={!parsedRecipe}
        accessibilityLabel="Save recipe">
        <Text style={styles.primaryButtonText}>Save Recipe</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  backLink: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#FF6B6B',
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#1E293B',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1E293B',
  },
  cardText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  metaValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#1E293B',
    marginRight: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginTop: 12,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  listItem: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
