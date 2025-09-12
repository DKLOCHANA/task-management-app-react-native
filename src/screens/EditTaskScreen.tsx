import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    Modal,
    Platform,
    ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useApolloTasks } from '../hooks/useApolloTasks';
import { TaskStatus, Priority, UpdateTaskInput } from '../apollo/types';
import { RootStackParamList } from '../types';

type EditTaskNavigationProp = StackNavigationProp<RootStackParamList, 'EditTask'>;
type EditTaskRouteProp = RouteProp<RootStackParamList, 'EditTask'>;

export const EditTaskScreen: React.FC = () => {
    const navigation = useNavigation<EditTaskNavigationProp>();
    const route = useRoute<EditTaskRouteProp>();
    const { tasks, categories, updateTask } = useApolloTasks();

    const taskId = route.params.taskId;
    const task = tasks.find(t => t.id === taskId);

    const [formData, setFormData] = useState<UpdateTaskInput & { categoryIds: string[] }>({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: '',
        categoryIds: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [showPriorityPicker, setShowPriorityPicker] = useState(false);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate || '',
                categoryIds: task.categoryIds || []
            });
        }
    }, [task]);

    if (!task) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="warning-outline" size={64} color="#d1d5db" className="mb-4" />
                    <Text className="text-2xl font-semibold text-gray-800 mb-2 text-center">Task not found</Text>
                    <Text className="text-base text-gray-500 text-center mb-8">The task you're trying to edit doesn't exist</Text>
                    <TouchableOpacity
                        className="flex-row items-center bg-blue-500 px-5 py-3 rounded-lg space-x-2"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={16} color="white" />
                        <Text className="text-white text-base font-medium">Back to Tasks</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const priorityOptions = [
        { value: Priority.LOW, label: 'Low Priority', icon: 'flag-outline', color: '#10b981' },
        { value: Priority.MEDIUM, label: 'Medium Priority', icon: 'flag', color: '#f59e0b' },
        { value: Priority.HIGH, label: 'High Priority', icon: 'flag', color: '#ef4444' }
    ];

    const statusOptions = [
        { value: TaskStatus.TODO, label: 'To Do', icon: 'list-outline', color: '#6b7280' },
        { value: TaskStatus.IN_PROGRESS, label: 'In Progress', icon: 'time-outline', color: '#3b82f6' },
        { value: TaskStatus.COMPLETED, label: 'Completed', icon: 'checkmark-circle', color: '#10b981' }
    ];

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            newErrors.title = 'Title is required';
        }

        if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
            newErrors.dueDate = 'Due date cannot be in the past';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const updateData: UpdateTaskInput = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                dueDate: formData.dueDate
            };

            await updateTask(task.id, updateData);
            navigation.navigate('TaskDetail', { taskId: task.id });
        } catch (error) {
            console.error('Failed to update task:', error);
            Alert.alert('Error', 'Failed to update task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];
            setFormData({ ...formData, dueDate: dateString });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    const clearDate = () => {
        setFormData({ ...formData, dueDate: '' });
    };

    const getStatusLabel = (status: TaskStatus) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.label : 'To Do';
    };

    const getPriorityLabel = (priority: Priority) => {
        const option = priorityOptions.find(opt => opt.value === priority);
        return option ? option.label : 'Medium Priority';
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Top Navigation */}
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row items-center justify-between px-4 py-3 h-14">
                    <TouchableOpacity
                        className="p-2 rounded-lg bg-gray-50"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={18} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-900">Edit Task</Text>
                    <View className="w-10" />
                </View>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* Basic Information */}
                <View className="mb-6 pt-4">
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Task Title *</Text>
                        <TextInput
                            className={`border rounded-lg px-3 py-3 text-base text-gray-900 bg-white ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter task title"
                            value={formData.title || ''}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholderTextColor="#9ca3af"
                        />
                        {errors.title && <Text className="text-xs text-red-500 mt-1">{errors.title}</Text>}
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Description</Text>
                        <TextInput
                            className={`border rounded-lg px-3 py-3 text-base text-gray-900 bg-white min-h-20 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Add a description (optional)"
                            value={formData.description || ''}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={3}
                            maxLength={500}
                            placeholderTextColor="#9ca3af"
                            textAlignVertical="top"
                        />
                        {errors.description && <Text className="text-xs text-red-500 mt-1">{errors.description}</Text>}
                        <Text className="text-xs text-gray-500 text-right mt-1">{(formData.description || '').length}/500</Text>
                    </View>
                </View>

                {/* Task Settings */}
                <View className="mb-6">
                    {/* Status Selection */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Status</Text>
                        <TouchableOpacity
                            className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between bg-white"
                            onPress={() => setShowStatusPicker(true)}
                        >
                            <Text className="text-base text-gray-900">{getStatusLabel(formData.status!)}</Text>
                            <Ionicons name="chevron-down" size={12} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Priority Selection */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Priority</Text>
                        <TouchableOpacity
                            className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between bg-white"
                            onPress={() => setShowPriorityPicker(true)}
                        >
                            <Text className="text-base text-gray-900">{getPriorityLabel(formData.priority!)}</Text>
                            <Ionicons name="chevron-down" size={12} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Due Date */}
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1.5">Due Date</Text>
                        <TouchableOpacity
                            className={`border rounded-lg px-3 py-3 flex-row items-center bg-white ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={16} color="#6b7280" className="mr-2" />
                            <Text className={`text-base flex-1 ${!formData.dueDate ? 'text-gray-400' : 'text-gray-900'}`}>
                                {formData.dueDate ? formatDate(formData.dueDate) : 'Select due date (optional)'}
                            </Text>
                            {formData.dueDate && (
                                <TouchableOpacity onPress={clearDate} className="p-1">
                                    <Ionicons name="close" size={12} color="#6b7280" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                        {errors.dueDate && <Text className="text-xs text-red-500 mt-1">{errors.dueDate}</Text>}
                    </View>
                </View>

                {/* Categories */}
                {categories.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-base font-semibold text-gray-900 mb-3">Categories</Text>
                        <View className="space-y-2">
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    className={`flex-row items-center py-3 px-3 rounded-lg border ${formData.categoryIds.includes(category.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                    onPress={() => toggleCategory(category.id)}
                                >
                                    <View className="mr-3">
                                        <View
                                            className="w-5 h-5 rounded border-2 items-center justify-center"
                                            style={formData.categoryIds.includes(category.id) ? {
                                                backgroundColor: category.color,
                                                borderColor: category.color
                                            } : {
                                                borderColor: '#d1d5db'
                                            }}
                                        >
                                            {formData.categoryIds.includes(category.id) && (
                                                <Ionicons name="checkmark" size={12} color="white" />
                                            )}
                                        </View>
                                    </View>

                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-2 h-2 rounded-full mr-2"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <Text className={`text-base ${formData.categoryIds.includes(category.id) ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                                            {category.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Form Actions */}
                <View className="py-6 space-y-3">
                    <TouchableOpacity
                        className={`rounded-lg py-4 items-center justify-center ${(!formData.title?.trim() || loading) ? 'bg-gray-400 opacity-60' : 'bg-blue-500'}`}
                        onPress={handleSubmit}
                        disabled={!formData.title?.trim() || loading}
                    >
                        {loading ? (
                            <View className="flex-row items-center space-x-2">
                                <ActivityIndicator size="small" color="white" />
                                <Text className="text-white text-base font-semibold">Updating Task...</Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center space-x-2">
                                <Ionicons name="save-outline" size={16} color="white" />
                                <Text className="text-white text-base font-semibold">Update Task</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-50 rounded-lg py-4 items-center justify-center flex-row space-x-2 border border-gray-200"
                        onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                        disabled={loading}
                    >
                        <Ionicons name="close" size={14} color="#6b7280" />
                        <Text className="text-gray-700 text-base font-medium">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={formData.dueDate ? new Date(formData.dueDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    className="bg-white"
                />
            )}

            {/* Status Picker Modal */}
            <Modal
                visible={showStatusPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowStatusPicker(false)}
            >
                <View className="flex-1 bg-black bg-opacity-50 justify-end">
                    <View className="bg-white rounded-t-2xl pt-4 pb-8 max-h-1/2">
                        <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-gray-900">Select Status</Text>
                            <TouchableOpacity onPress={() => setShowStatusPicker(false)} className="p-1">
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        {statusOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${formData.status === option.value ? 'bg-blue-50' : ''}`}
                                onPress={() => {
                                    setFormData({ ...formData, status: option.value });
                                    setShowStatusPicker(false);
                                }}
                            >
                                <Ionicons name={option.icon as any} size={20} color={option.color} className="mr-3" />
                                <Text className="text-base text-gray-700 flex-1">{option.label}</Text>
                                {formData.status === option.value && (
                                    <Ionicons name="checkmark" size={16} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Priority Picker Modal */}
            <Modal
                visible={showPriorityPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPriorityPicker(false)}
            >
                <View className="flex-1 bg-black bg-opacity-50 justify-end">
                    <View className="bg-white rounded-t-2xl pt-4 pb-8 max-h-1/2">
                        <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-gray-900">Select Priority</Text>
                            <TouchableOpacity onPress={() => setShowPriorityPicker(false)} className="p-1">
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        {priorityOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${formData.priority === option.value ? 'bg-blue-50' : ''}`}
                                onPress={() => {
                                    setFormData({ ...formData, priority: option.value });
                                    setShowPriorityPicker(false);
                                }}
                            >
                                <Ionicons name={option.icon as any} size={20} color={option.color} className="mr-3" />
                                <Text className="text-base text-gray-700 flex-1">{option.label}</Text>
                                {formData.priority === option.value && (
                                    <Ionicons name="checkmark" size={16} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};



export default EditTaskScreen;