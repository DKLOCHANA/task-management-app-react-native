import React, { useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    Modal
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useApolloTasks } from '../hooks/useApolloTasks';
import { TaskStatus, Priority } from '../apollo/types';
import { RootStackParamList } from '../types';

type TaskDetailNavigationProp = StackNavigationProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC = () => {
    const navigation = useNavigation<TaskDetailNavigationProp>();
    const route = useRoute<TaskDetailRouteProp>();
    const { tasks, categories, updateTask, deleteTask } = useApolloTasks();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Get taskId from route params
    const taskId = route.params.taskId;
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center p-6">
                    <Ionicons name="warning-outline" size={64} color="#d1d5db" className="mb-4 opacity-30" />
                    <Text className="text-xl font-semibold text-gray-800 mb-2">Task not found</Text>
                    <Text className="text-base text-gray-500 text-center mb-4">The task you're looking for doesn't exist</Text>
                    <TouchableOpacity
                        className="bg-blue-500 rounded-lg py-3 px-4 flex-row items-center space-x-2"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={16} color="white" />
                        <Text className="text-white text-base font-semibold">Back to Tasks</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const taskCategories = categories.filter(cat => task.categoryIds.includes(cat.id));

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case Priority.HIGH:
                return {
                    backgroundColor: '#fef2f2',
                    textColor: '#991b1b'
                };
            case Priority.MEDIUM:
                return {
                    backgroundColor: '#fffbeb',
                    textColor: '#92400e'
                };
            case Priority.LOW:
                return {
                    backgroundColor: '#f0fdf4',
                    textColor: '#166534'
                };
            default:
                return {
                    backgroundColor: '#f9fafb',
                    textColor: '#374151'
                };
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.TODO:
                return {
                    backgroundColor: '#f3f4f6',
                    textColor: '#1f2937'
                };
            case TaskStatus.IN_PROGRESS:
                return {
                    backgroundColor: '#dbeafe',
                    textColor: '#1e40af'
                };
            case TaskStatus.COMPLETED:
                return {
                    backgroundColor: '#dcfce7',
                    textColor: '#166534'
                };
            default:
                return {
                    backgroundColor: '#f3f4f6',
                    textColor: '#1f2937'
                };
        }
    };

    const handleStatusToggle = async () => {
        const newStatus = task.status === TaskStatus.COMPLETED
            ? TaskStatus.TODO
            : TaskStatus.COMPLETED;
        await updateTask(task.id, { status: newStatus });
    };

    const handleDelete = async () => {
        await deleteTask(task.id);
        setShowDeleteConfirm(false);
        navigation.goBack();
    };

    const isOverdue = Boolean(
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== TaskStatus.COMPLETED
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusText = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.TODO:
                return 'TO DO';
            case TaskStatus.IN_PROGRESS:
                return 'IN PROGRESS';
            case TaskStatus.COMPLETED:
                return 'COMPLETED';
            default:
                return 'TO DO';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Top Navigation */}
            <View className="bg-white border-b border-gray-200 pt-2.5 pb-4 shadow-sm">
                <View className="flex-row items-center justify-between px-4">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={18} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-800 flex-1 text-center mx-4">Task Details</Text>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                        onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
                    >
                        <Ionicons name="create-outline" size={16} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Task Header */}
                <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
                    <View className="space-y-4">
                        <View className="flex-row items-start justify-between space-x-4">
                            <Text className="text-xl font-bold text-gray-800 flex-1 leading-7">{task.title}</Text>
                            <View
                                className="flex-row items-center px-3 py-1 rounded-full space-x-1"
                                style={{ backgroundColor: getPriorityColor(task.priority).backgroundColor }}
                            >
                                <Ionicons name="flag" size={14} color={getPriorityColor(task.priority).textColor} />
                                <Text
                                    className="text-sm font-medium capitalize"
                                    style={{ color: getPriorityColor(task.priority).textColor }}
                                >
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View
                                className="px-3 py-1 rounded-full"
                                style={{ backgroundColor: getStatusColor(task.status).backgroundColor }}
                            >
                                <Text
                                    className="text-sm font-medium"
                                    style={{ color: getStatusColor(task.status).textColor }}
                                >
                                    {getStatusText(task.status)}
                                </Text>
                            </View>

                            {isOverdue && (
                                <View className="flex-row items-center space-x-1">
                                    <Ionicons name="warning" size={14} color="#ef4444" />
                                    <Text className="text-sm text-red-500 font-medium">Overdue</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Task Description */}
                {task.description && (
                    <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
                        <Text className="text-sm font-medium text-gray-500 mb-3">Description</Text>
                        <Text className="text-base text-gray-800 leading-6">{task.description}</Text>
                    </View>
                )}

                {/* Task Details */}
                <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
                    <Text className="text-sm font-medium text-gray-500 mb-3">Details</Text>

                    <View className="space-y-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-base text-gray-500">Created</Text>
                            <Text className="text-base text-gray-800 font-medium">
                                {formatDate(task.createdAt)}
                            </Text>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <Text className="text-base text-gray-500">Last Updated</Text>
                            <Text className="text-base text-gray-800 font-medium">
                                {formatDate(task.updatedAt)}
                            </Text>
                        </View>

                        {task.dueDate && (
                            <View className="flex-row items-center justify-between">
                                <Text className="text-base text-gray-500">Due Date</Text>
                                <View className="flex-row items-center space-x-2">
                                    <Text
                                        className={`text-base font-medium ${isOverdue ? 'text-red-500' : 'text-gray-800'}`}
                                    >
                                        {formatDate(task.dueDate)}
                                    </Text>
                                    {isOverdue && (
                                        <Ionicons name="warning" size={14} color="#ef4444" />
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Categories */}
                {taskCategories.length > 0 && (
                    <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
                        <Text className="text-sm font-medium text-gray-500 mb-3">Categories</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {taskCategories.map(category => (
                                <View
                                    key={category.id}
                                    className="flex-row items-center px-3 py-2 rounded-lg space-x-2"
                                    style={{ backgroundColor: `${category.color}20` }}
                                >
                                    <View
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <Text
                                        className="text-sm font-medium"
                                        style={{ color: category.color }}
                                    >
                                        {category.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Actions */}
                <View className="space-y-3 mb-8">
                    <TouchableOpacity
                        className={`rounded-lg py-3 flex-row items-center justify-center space-x-2 ${task.status === TaskStatus.COMPLETED ? 'bg-gray-100' : 'bg-blue-500'}`}
                        onPress={handleStatusToggle}
                    >
                        <Ionicons
                            name={task.status === TaskStatus.COMPLETED ? "refresh" : "checkmark"}
                            size={16}
                            color={task.status === TaskStatus.COMPLETED ? "#374151" : "white"}
                        />
                        <Text
                            className={`text-base font-semibold ${task.status === TaskStatus.COMPLETED ? 'text-gray-700' : 'text-white'}`}
                        >
                            {task.status === TaskStatus.COMPLETED ? 'Mark as Incomplete' : 'Mark as Complete'}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row space-x-3">
                        <TouchableOpacity
                            className="flex-1 bg-gray-100 rounded-lg py-3 flex-row items-center justify-center space-x-2"
                            onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
                        >
                            <Ionicons name="create-outline" size={16} color="#374151" />
                            <Text className="text-base font-semibold text-gray-700">Edit Task</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-red-50 rounded-lg py-3 flex-row items-center justify-center space-x-2 border border-red-200"
                            onPress={() => setShowDeleteConfirm(true)}
                        >
                            <Ionicons name="trash-outline" size={16} color="#991b1b" />
                            <Text className="text-base font-semibold text-red-800">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteConfirm}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowDeleteConfirm(false)}
            >
                <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
                    <View className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <View className="items-center mb-6">
                            <Ionicons name="trash-outline" size={64} color="#ef4444" className="mb-4" />
                            <Text className="text-lg font-semibold text-gray-800 mb-2">Delete Task</Text>
                            <Text className="text-base text-gray-500 text-center leading-6">
                                Are you sure you want to delete this task? This action cannot be undone.
                            </Text>
                        </View>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-100 rounded-lg py-2.5 items-center"
                                onPress={() => setShowDeleteConfirm(false)}
                            >
                                <Text className="text-gray-700 text-base font-medium">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-red-500 rounded-lg py-2.5 items-center"
                                onPress={handleDelete}
                            >
                                <Text className="text-white text-base font-semibold">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

