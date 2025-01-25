import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            משהו השתבש
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {this.state.error?.message || 'אירעה שגיאה בלתי צפויה'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            טען מחדש
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;