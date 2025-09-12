import React, { useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useApolloTasks } from '../hooks/useApolloTasks';
import { CreateTaskInput } from '../types';
import { Priority } from '../apollo/types';

interface AddTaskScreenProps {
    navigation?: any;
}

export const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation }) => {
    const { createTask, categories } = useApolloTasks();

    const [formData, setFormData] = useState<CreateTaskInput>({
        title: '',
        description: '',
        priority: Priority.MEDIUM,
        dueDate: new Date().toISOString().split('T')[0], // Set today as default
        categoryIds: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });

    const priorityOptions = [
        { value: Priority.LOW, label: 'Low Priority', icon: 'flag-outline', color: '#10b981' },
        { value: Priority.MEDIUM, label: 'Medium Priority', icon: 'flag', color: '#f59e0b' },
        { value: Priority.HIGH, label: 'High Priority', icon: 'flag', color: '#ef4444' }
    ];

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Task title is required';
        } else if (formData.title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        if (!formData.dueDate) {
            newErrors.dueDate = 'Due date is required';
        } else {
            const selectedDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.dueDate = 'Due date cannot be in the past';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setSubmitError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await createTask(formData);
            Alert.alert(
                'Success',
                'Task created successfully!',
                [{ text: 'OK', onPress: () => navigation?.goBack() }]
            );
        } catch (error) {
            console.error('Failed to create task:', error);
            setSubmitError('Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: (prev.categoryIds || []).includes(categoryId)
                ? (prev.categoryIds || []).filter(id => id !== categoryId)
                : [...(prev.categoryIds || []), categoryId]
        }));
    };

    const getPriorityStyles = (priority: Priority) => {
        switch (priority) {
            case Priority.HIGH:
                return {
                    backgroundColor: '#fef2f2',
                    borderColor: '#fecaca',
                    textColor: '#991b1b'
                };
            case Priority.MEDIUM:
                return {
                    backgroundColor: '#fffbeb',
                    borderColor: '#fde68a',
                    textColor: '#92400e'
                };
            case Priority.LOW:
                return {
                    backgroundColor: '#f0fdf4',
                    borderColor: '#bbf7d0',
                    textColor: '#166534'
                };
            default:
                return {
                    backgroundColor: '#f9fafb',
                    borderColor: '#d1d5db',
                    textColor: '#374151'
                };
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleDatePress = () => {
        // Use the current form date if set, otherwise use today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (formData.dueDate) {
            const currentDate = new Date(formData.dueDate);
            currentDate.setHours(0, 0, 0, 0);
            // Make sure it's not in the past
            setSelectedDate(currentDate >= today ? currentDate : today);
        } else {
            setSelectedDate(today);
        }
        setShowDatePicker(true);
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Only set the date if it's today or in the future
            if (date >= today) {
                const dateString = date.toISOString().split('T')[0];
                setFormData({ ...formData, dueDate: dateString });
                setSelectedDate(date);
            } else {
                // If a past date is selected, reset to today
                const dateString = today.toISOString().split('T')[0];
                setFormData({ ...formData, dueDate: dateString });
                setSelectedDate(today);
            }
        }
    };

    const handleDateCancel = () => {
        setShowDatePicker(false);
    };

    // Due date is required, so no clear function needed

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Submit Error */}
                {submitError && (
                    <View className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4 flex-row justify-between items-center">
                        <Text className="text-red-800 text-sm flex-1">{submitError}</Text>
                        <TouchableOpacity onPress={() => setSubmitError('')}>
                            <Ionicons name="close" size={16} color="#991b1b" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Basic Information */}
                <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="create-outline" size={16} color="#6b7280" className="mr-2" />
                        <Text className="text-base font-semibold text-gray-800 flex-1">Basic Information</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Task Title *</Text>
                        <TextInput
                            className={`border rounded-lg px-3 py-2.5 text-base text-gray-800 bg-white ${errors.title ? 'border-red-500 border-2' : 'border-gray-300'}`}
                            placeholder="What needs to be done?"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            maxLength={100}
                            placeholderTextColor="#9ca3af"
                        />
                        {errors.title && <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>}
                        <Text className="text-xs text-gray-400 text-right mt-1">{formData.title.length}/100</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Description</Text>
                        <TextInput
                            className={`border rounded-lg px-3 py-2.5 text-base text-gray-800 bg-white min-h-20 ${errors.description ? 'border-red-500 border-2' : 'border-gray-300'}`}
                            placeholder="Add more details about this task (optional)"
                            value={formData.description || ''}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={3}
                            maxLength={500}
                            placeholderTextColor="#9ca3af"
                            textAlignVertical="top"
                        />
                        {errors.description && <Text className="text-red-500 text-xs mt-1">{errors.description}</Text>}
                        <Text className="text-xs text-gray-400 text-right mt-1">{(formData.description || '').length}/500</Text>
                    </View>
                </View>

                {/* Task Settings */}
                <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="settings-outline" size={16} color="#6b7280" className="mr-2" />
                        <Text className="text-base font-semibold text-gray-800 flex-1">Task Settings</Text>
                    </View>

                    {/* Priority Selection */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Priority Level</Text>
                        <View
                            className="border-2 rounded-lg p-3"
                            style={{
                                backgroundColor: getPriorityStyles(formData.priority || Priority.MEDIUM).backgroundColor,
                                borderColor: getPriorityStyles(formData.priority || Priority.MEDIUM).borderColor
                            }}
                        >
                            {priorityOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    className={`flex-row items-center py-2 px-1 rounded ${(formData.priority || Priority.MEDIUM) === option.value ? 'bg-white bg-opacity-50' : ''}`}
                                    onPress={() => setFormData({ ...formData, priority: option.value })}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={16}
                                        color={option.color}
                                        className="mr-2"
                                    />
                                    <Text
                                        className={`flex-1 text-sm ${(formData.priority || Priority.MEDIUM) === option.value ? 'font-semibold' : 'text-gray-700'}`}
                                        style={(formData.priority || Priority.MEDIUM) === option.value ? {
                                            color: getPriorityStyles(formData.priority || Priority.MEDIUM).textColor
                                        } : {}}
                                    >
                                        {option.label}
                                    </Text>
                                    {(formData.priority || Priority.MEDIUM) === option.value && (
                                        <View className="w-5 h-5 rounded-full bg-blue-500 justify-center items-center">
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Due Date */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Due Date *</Text>
                        <TouchableOpacity
                            className={`flex-row items-center border rounded-lg px-3 py-2.5 bg-white ${errors.dueDate ? 'border-red-500 border-2' : 'border-gray-300'}`}
                            onPress={handleDatePress}
                        >
                            <Ionicons name="calendar-outline" size={16} color="#6b7280" className="mr-2" />
                            <Text className={`flex-1 text-base ${!formData.dueDate ? 'text-gray-400' : 'text-gray-800'}`}>
                                {formData.dueDate ? formatDate(formData.dueDate) : 'Select a due date'}
                            </Text>
                        </TouchableOpacity>
                        {errors.dueDate && <Text className="text-red-500 text-xs mt-1">{errors.dueDate}</Text>}
                    </View>
                </View>

                {/* Categories */}
                {categories.length > 0 && (
                    <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="pricetag-outline" size={16} color="#6b7280" className="mr-2" />
                            <Text className="text-base font-semibold text-gray-800 flex-1">Categories</Text>
                            <Text className="text-xs text-gray-500">
                                {(formData.categoryIds || []).length} selected
                            </Text>
                        </View>

                        <View className="space-y-2">
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    className={`flex-row items-center p-3 rounded-lg border ${(formData.categoryIds || []).includes(category.id) ? 'bg-blue-50 border-indigo-200' : 'bg-gray-50 border-transparent'}`}
                                    onPress={() => toggleCategory(category.id)}
                                >
                                    <View className="mr-3">
                                        <View
                                            className="w-5 h-5 rounded border-2 justify-center items-center"
                                            style={(formData.categoryIds || []).includes(category.id) ? {
                                                backgroundColor: category.color,
                                                borderColor: category.color
                                            } : {
                                                borderColor: '#d1d5db'
                                            }}
                                        >
                                            {(formData.categoryIds || []).includes(category.id) && (
                                                <Ionicons name="checkmark" size={12} color="white" />
                                            )}
                                        </View>
                                    </View>

                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <Text className={`text-base font-medium ${(formData.categoryIds || []).includes(category.id) ? 'text-blue-800 font-semibold' : 'text-gray-800'}`}>
                                            {category.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Form Actions */}
                <View className="pt-4 space-y-3 mb-8">
                    <TouchableOpacity
                        className={`rounded-lg py-3 items-center ${(!formData.title.trim() || !formData.dueDate || loading) ? 'bg-gray-400 opacity-60' : 'bg-blue-500'}`}
                        onPress={handleSubmit}
                        disabled={!formData.title.trim() || !formData.dueDate || loading}
                    >
                        {loading ? (
                            <View className="flex-row items-center space-x-2">
                                <ActivityIndicator size="small" color="white" />
                                <Text className="text-white text-base font-semibold">Creating Task...</Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center space-x-2">
                                <Ionicons name="add" size={16} color="white" />
                                <Text className="text-white text-base font-semibold">Create Task</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-100 rounded-lg py-3 items-center flex-row justify-center space-x-2"
                        onPress={() => navigation?.goBack()}
                        disabled={loading}
                    >
                        <Ionicons name="close" size={16} color="#374151" />
                        <Text className="text-gray-700 text-base font-semibold">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Native Date Picker */}
            {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return today;
                    })()}
                    maximumDate={new Date(2030, 11, 31)} // December 31, 2030
                    className="w-full h-50"
                />
            )}

            {/* iOS Date Picker Modal */}
            <Modal
                visible={showDatePicker && Platform.OS === 'ios'}
                animationType="slide"
                transparent={true}
                onRequestClose={handleDateCancel}
            >
                <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
                    <View className="bg-white rounded-2xl p-6 m-5 max-w-sm w-4/5 shadow-2xl">
                        <View className="items-center mb-5">
                            <Text className="text-lg font-semibold text-gray-800">Select Due Date</Text>
                        </View>

                        <View className="mb-5">
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                minimumDate={(() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return today;
                                })()}
                                maximumDate={new Date(2030, 11, 31)} // December 31, 2030
                                className="w-full my-2"
                            />
                        </View>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-100 rounded-lg py-2.5 items-center"
                                onPress={handleDateCancel}
                            >
                                <Text className="text-gray-700 text-base font-medium">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-blue-500 rounded-lg py-2.5 items-center"
                                onPress={() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    // Ensure the selected date is not in the past
                                    if (selectedDate >= today) {
                                        const dateString = selectedDate.toISOString().split('T')[0];
                                        setFormData({ ...formData, dueDate: dateString });
                                    } else {
                                        const dateString = today.toISOString().split('T')[0];
                                        setFormData({ ...formData, dueDate: dateString });
                                        setSelectedDate(today);
                                    }
                                    setShowDatePicker(false);
                                }}
                            >
                                <Text className="text-white text-base font-semibold">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

