"use client";

import { create } from "zustand";

type PostType = "post" | "reel" | "story";

interface PostState {
  selectedAccounts: string[];
  postType: PostType;
  content: string;
  firstComment: string;
  mediaFile: File | null;
  scheduledDate: Date | null;
  isDraft: boolean;
  setSelectedAccounts: (accounts: string[]) => void;
  toggleAccount: (account: string) => void;
  setPostType: (type: PostType) => void;
  setContent: (content: string) => void;
  setFirstComment: (comment: string) => void;
  setMediaFile: (file: File | null) => void;
  setScheduledDate: (date: Date | null) => void;
  setIsDraft: (isDraft: boolean) => void;
}

export const usePostStore = create<PostState>((set) => ({
  selectedAccounts: [],
  postType: "post",
  content: "",
  firstComment: "",
  mediaFile: null,
  scheduledDate: null,
  isDraft: false,
  
  setSelectedAccounts: (accounts) => set({ selectedAccounts: accounts }),
  
  toggleAccount: (account) =>
    set((state) => ({
      selectedAccounts: state.selectedAccounts.includes(account)
        ? state.selectedAccounts.filter((a) => a !== account)
        : [...state.selectedAccounts, account],
    })),
  
  setPostType: (type) => set({ postType: type }),
  setContent: (content) => set({ content }),
  setFirstComment: (comment) => set({ firstComment: comment }),
  setMediaFile: (file) => set({ mediaFile: file }),
  setScheduledDate: (date) => set({ scheduledDate: date, isDraft: false }),
  setIsDraft: (isDraft) => set({ isDraft, scheduledDate: null }),
}));
