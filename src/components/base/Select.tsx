import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onValueChange,
    placeholder = "Select an option",
    label,
    error,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(option => option.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue);
        setIsOpen(false);
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
                <Text className={`${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
                    {displayText}
                </Text>
                <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>

            {error && (
                <Text className="text-red-500 text-sm mt-1">
                    {error}
                </Text>
            )}

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View className="bg-white mx-4 rounded-lg max-h-96 w-80">
                        <View className="border-b border-gray-200 p-4">
                            <Text className="font-medium text-gray-900 text-center">
                                {label || 'Select Option'}
                            </Text>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item.value)}
                                    className={`p-4 border-b border-gray-100 ${item.value === value ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <Text className={`${item.value === value ? 'text-blue-600 font-medium' : 'text-gray-900'
                                        }`}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};