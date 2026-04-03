import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Check if it's a Firestore JSON error
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error && parsed.operationType) {
        this.setState({ errorInfo: JSON.stringify(parsed, null, 2) });
      }
    } catch (e) {
      // Not a JSON error
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060612] flex items-center justify-center p-6 font-['Space_Grotesk']">
          <div className="max-w-2xl w-full bg-white/[0.03] border border-white/10 rounded-[32px] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f43f5e] to-[#00d4ff]" />
            
            <div className="w-20 h-20 rounded-3xl bg-[#f43f5e]/10 flex items-center justify-center mb-8 border border-[#f43f5e]/20">
              <ShieldAlert className="w-10 h-10 text-[#f43f5e]" />
            </div>

            <h1 className="font-['Fraunces'] font-black text-3xl md:text-4xl text-white mb-4">
              System <span className="text-[#f43f5e]">Anomaly</span> Detected
            </h1>
            
            <p className="text-[#b8c4e0] text-lg mb-8 leading-relaxed">
              We encountered an unexpected error while processing your request. Our security protocols have intercepted the issue to protect your data.
            </p>

            {this.state.errorInfo ? (
              <div className="mb-8 p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-xs text-[#f43f5e] overflow-x-auto">
                <div className="text-white/40 mb-2 uppercase tracking-widest font-bold">Diagnostic Data:</div>
                <pre>{this.state.errorInfo}</pre>
              </div>
            ) : (
              <div className="mb-8 p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-xs text-[#f43f5e]">
                {this.state.error?.message || 'An unknown error occurred'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl font-black text-sm hover:scale-[1.02] transition-transform"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry Operation
              </button>
              <button 
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                <Home className="w-4 h-4" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
