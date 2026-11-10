import { Component } from "react";
import Button from "./Button";

export default class ToolErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm font-mono text-fg-soft">
          This tool&apos;s script failed to load.
        </p>
        <p className="max-w-md text-xs font-mono text-fg-muted">
          Reload to fetch the current version. If it still fails, publish the
          site again so the tool file is replaced.
        </p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }
}
