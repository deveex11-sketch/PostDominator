"use client";

import { CreatePostPanel } from "./_components/create-post-panel";
import { PostPreviewPanel } from "./_components/post-preview-panel";

export default function CreatePostPage() {
  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-4 md:gap-6 overflow-hidden">
      <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 overflow-hidden">
        <div className="overflow-y-auto pr-2">
          <CreatePostPanel />
        </div>
        <div className="overflow-y-auto pr-2">
          <PostPreviewPanel />
        </div>
      </div>
    </div>
  );
}
