
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Use a functional component wrapper to use hooks
const ErrorBoundaryWrapper = (props: Props) => {
  const isMobile = useIsMobile();
  
  return <ErrorBoundaryClass {...props} isMobile={isMobile} />;
};

// The actual class component for the error boundary
class ErrorBoundaryClass extends Component<Props & { isMobile: boolean }, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to an error tracking service if available
    if (window.navigator && navigator.sendBeacon) {
      try {
        const errorData = {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        };
        navigator.sendBeacon('/log-error', JSON.stringify(errorData));
      } catch (e) {
        console.error('Failed to send error data', e);
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      // Tailored UI based on device type
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            משהו השתבש
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            {this.state.error?.message || 'אירעה שגיאה בלתי צפויה'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              טען מחדש
            </Button>
            {!this.props.isMobile && (
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
              >
                נקה מטמון ואתחל
              </Button>
            )}
          </div>
          {!this.props.isMobile && this.state.errorInfo && (
            <details className="mt-6 text-left p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto max-w-full">
              <summary className="cursor-pointer font-medium mb-2">פרטי שגיאה טכניים</summary>
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;
