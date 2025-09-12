import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { InputProps } from '../../types';

export const Input: React.FC<InputProps> = ({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    multiline = false,
    numberOfLines = 1,
    keyboardType = 'default',
    secureTextEntry = false,
    className = ''
}) => {
    const baseInputClasses = 'border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white';
    const errorInputClasses = error ? 'border-red-500' : 'border-gray-200 focus:border-blue-500';
    const multilineClasses = multiline ? 'min-h-[80px] text-top' : 'h-12';

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
                multiline={multiline}
                numberOfLines={numberOfLines}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                className={`${baseInputClasses} ${errorInputClasses} ${multilineClasses}`}
                placeholderTextColor="#9CA3AF"
                style={{ textAlignVertical: multiline ? 'top' : 'center' }}
            />
            {error && (
                <Text className="text-red-500 text-sm mt-1">
                    {error}
                </Text>
            )}
        </View>
    );
};