import { Component, type ErrorInfo, type ReactNode } from "react";
import errorGifSrc from "@/assets/error.gif";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere below it and shows a recoverable
 * fallback instead of unmounting the whole tree to a blank page. A class
 * component is required — React has no hook equivalent for error boundaries.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          height: "100dvh",
          padding: "1rem",
          textAlign: "center",
          background: "#242424",
          color: "#fff",
          fontFamily: '"VT323", monospace',
        }}
      >
        <img
          src={errorGifSrc}
          alt=""
          style={{ maxWidth: "min(320px, 80vw)", borderRadius: "8px" }}
        />
        <h1>Something went wrong</h1>
        <p>The app hit an unexpected error.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "0.5rem 1.25rem",
            fontSize: "1rem",
            fontFamily: "inherit",
            color: "#fff",
            background: "#646cff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
