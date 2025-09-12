import React, { useState, useRef } from 'react';
import {
    Text,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Animated,
    Modal,
    PanResponder,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApolloTasks, TaskFilters } from '../hooks/useApolloTasks';
import { TaskStatus, Priority } from '../apollo/types';
import { RootStackParamList, TabParamList } from '../types';

type TasksNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Tasks'>,
    StackNavigationProp<RootStackParamList>
>;

interface TasksScreenProps {
    navigation?: any;
}

// Swipeable Task Card Component
const SwipeableTaskCard: React.FC<{
    task: any;
    onPress: () => void;
    onComplete: () => void;
    onDelete: () => void;
    priorityStyles: any;
    taskStyles: any;
    taskCategories: any[];
    isOverdue: boolean;
    isDueToday: boolean;
    statusStyle: any;
}> = ({ task, onPress, onComplete, onDelete, priorityStyles, taskStyles, taskCategories, isOverdue, isDueToday, statusStyle }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [isSwipeActionsVisible, setIsSwipeActionsVisible] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const swipeThreshold = screenWidth * 0.25; // 25% of screen width

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
        },

        onPanResponderMove: (evt, gestureState) => {
            // Only allow left swipe (negative dx)
            if (gestureState.dx < 0) {
                translateX.setValue(Math.max(gestureState.dx, -290)); // Increased swipe distance
            }
        },

        onPanResponderRelease: (evt, gestureState) => {
            if (gestureState.dx < -swipeThreshold) {
                // Show swipe actions
                Animated.spring(translateX, {
                    toValue: -190, // Match the increased swipe distance
                    useNativeDriver: true,
                }).start();
                setIsSwipeActionsVisible(true);
            } else {
                // Hide swipe actions
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
                setIsSwipeActionsVisible(false);
            }
        },
    });

    const resetSwipe = () => {
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
        setIsSwipeActionsVisible(false);
    };

    const handleComplete = () => {
        resetSwipe();
        onComplete();
    };

    const handleDelete = () => {
        resetSwipe();
        onDelete();
    };

    return (
        <View className="rounded-xl mb-3 overflow-hidden" style={taskStyles.container}>
            {/* Swipe Actions Background */}
            <View className="absolute right-0 top-0 bottom-0 flex-row w-48 z-10">
                {task.status !== TaskStatus.COMPLETED && (
                    <TouchableOpacity
                        className="flex-1 bg-green-500 justify-center items-center px-4 min-w-24"
                        onPress={handleComplete}
                    >
                        <Ionicons name="checkmark" size={18} color="white" />
                        <Text className="text-xs text-white font-medium mt-0.5">Complete</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    className="flex-1 bg-red-500 justify-center items-center px-4 min-w-24"
                    onPress={handleDelete}
                >
                    <Ionicons name="trash" size={18} color="white" />
                    <Text className="text-xs text-white font-medium mt-0.5">Delete</Text>
                </TouchableOpacity>
            </View>

            {/* Main Task Content */}
            <Animated.View
                className="bg-white rounded-xl z-20"
                style={[{ transform: [{ translateX }] }]}
                {...panResponder.panHandlers}
            >
                <TouchableOpacity
                    className="p-4"
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-start">
                        {/* Priority Indicator */}
                        <View
                            className="w-4 h-4 rounded-full mt-0.5 mr-3 opacity-80"
                            style={[{ backgroundColor: priorityStyles.indicator }, taskStyles.priority]}
                        />

                        <View className="flex-1">
                            <View className="flex-row justify-between items-start mb-2">
                                <Text className="text-base font-medium flex-1 mr-2" style={taskStyles.title} numberOfLines={2}>
                                    {task.title}
                                </Text>

                                <View className="flex-row items-center gap-1.5">
                                    {isDueToday && !isOverdue && (
                                        <View className="bg-blue-100 px-2 py-0.5 rounded-xl">
                                            <Text className="text-xs text-blue-600 font-medium">Today</Text>
                                        </View>
                                    )}
                                    {isOverdue && (
                                        <View className="bg-red-100 px-2 py-0.5 rounded-xl flex-row items-center">
                                            <Ionicons name="warning" size={12} color="#dc2626" style={{ marginRight: 4 }} />
                                            <Text className="text-xs text-red-600 font-medium">Overdue</Text>
                                        </View>
                                    )}
                                    <View className="px-2 py-0.5 rounded-xl" style={{ backgroundColor: statusStyle.backgroundColor }}>
                                        <Text className="text-xs font-medium capitalize" style={{ color: statusStyle.color }}>
                                            {task.status.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {task.description && (
                                <Text className="text-sm mb-2 leading-5" style={taskStyles.description} numberOfLines={2}>
                                    {task.description}
                                </Text>
                            )}

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center gap-3 flex-1">
                                    {task.dueDate && (
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="calendar-outline"
                                                size={12}
                                                color={isOverdue ? '#dc2626' : isDueToday ? '#2563eb' : '#6b7280'}
                                                style={{ marginRight: 4 }}
                                            />
                                            <Text className={`text-xs ${isOverdue ? 'text-red-600' : isDueToday ? 'text-blue-600' : 'text-gray-500'
                                                }`}>
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    )}

                                    {taskCategories.length > 0 && (
                                        <View className="flex-row items-center gap-1">
                                            {taskCategories.slice(0, 2).map(category => (
                                                <View
                                                    key={category.id}
                                                    className="px-2 py-0.5 rounded-xl"
                                                    style={{ backgroundColor: `${category.color}20` }}
                                                >
                                                    <Text className="text-xs" style={{ color: category.color }}>
                                                        {category.name}
                                                    </Text>
                                                </View>
                                            ))}
                                            {taskCategories.length > 2 && (
                                                <Text className="text-xs text-gray-500">
                                                    +{taskCategories.length - 2}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>

                                <View
                                    className="px-2 py-0.5 rounded-xl border"
                                    style={[
                                        { backgroundColor: priorityStyles.bg, borderColor: priorityStyles.border },
                                        taskStyles.priority
                                    ]}
                                >
                                    <Text className="text-xs font-medium" style={{ color: priorityStyles.text }}>
                                        {task.priority.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text className="text-xl text-gray-400 ml-2">›</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export const TasksScreen: React.FC<TasksScreenProps> = () => {
    const navigation = useNavigation<TasksNavigationProp>();
    const { getFilteredTasks, categories, updateTask, deleteTask, isTaskOverdue, isTaskDueToday } = useApolloTasks();

    const [filters, setFilters] = useState<TaskFilters>({
        status: 'all',
        priority: 'all',
        categoryId: 'all',
        search: '',
        sortBy: 'createdAt'
    });

    const [showFilters, setShowFilters] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [showPriorityPicker, setShowPriorityPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showSortPicker, setShowSortPicker] = useState(false);

    const tasks = getFilteredTasks(filters);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Simulate refresh delay
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleSwipeComplete = async (taskId: string) => {
        await updateTask(taskId, { status: TaskStatus.COMPLETED });
    };

    const handleSwipeDelete = async (taskId: string) => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteTask(taskId) }
            ]
        );
    };

    const handleTaskPress = (taskId: string) => {
        navigation.navigate('TaskDetail', { taskId });
    };

    const handleAddTask = () => {
        navigation.navigate('Add');
    };

    const handleResetFilters = () => {
        setFilters({
            status: 'all',
            priority: 'all',
            categoryId: 'all',
            search: '',
            sortBy: 'createdAt'
        });
    };

    const getPriorityStyles = (priority: Priority) => {
        switch (priority) {
            case Priority.HIGH:
                return {
                    indicator: '#ef4444',
                    text: '#dc2626',
                    bg: '#fef2f2',
                    border: '#fecaca'
                };
            case Priority.MEDIUM:
                return {
                    indicator: '#eab308',
                    text: '#d97706',
                    bg: '#fffbeb',
                    border: '#fde68a'
                };
            case Priority.LOW:
                return {
                    indicator: '#22c55e',
                    text: '#16a34a',
                    bg: '#f0fdf4',
                    border: '#bbf7d0'
                };
            default:
                return {
                    indicator: '#6b7280',
                    text: '#4b5563',
                    bg: '#f9fafb',
                    border: '#d1d5db'
                };
        }
    };

    const getTaskStyles = (task: any) => {
        const isOverdue = isTaskOverdue(task);
        const isDueToday = isTaskDueToday(task);
        const isCompleted = task.status === TaskStatus.COMPLETED;

        if (isCompleted) {
            return {
                container: { backgroundColor: '#f9fafb', opacity: 0.75 },
                title: { textDecorationLine: 'line-through' as const, color: '#6b7280' },
                description: { textDecorationLine: 'line-through' as const, color: '#9ca3af' },
                priority: { opacity: 0.5 }
            };
        }

        if (isOverdue) {
            return {
                container: {
                    backgroundColor: 'white',
                    borderLeftWidth: 4,
                    borderLeftColor: '#ef4444',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                },
                title: { color: '#1f2937' },
                description: { color: '#4b5563' },
                priority: {}
            };
        }

        if (isDueToday) {
            return {
                container: {
                    backgroundColor: '#eff6ff',
                    borderLeftWidth: 4,
                    borderLeftColor: '#3b82f6',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                },
                title: { color: '#1f2937', fontWeight: '500' as const },
                description: { color: '#4b5563' },
                priority: {}
            };
        }

        return {
            container: {
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            },
            title: { color: '#1f2937' },
            description: { color: '#4b5563' },
            priority: {}
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo': return { backgroundColor: '#f3f4f6', color: '#1f2937' };
            case 'in_progress': return { backgroundColor: '#dbeafe', color: '#1e40af' };
            case 'completed': return { backgroundColor: '#dcfce7', color: '#166534' };
            default: return { backgroundColor: '#f3f4f6', color: '#1f2937' };
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <View className="flex-row px-4 py-3 bg-white border-b border-gray-100 items-center gap-3">
                    <View className="flex-1 flex-row items-center bg-gray-50 rounded-lg px-3 border border-gray-300">
                        <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
                        <TextInput
                            className="flex-1 py-2 text-base text-gray-800"
                            placeholder="Search tasks..."
                            value={filters.search}
                            onChangeText={(text) => setFilters({ ...filters, search: text })}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                    <TouchableOpacity
                        className="p-2 rounded-lg bg-gray-100"
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons name="options" size={16} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                {showFilters && (
                    <View className="bg-white border-b border-gray-100 px-4 py-3">
                        <View className="flex-row gap-3 mb-3">
                            <View className="flex-1">
                                <Text className="text-xs font-medium text-gray-600 mb-1">Status</Text>
                                <View className="border border-gray-300 rounded-md bg-white">
                                    <TouchableOpacity
                                        className="px-2 py-1 flex-row justify-between items-center"
                                        onPress={() => setShowStatusPicker(true)}
                                    >
                                        <Text className="text-sm text-gray-800">
                                            {filters.status === 'all' ? 'All' :
                                                filters.status === 'todo' ? 'To Do' :
                                                    filters.status === 'in_progress' ? 'In Progress' : 'Completed'}
                                        </Text>
                                        <Text className="text-xs text-gray-500 ml-1">▼</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-1">
                                <Text className="text-xs font-medium text-gray-600 mb-1">Priority</Text>
                                <View className="border border-gray-300 rounded-md bg-white">
                                    <TouchableOpacity
                                        className="px-2 py-1 flex-row justify-between items-center"
                                        onPress={() => setShowPriorityPicker(true)}
                                    >
                                        <Text className="text-sm text-gray-800">
                                            {filters.priority === 'all' ? 'All' :
                                                filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)}
                                        </Text>
                                        <Text className="text-xs text-gray-500 ml-1">▼</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row gap-3 mb-3">
                            <View className="flex-1">
                                <Text className="text-xs font-medium text-gray-600 mb-1">Category</Text>
                                <View className="border border-gray-300 rounded-md bg-white">
                                    <TouchableOpacity
                                        className="px-2 py-1 flex-row justify-between items-center"
                                        onPress={() => setShowCategoryPicker(true)}
                                    >
                                        <Text className="text-sm text-gray-800">
                                            {filters.categoryId === 'all' ? 'All Categories' :
                                                categories.find(c => c.id === filters.categoryId)?.name || 'All Categories'}
                                        </Text>
                                        <Text className="text-xs text-gray-500 ml-1">▼</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-1">
                                <Text className="text-xs font-medium text-gray-600 mb-1">Sort By</Text>
                                <View className="border border-gray-300 rounded-md bg-white">
                                    <TouchableOpacity
                                        className="px-2 py-1 flex-row justify-between items-center"
                                        onPress={() => setShowSortPicker(true)}
                                    >
                                        <Text className="text-sm text-gray-800">
                                            {filters.sortBy === 'createdAt' ? 'Created Date' :
                                                filters.sortBy === 'dueDate' ? 'Due Date' : 'Priority'}
                                        </Text>
                                        <Text className="text-xs text-gray-500 ml-1">▼</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Reset Filters Button */}
                        <View className="pt-4 border-t border-gray-100 mt-3">
                            <TouchableOpacity
                                className="flex-row items-center justify-center bg-gray-50 border border-gray-200 rounded-lg py-3 px-4"
                                onPress={handleResetFilters}
                            >
                                <Ionicons name="refresh" size={16} color="#6b7280" style={{ marginRight: 8 }} />
                                <Text className="text-sm text-gray-600 font-medium">Reset All Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Pull to Refresh Indicator */}
                <View className="px-4 py-2">
                    <TouchableOpacity onPress={handleRefresh} className="flex-row justify-center items-center py-2 rounded-lg">
                        <Ionicons name="refresh" size={16} color="#3b82f6" style={{ marginRight: 8 }} />
                        <Text className="text-sm text-blue-500">Pull to refresh</Text>
                    </TouchableOpacity>
                </View>

                {/* Task List */}
                <View className="px-4">
                    {tasks.length > 0 ? (
                        tasks.map((task) => {
                            const priorityStyles = getPriorityStyles(task.priority);
                            const taskStyles = getTaskStyles(task);
                            const taskCategories = categories.filter(cat => task.categoryIds.includes(cat.id));
                            const isOverdue = isTaskOverdue(task);
                            const isDueToday = isTaskDueToday(task);
                            const statusStyle = getStatusColor(task.status);

                            return (
                                <SwipeableTaskCard
                                    key={task.id}
                                    task={task}
                                    onPress={() => handleTaskPress(task.id)}
                                    onComplete={() => handleSwipeComplete(task.id)}
                                    onDelete={() => handleSwipeDelete(task.id)}
                                    priorityStyles={priorityStyles}
                                    taskStyles={taskStyles}
                                    taskCategories={taskCategories}
                                    isOverdue={isOverdue}
                                    isDueToday={isDueToday}
                                    statusStyle={statusStyle}
                                />
                            );
                        })
                    ) : (
                        <View className="items-center py-12 px-6">
                            <Ionicons name="clipboard-outline" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                            <Text className="text-lg font-semibold text-gray-800 mb-2">No tasks found</Text>
                            <Text className="text-base text-gray-500 text-center mb-6">Try adjusting your filters or create a new task</Text>
                            <TouchableOpacity className="bg-blue-500 flex-row items-center px-4 py-2 rounded-lg gap-2" onPress={handleAddTask}>
                                <Ionicons name="add" size={16} color="white" />
                                <Text className="text-base text-white font-semibold">Add Task</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Status Filter Modal */}
            <Modal
                visible={showStatusPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowStatusPicker(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-2xl pt-4 pb-8 max-h-1/2">
                        <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-gray-900">Filter by Status</Text>
                            <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        {[
                            { value: 'all', label: 'All Tasks', icon: 'clipboard-outline' },
                            { value: 'todo', label: 'To Do', icon: 'hourglass-outline' },
                            { value: 'in_progress', label: 'In Progress', icon: 'refresh' },
                            { value: 'completed', label: 'Completed', icon: 'checkmark-circle' }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${filters.status === option.value ? 'bg-blue-50' : ''
                                    }`}
                                onPress={() => {
                                    setFilters({ ...filters, status: option.value as any });
                                    setShowStatusPicker(false);
                                }}
                            >
                                <Ionicons name={option.icon as any} size={20} color="#6b7280" style={{ marginRight: 12 }} />
                                <Text className="text-base text-gray-600 flex-1">{option.label}</Text>
                                {filters.status === option.value && (
                                    <Ionicons name="checkmark" size={16} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Priority Filter Modal */}
            <Modal
                visible={showPriorityPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPriorityPicker(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-2xl pt-4 pb-8 max-h-1/2">
                        <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-gray-900">Filter by Priority</Text>
                            <TouchableOpacity onPress={() => setShowPriorityPicker(false)}>
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        {[
                            { value: 'all', label: 'All Priorities', icon: 'flag-outline', color: '#6b7280' },
                            { value: 'high', label: 'High Priority', icon: 'flag', color: '#ef4444' },
                            { value: 'medium', label: 'Medium Priority', icon: 'flag', color: '#f59e0b' },
                            { value: 'low', label: 'Low Priority', icon: 'flag-outline', color: '#10b981' }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${filters.priority === option.value ? 'bg-blue-50' : ''
                                    }`}
                                onPress={() => {
                                    setFilters({ ...filters, priority: option.value as any });
                                    setShowPriorityPicker(false);
                                }}
                            >
                                <Ionicons name={option.icon as any} size={20} color={option.color} style={{ marginRight: 12 }} />
                                <Text className="text-base text-gray-600 flex-1">{option.label}</Text>
                                {filters.priority === option.value && (
                                    <Ionicons name="checkmark" size={16} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Category Filter Modal */}
            <Modal
                visible={showCategoryPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryPicker(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-2xl pt-4 pb-8 max-h-1/2">
                        <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-gray-900">Filter by Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${filters.categoryId === 'all' ? 'bg-blue-50' : ''
                                }`}
                            onPress={() => {
                                setFilters({ ...filters, categoryId: 'all' });
                                setShowCategoryPicker(false);
                            }}
                        >
                            <Ionicons name="folder-outline" size={20} color="#6b7280" style={{ marginRight: 12 }} />
                            <Text className="text-base text-gray-600 flex-1">All Categories</Text>
                            {filters.categoryId === 'all' && (
                                <Ionicons name="checkmark" size={16} color="#3b82f6" />
                            )}
                        </TouchableOpacity>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${filters.categoryId === category.id ? 'bg-blue-50' : ''
                                    }`}
                                onPress={() => {
                                    setFilters({ ...filters, categoryId: category.id });
                                    setShowCategoryPicker(false);
                                }}
                            >
                                <View
                                    className="w-4 h-4 rounded-full mr-3"
                                    style={{ backgroundColor: category.color }}
                                />
                                <Text className="text-base text-gray-600 flex-1">{category.name}</Text>
                                {filters.categoryId === category.id && (
                                    <Ionicons name="checkmark" size={16} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Sort Filter Modal */}
            <Modal
                visible={showSortPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSortPicker(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-2xl pt-4 pb-8 max-h-1/2">
                        <View className="flex-row items-center justify-between px-5 pb-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-gray-900">Sort By</Text>
                            <TouchableOpacity onPress={() => setShowSortPicker(false)}>
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        {[
                            { value: 'createdAt', label: 'Created Date', icon: 'calendar-outline' },
                            { value: 'dueDate', label: 'Due Date', icon: 'time-outline' },
                            { value: 'priority', label: 'Priority', icon: 'flag-outline' }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${filters.sortBy === option.value ? 'bg-blue-50' : ''
                                    }`}
                                onPress={() => {
                                    setFilters({ ...filters, sortBy: option.value as any });
                                    setShowSortPicker(false);
                                }}
                            >
                                <Ionicons name={option.icon as any} size={20} color="#6b7280" style={{ marginRight: 12 }} />
                                <Text className="text-base text-gray-600 flex-1">{option.label}</Text>
                                {filters.sortBy === option.value && (
                                    <Ionicons name="checkmark" size={16} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

