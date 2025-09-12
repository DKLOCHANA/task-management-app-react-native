import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface TextareaProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    numberOfLines?: number;
    maxLength?: number;
    className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    numberOfLines = 4,
    maxLength,
    className = ''
}) => {
    const baseClasses = 'border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white';
    const errorClasses = error ? 'border-red-500' : 'border-gray-200 focus:border-blue-500';

    return (
        <View className={`mb-4 ${className}`}>
            {label && (
                <Text className="text-gray-700 font-medium mb-2 text-sm">
                    {label}
                </Text>
            )}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                multiline
                numberOfLines={numberOfLines}
                maxLength={maxLength}
                className={`${baseClasses} ${errorClasses} min-h-[100px]`}
                placeholderTextColor="#9CA3AF"
                style={{ textAlignVertical: 'top' }}
            />
            {maxLength && (
                <Text className="text-gray-400 text-xs mt-1 text-right">
                    {value.length}/{maxLength}
                </Text>
            )}
            {error && (
                <Text className="text-red-500 text-sm mt-1">
                    {error}
                </Text>
            )}
        </View>
    );
};