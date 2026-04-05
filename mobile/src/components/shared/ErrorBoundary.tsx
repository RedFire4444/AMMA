import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // In production, this would send to Sentry
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-background items-center justify-center px-8">
          <Text className="text-4xl mb-4">{'\u{26A0}'}</Text>
          <Text className="text-xl font-serif font-bold text-primary mb-2 text-center">
            Something went wrong
          </Text>
          <Text className="text-base text-text-secondary text-center mb-6">
            We're sorry for the inconvenience. Please try again.
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-button"
            onPress={this.handleRetry}
          >
            <Text className="text-white font-bold text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
