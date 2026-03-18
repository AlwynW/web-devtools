import { useState, useMemo } from "react";
import { MagnifyingGlass } from "phosphor-react";
import { copyToClipboard } from "../utils/clipboard";

const GIT_COMMANDS = [
  { category: "Basics", commands: [
    { command: "git init", description: "Initialize a new repo", example: "git init" },
    { command: "git clone <url>", description: "Clone a repository", example: "git clone https://github.com/user/repo.git" },
    { command: "git status", description: "Check working tree status", example: "git status" },
    { command: "git add <file>", description: "Stage files", example: "git add ." },
    { command: "git commit -m \"msg\"", description: "Commit with message", example: "git commit -m \"feat: add feature\"" },
    { command: "git push", description: "Push to remote", example: "git push origin main" },
    { command: "git pull", description: "Pull from remote", example: "git pull" },
  ]},
  { category: "Branching", commands: [
    { command: "git branch", description: "List branches", example: "git branch" },
    { command: "git branch <name>", description: "Create branch", example: "git branch feature-x" },
    { command: "git checkout <branch>", description: "Switch branch", example: "git checkout main" },
    { command: "git switch <branch>", description: "Switch branch (new)", example: "git switch main" },
    { command: "git merge <branch>", description: "Merge branch", example: "git merge feature-x" },
    { command: "git rebase <branch>", description: "Rebase onto branch", example: "git rebase main" },
  ]},
  { category: "Remote", commands: [
    { command: "git remote -v", description: "List remotes", example: "git remote -v" },
    { command: "git remote add <name> <url>", description: "Add remote", example: "git remote add origin https://..." },
    { command: "git fetch <remote>", description: "Fetch from remote", example: "git fetch origin" },
    { command: "git push -u origin <branch>", description: "Push and set upstream", example: "git push -u origin main" },
  ]},
  { category: "Stash", commands: [
    { command: "git stash", description: "Stash changes", example: "git stash" },
    { command: "git stash pop", description: "Apply and remove stash", example: "git stash pop" },
    { command: "git stash list", description: "List stashes", example: "git stash list" },
    { command: "git stash drop", description: "Remove stash", example: "git stash drop stash@{0}" },
  ]},
  { category: "History", commands: [
    { command: "git log", description: "View commit history", example: "git log --oneline" },
    { command: "git diff", description: "Show changes", example: "git diff" },
    { command: "git show <commit>", description: "Show commit details", example: "git show abc123" },
  ]},
  { category: "Undo", commands: [
    { command: "git restore <file>", description: "Discard file changes", example: "git restore file.js" },
    { command: "git reset --soft HEAD~1", description: "Undo last commit, keep changes", example: "git reset --soft HEAD~1" },
    { command: "git reset --hard HEAD~1", description: "Undo last commit, discard changes", example: "git reset --hard HEAD~1" },
    { command: "git revert <commit>", description: "Revert a commit", example: "git revert abc123" },
  ]},
];

export default function GitCheatsheet({ onToast }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return GIT_COMMANDS;
    return GIT_COMMANDS.map((group) => ({
      ...group,
      commands: group.commands.filter(
        (c) =>
          c.command.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      ),
    })).filter((g) => g.commands.length > 0);
  }, [search]);

  const copy = (cmd) => {
    copyToClipboard(cmd, () => onToast("Copied!"));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black mb-2 tracking-tight text-stone-900 dark:text-stone-50">
          Git Cheatsheet
        </h2>
        <p className="text-[13px] font-mono text-stone-500 dark:text-stone-400">
          Quick reference for common Git commands.
        </p>
      </header>

      <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="relative">
          <MagnifyingGlass
            size={16}
            weight="thin"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="> search commands (e.g. stash, merge, push)"
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-stone-500 dark:focus:ring-stone-400 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="space-y-6 max-h-[32rem] overflow-y-auto">
          {filtered.map((group) => (
            <div key={group.category}>
              <h3 className="text-[11px] font-mono tracking-[0.18em] text-stone-500 dark:text-stone-500 uppercase mb-2">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.commands.map((c) => (
                  <div
                    key={c.command}
                    className="flex items-center justify-between p-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <code className="font-mono font-bold text-stone-800 dark:text-stone-200">
                        {c.command}
                      </code>
                      <div className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                        {c.description}
                      </div>
                    </div>
                    <button
                      onClick={() => copy(c.example || c.command)}
                      className="ml-3 px-3 py-1.5 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-stone-500 font-mono text-sm">
            No matching commands.
          </div>
        )}
      </div>
    </div>
  );
}
