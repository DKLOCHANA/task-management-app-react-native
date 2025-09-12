import React, { Component, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.log('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 items-center justify-center p-4 bg-gray-50">
                    <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 w-full max-w-sm">
                        <View className="items-center mb-4">
                            <Text className="text-4xl mb-2">⚠️</Text>
                            <Text className="text-xl font-bold text-gray-900 mb-2">
                                Oops! Something went wrong
                            </Text>
                            <Text className="text-gray-600 text-center">
                                We encountered an unexpected error. Please try again.
                            </Text>
                        </View>

                        {__DEV__ && this.state.error && (
                            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <Text className="text-red-800 text-xs font-mono">
                                    {this.state.error.message}
                                </Text>
                            </View>
                        )}

                        <Button
                            variant="primary"
                            onPress={() => this.setState({ hasError: false })}
                            className="w-full"
                        >
                            Try Again
                        </Button>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}