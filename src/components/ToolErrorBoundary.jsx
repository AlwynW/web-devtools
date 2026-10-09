import { Component } from "react";

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
        <p className="text-sm font-mono text-stone-700 dark:text-stone-300">
          This tool&apos;s script failed to load.
        </p>
        <p className="max-w-md text-xs font-mono text-stone-500 dark:text-stone-400">
          Reload to fetch the current version. If it still fails, publish the
          site again so the tool file is replaced.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 border font-mono text-xs tracking-tight bg-stone-900 hover:bg-stone-800 text-stone-50 border-stone-900 dark:bg-stone-50 dark:hover:bg-stone-200 dark:text-stone-950 dark:border-stone-200"
        >
          Reload
        </button>
      </div>
    );
  }
}
