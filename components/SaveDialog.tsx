'use client';

import React, { useEffect, useState } from 'react';

type SaveDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, isPublic: boolean) => void | Promise<void>;
  defaultName: string;
};

export function SaveDialog({ open, onClose, onSave, defaultName }: SaveDialogProps) {
  const [name, setName] = useState(defaultName);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setIsPublic(false);
    }
  }, [open, defaultName]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) void Promise.resolve(onSave(trimmed, isPublic));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-xl border-2 border-[#39ff14]/50 bg-[#1a1a1a] p-6 shadow-xl shadow-[#39ff14]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="save-dialog-title" className="mb-4 font-mono text-sm font-semibold uppercase tracking-wider text-[#39ff14]">
          Save Strategy
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block font-mono text-xs text-[#888]">Strategy Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My First Strategy"
              autoFocus
              className="w-full rounded-lg border border-[#333] bg-[#222] px-3 py-2 font-mono text-sm text-white placeholder-[#666] focus:border-[#39ff14] focus:outline-none focus:ring-1 focus:ring-[#39ff14]"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-[#333] bg-[#222] accent-[#39ff14] focus:ring-[#39ff14]"
            />
            <span className="font-mono text-sm text-[#888]">Publish to Community Marketplace?</span>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#333] bg-[#222] px-4 py-2 font-mono text-sm font-medium text-white transition-colors hover:border-[#666] hover:bg-[#2a2a2a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg border border-[#39ff14] bg-[#39ff14]/10 px-4 py-2 font-mono text-sm font-semibold text-[#39ff14] transition-colors hover:bg-[#39ff14]/20 disabled:opacity-50 disabled:hover:bg-[#39ff14]/10"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
