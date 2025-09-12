import React, { useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApolloTasks } from '../hooks/useApolloTasks';
import { CreateCategoryInput } from '../apollo/types';

interface CategoriesScreenProps {
    navigation?: any;
}

const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
    '#EC4899', '#6B7280', '#14B8A6', '#F43F5E'
];

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
    const { getCategoriesWithTaskCount, createCategory, updateCategory, deleteCategory } = useApolloTasks();

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateCategoryInput>({
        name: '',
        color: '#3B82F6'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const categories = getCategoriesWithTaskCount();

    const resetForm = () => {
        setFormData({ name: '', color: '#3B82F6' });
        setErrors({});
        setShowAddForm(false);
        setEditingCategory(null);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }

        const existingCategory = categories.find(cat =>
            cat.name.toLowerCase() === formData.name.toLowerCase() &&
            cat.id !== editingCategory
        );

        if (existingCategory) {
            newErrors.name = 'Category name already exists';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory, formData);
            } else {
                await createCategory(formData);
            }
            resetForm();
        } catch (error) {
            console.error('Failed to save category:', error);
            Alert.alert('Error', 'Failed to save category. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: any) => {
        setFormData({ name: category.name, color: category.color });
        setEditingCategory(category.id);
        setShowAddForm(true);
    };

    const handleDelete = async (categoryId: string) => {
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category? This will remove it from all associated tasks.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteCategory(categoryId);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Top Navigation */}
            <View className="bg-white border-b border-gray-200 pt-2.5 pb-4 shadow-sm">
                <View className="flex-row items-center justify-between px-4">
                    <Text className="text-lg font-semibold text-gray-800">Categories</Text>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                        onPress={() => {
                            if (showAddForm) {
                                resetForm();
                            } else {
                                setShowAddForm(true);
                            }
                        }}
                    >
                        <Ionicons
                            name={showAddForm ? "close" : "add"}
                            size={20}
                            color="#374151"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Add/Edit Form */}
                {showAddForm && (
                    <View className="bg-white border-b border-gray-200 p-4">
                        <Text className="text-lg font-medium text-gray-800 mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </Text>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Category Name</Text>
                            <TextInput
                                className={`border rounded-lg px-3 py-2.5 text-base text-gray-800 bg-white ${errors.name ? 'border-red-500 border-2' : 'border-gray-300'}`}
                                placeholder="Enter category name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholderTextColor="#9ca3af"
                            />
                            {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>}
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Color</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {colorOptions.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setFormData({ ...formData, color })}
                                        className="w-10 h-10 rounded-full mb-2"
                                        style={{
                                            backgroundColor: color,
                                            borderWidth: formData.color === color ? 3 : 2,
                                            borderColor: formData.color === color ? '#1f2937' : '#e5e7eb',
                                            transform: [{ scale: formData.color === color ? 1.1 : 1 }]
                                        }}
                                    />
                                ))}
                            </View>
                        </View>

                        <View className="flex-row space-x-3 mt-2">
                            <TouchableOpacity
                                className={`flex-1 rounded-lg py-3 items-center ${loading ? 'bg-gray-400 opacity-60' : 'bg-blue-500'}`}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <View className="flex-row items-center space-x-2">
                                        <ActivityIndicator size="small" color="white" />
                                        <Text className="text-white text-base font-semibold">Saving...</Text>
                                    </View>
                                ) : (
                                    <View className="flex-row items-center space-x-2">
                                        <Ionicons
                                            name={editingCategory ? "save-outline" : "add"}
                                            size={16}
                                            color="white"
                                        />
                                        <Text className="text-white text-base font-semibold">
                                            {editingCategory ? 'Update' : 'Create'}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
                                onPress={resetForm}
                                disabled={loading}
                            >
                                <Text className="text-gray-700 text-base font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Categories List */}
                <View className="p-4 space-y-3">
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <View key={category.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-8 h-8 rounded-full mr-3"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <View className="flex-1">
                                            <Text className="text-base font-medium text-gray-800 mb-0.5">{category.name}</Text>
                                            <Text className="text-sm text-gray-500">
                                                {category.taskCount} {category.taskCount === 1 ? 'task' : 'tasks'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            onPress={() => handleEdit(category)}
                                            className="w-8 h-8 rounded-full justify-center items-center bg-gray-50"
                                        >
                                            <Ionicons name="create-outline" size={16} color="#374151" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(category.id)}
                                            className="w-8 h-8 rounded-full justify-center items-center bg-gray-50"
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="items-center py-12 px-6">
                            <Ionicons name="folder-outline" size={64} color="#d1d5db" />
                            <Text className="text-lg font-medium text-gray-800 mb-2">No categories yet</Text>
                            <Text className="text-base text-gray-500 text-center mb-4 leading-6">
                                Create your first category to organize your tasks
                            </Text>
                            <TouchableOpacity
                                className="bg-blue-500 rounded-lg py-3 px-4 flex-row items-center space-x-2"
                                onPress={() => setShowAddForm(true)}
                            >
                                <Ionicons name="add" size={16} color="white" />
                                <Text className="text-white text-base font-semibold">Add Category</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

