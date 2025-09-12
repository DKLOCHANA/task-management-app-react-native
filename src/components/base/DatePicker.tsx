import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { Button } from './Button';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    label,
    placeholder = "Select date",
    error,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempDate, setTempDate] = useState(value || new Date().toISOString().split('T')[0]);

    const formatDate = (dateString: string) => {
        if (!dateString) return placeholder;
        const date = new Date(dateString);
        return date.toDateString();
    };

    const handleConfirm = () => {
        onChange(tempDate);
        setIsOpen(false);
    };

    const generateDateOptions = () => {
        const dates = [];
        const today = new Date();

        // Generate dates for next 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            dates.push({
                date: dateString,
                display: date.toDateString()
            });
        }
        return dates;
    };

    return (
        <View className={`mb-4 ${className}`}>
            {label && (
                <Text className="text-gray-700 font-medium mb-2 text-sm">
                    {label}
                </Text>
            )}

            <TouchableOpacity
                onPress={() => setIsOpen(true)}
                className={`border rounded-lg px-3 py-3 h-12 flex-row items-center justify-between ${error ? 'border-red-500' : 'border-gray-200'
                    }`}
            >
                <Text className={`${value ? 'text-gray-900' : 'text-gray-400'}`}>
                    {formatDate(value)}
                </Text>
                <Text className="text-gray-400">📅</Text>
            </TouchableOpacity>

            {error && (
                <Text className="text-red-500 text-sm mt-1">
                    {error}
                </Text>
            )}

            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl">
                        <View className="border-b border-gray-200 p-4">
                            <Text className="font-medium text-gray-900 text-center text-lg">
                                Select Date
                            </Text>
                        </View>

                        <View className="p-4 max-h-96">
                            {generateDateOptions().map((dateOption) => (
                                <TouchableOpacity
                                    key={dateOption.date}
                                    onPress={() => setTempDate(dateOption.date)}
                                    className={`p-3 rounded-lg mb-2 ${dateOption.date === tempDate ? 'bg-blue-100' : 'bg-gray-50'
                                        }`}
                                >
                                    <Text className={`${dateOption.date === tempDate ? 'text-blue-600 font-medium' : 'text-gray-900'
                                        }`}>
                                        {dateOption.display}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="flex-row p-4 space-x-3">
                            <Button
                                variant="secondary"
                                onPress={() => setIsOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onPress={handleConfirm}
                                className="flex-1"
                            >
                                Confirm
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};