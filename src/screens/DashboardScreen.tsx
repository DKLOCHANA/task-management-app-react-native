import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useApolloTasks } from '../hooks/useApolloTasks';
import { TaskStatus, Priority } from '../apollo/types';
import { TabParamList, RootStackParamList } from '../types';

type DashboardNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Dashboard'>,
    StackNavigationProp<RootStackParamList>
>;

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<DashboardNavigationProp>();
    const { tasks, getTaskStats, isTaskOverdue, isTaskDueToday, user, loading } = useApolloTasks();

    const stats = getTaskStats();
    const recentTasks = tasks.slice(0, 5);

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#eab308';
            case 'low': return '#22c55e';
            default: return '#6b7280';
        }
    };

    const getStatusStyle = (status: TaskStatus) => {
        switch (status) {
            case 'todo': return { backgroundColor: '#f3f4f6', color: '#1f2937' };
            case 'in_progress': return { backgroundColor: '#dbeafe', color: '#1e40af' };
            case 'completed': return { backgroundColor: '#dcfce7', color: '#166534' };
            default: return { backgroundColor: '#f3f4f6', color: '#1f2937' };
        }
    };

    const handleTaskNavigation = (taskId: string) => {
        navigation.navigate('TaskDetail', { taskId });
    };

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            {/* Welcome Section */}
            <View className="bg-blue-500 px-6 py-6">
                <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-white mb-1">Welcome back!</Text>
                        <Text className="text-sm text-blue-200">{user?.email}</Text>
                    </View>
                    <View className="w-12 h-12 bg-white/20 rounded-full justify-center items-center">
                        <Ionicons name="person-outline" size={24} color="white" />
                    </View>
                </View>
            </View>

            <View className="p-4">
                {/* Quick Stats */}
                <View className="flex-row flex-wrap gap-4 mb-6">
                    <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-gray-800 mb-1">{stats.total}</Text>
                                <Text className="text-sm text-gray-500">Total Tasks</Text>
                            </View>
                            <View className="w-10 h-10 bg-blue-100 rounded-lg justify-center items-center">
                                <Ionicons name="clipboard-outline" size={18} color="#2563eb" />
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-green-500 mb-1">{stats.completed}</Text>
                                <Text className="text-sm text-gray-500">Completed</Text>
                            </View>
                            <View className="w-10 h-10 bg-green-100 rounded-lg justify-center items-center">
                                <Ionicons name="checkmark-circle-outline" size={18} color="#22c55e" />
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-yellow-500 mb-1">{stats.pending}</Text>
                                <Text className="text-sm text-gray-500">Pending</Text>
                            </View>
                            <View className="w-10 h-10 bg-yellow-100 rounded-lg justify-center items-center">
                                <Ionicons name="time-outline" size={18} color="#eab308" />
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-red-500 mb-1">{stats.overdue}</Text>
                                <Text className="text-sm text-gray-500">Overdue</Text>
                            </View>
                            <View className="w-10 h-10 bg-red-100 rounded-lg justify-center items-center">
                                <Ionicons name="warning-outline" size={18} color="#ef4444" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Today's Focus */}
                {stats.todayTasks > 0 && (
                    <View className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-blue-800 mb-1">Today's Focus</Text>
                                <Text className="text-sm text-blue-700">
                                    You have {stats.todayTasks} task{stats.todayTasks > 1 ? 's' : ''} due today
                                </Text>
                            </View>
                            <View className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center">
                                <Text className="text-sm font-bold text-white">{stats.todayTasks}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
                    <Text className="text-base font-semibold text-gray-800 mb-4">Quick Actions</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-blue-500 flex-row justify-center items-center py-3 rounded-lg"
                            onPress={() => navigation.navigate('Add')}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="white" />
                            <Text className="text-white font-semibold text-sm ml-2">Add Task</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-gray-100 flex-row justify-center items-center py-3 rounded-lg"
                            onPress={() => navigation.navigate('Tasks')}
                        >
                            <Ionicons name="list-outline" size={20} color="#374151" />
                            <Text className="text-gray-700 font-semibold text-sm ml-2">View All</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Tasks */}
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-base font-semibold text-gray-800">Recent Tasks</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                            <Text className="text-blue-500 text-sm font-medium">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentTasks.length > 0 ? (
                        <View className="gap-3">
                            {recentTasks.map((task) => {
                                const isOverdue = isTaskOverdue(task);
                                const isDueToday = isTaskDueToday(task);
                                const statusStyle = getStatusStyle(task.status);

                                return (
                                    <TouchableOpacity
                                        key={task.id}
                                        className="flex-row items-center p-3 rounded-lg bg-gray-50"
                                        onPress={() => handleTaskNavigation(task.id)}
                                    >
                                        <View
                                            className="w-3 h-3 rounded-full mr-3 opacity-80"
                                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                                        />

                                        <View className="flex-1 min-w-0">
                                            <Text className={`text-base font-medium mb-1 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
                                                }`}>
                                                {task.title}
                                            </Text>
                                            <View className="flex-row items-center gap-2">
                                                <View
                                                    className="px-2 py-0.5 rounded-xl"
                                                    style={{ backgroundColor: statusStyle.backgroundColor }}
                                                >
                                                    <Text
                                                        className="text-xs capitalize"
                                                        style={{ color: statusStyle.color }}
                                                    >
                                                        {task.status.replace('_', ' ')}
                                                    </Text>
                                                </View>
                                                {isDueToday && !isOverdue && (
                                                    <View className="bg-blue-100 px-2 py-0.5 rounded-xl">
                                                        <Text className="text-xs text-blue-600">Today</Text>
                                                    </View>
                                                )}
                                                {isOverdue && (
                                                    <View className="bg-red-100 px-2 py-0.5 rounded-xl">
                                                        <Text className="text-xs text-red-600">Overdue</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        <Text className="text-xl text-gray-400 ml-2">›</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View className="items-center py-8">
                            <Ionicons name="clipboard-outline" size={48} color="#6b7280" />
                            <Text className="text-base text-gray-500 mb-4">No tasks yet</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Add')}>
                                <Text className="text-blue-500 text-base font-semibold">Create your first task</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

