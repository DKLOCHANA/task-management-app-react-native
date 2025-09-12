import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'small',
    color = '#3B82F6',
    className = ''
}) => {
    return (
        <View className={`flex items-center justify-center ${className}`}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
};