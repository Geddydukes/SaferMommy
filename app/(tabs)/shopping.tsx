import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Plus, Check, Trash2, Filter } from 'lucide-react-native';
import { GROCERY_CATEGORY_VALUES, GroceryCategory, ShoppingItem } from '../../types/recipe';

function createLocalItem(partial: Partial<ShoppingItem> & { name: string }): ShoppingItem {
  const timestamp = new Date().toISOString();
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    listId: partial.listId ?? 'local-demo',
    ingredientId: partial.ingredientId ?? null,
    name: partial.name,
    amount: partial.amount ?? 1,
    unit: partial.unit ?? 'item',
    category: (partial.category ?? 'Other') as GroceryCategory,
    checked: partial.checked ?? false,
    createdAt: partial.createdAt ?? timestamp,
    updatedAt: partial.updatedAt ?? timestamp,
    recipes: partial.recipes ?? [],
  };
}

const initialItems: ShoppingItem[] = [
  createLocalItem({
    id: '1',
    name: 'Fresh Basil',
    amount: 1,
    unit: 'bunch',
    category: 'Produce' as GroceryCategory,
    recipes: [{ id: 'recipe-1', title: 'Classic Margherita Pizza' }],
  }),
  createLocalItem({
    id: '2',
    name: 'Mozzarella',
    amount: 8,
    unit: 'oz',
    category: 'Dairy & Eggs' as GroceryCategory,
    recipes: [{ id: 'recipe-1', title: 'Classic Margherita Pizza' }],
  }),
  createLocalItem({
    id: '3',
    name: 'Olive Oil',
    amount: 1,
    unit: 'bottle',
    category: 'Pantry' as GroceryCategory,
  }),
];

export default function ShoppingScreen() {
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);

  const groupedItems = useMemo(() => {
    const base = GROCERY_CATEGORY_VALUES.reduce<Record<GroceryCategory, ShoppingItem[]>>((acc, category) => {
      acc[category] = [];
      return acc;
    }, {} as Record<GroceryCategory, ShoppingItem[]>);

    return items.reduce<Record<GroceryCategory, ShoppingItem[]>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, { ...base });
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              checked: !item.checked,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (!newItem.trim()) return;

    setItems((current) => [
      ...current,
      createLocalItem({
        name: newItem.trim(),
        category: 'Other' as GroceryCategory,
      }),
    ]);
    setNewItem('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        <View style={styles.addContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add new item..."
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={addItem}
            placeholderTextColor="#64748B"
          />
          <Pressable style={styles.filterButton} accessibilityLabel="Filter shopping list">
            <Filter size={24} color="#1E293B" />
          </Pressable>
          <Pressable style={styles.addButton} onPress={addItem} accessibilityLabel="Add shopping list item">
            <Plus size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {(Object.entries(groupedItems) as [GroceryCategory, ShoppingItem[]][])
          .filter(([, categoryItems]) => categoryItems.length > 0)
          .map(([category, categoryItems]) => (
            <View key={category} style={styles.category}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {categoryItems.map((item) => (
                <View key={item.id} style={styles.item}>
                  <Pressable
                    style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                    onPress={() => toggleItem(item.id)}
                    accessibilityLabel={`Mark ${item.name ?? 'item'} as ${item.checked ? 'incomplete' : 'complete'}`}>
                    {item.checked && <Check size={16} color="#FFFFFF" />}
                  </Pressable>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                      {item.name ?? 'Unnamed item'}
                    </Text>
                    <Text style={styles.amountText}>
                      {`${item.amount} ${item.unit}${item.amount !== 1 ? 's' : ''}`}
                    </Text>
                    {item.recipes && item.recipes.length > 0 && (
                      <Text style={styles.recipeText}>
                        From: {item.recipes.map((recipe: { id: string; title: string }) => recipe.title).join(', ')}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                    accessibilityLabel={`Remove ${item.name ?? 'item'} from shopping list`}>
                    <Trash2 size={16} color="#94A3B8" />
                  </Pressable>
                </View>
              ))}
            </View>
          ))}
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Items</Text>
          <Text style={styles.summaryValue}>{items.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Completed</Text>
          <Text style={styles.summaryValue}>{items.filter((item) => item.checked).length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    color: '#1E293B',
    marginBottom: 16,
  },
  addContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  category: {
    padding: 24,
  },
  categoryTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#1E293B',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  amountText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  recipeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  summary: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1E293B',
  },
});
