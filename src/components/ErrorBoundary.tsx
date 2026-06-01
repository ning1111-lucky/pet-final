import React from "react";

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;

  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center bg-[var(--color-page)] text-[var(--color-text)]">
        <div className="w-full max-w-[430px] bg-[var(--color-card)] border-[4px] border-[var(--color-black)] rounded-[24px] p-6 text-center shadow-[6px_6px_0_var(--color-black)]">
          <div className="text-2xl font-bold mb-3">頁面資料有點混亂</div>
          <p className="text-sm font-bold mb-6">重置並重新開始</p>
          {import.meta.env.DEV && this.state.error?.message ? (
            <div className="mb-6 text-left text-xs font-mono bg-white border-[3px] border-[var(--color-black)] rounded-lg p-3 break-words">
              {this.state.error.message}
            </div>
          ) : null}
          <button
            type="button"
            onClick={this.handleReset}
            className="pixel-button font-bold px-4 py-3 bg-[var(--color-green)] text-[var(--color-black)]"
          >
            重置並重新開始
          </button>
        </div>
      </div>
    );
  }
}
