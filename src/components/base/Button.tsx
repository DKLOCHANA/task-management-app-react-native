import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ButtonProps } from '../../types';

export const Button: React.FC<ButtonProps & { loading?: boolean }> = ({
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = ''
}) => {
    const baseClasses = 'rounded-lg flex-row items-center justify-center';

    const variantClasses = {
        primary: 'bg-blue-500 active:bg-blue-600',
        secondary: 'bg-gray-100 active:bg-gray-200',
        danger: 'bg-red-500 active:bg-red-600',
        ghost: 'bg-transparent active:bg-gray-100'
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 min-h-[32px]',
        md: 'px-4 py-2 min-h-[40px]',
        lg: 'px-6 py-3 min-h-[48px]'
    };

    const textVariantClasses = {
        primary: 'text-white font-medium',
        secondary: 'text-gray-900 font-medium',
        danger: 'text-white font-medium',
        ghost: 'text-gray-700 font-medium'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const disabledClasses = disabled || loading ? 'opacity-50' : '';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' || variant === 'danger' ? 'white' : '#6B7280'}
                />
            ) : (
                typeof children === 'string' ? (
                    <Text className={`${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
                        {children}
                    </Text>
                ) : (
                    children
                )
            )}
        </TouchableOpacity>
    );
};