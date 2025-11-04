"use client";

import { useState, useRef } from "react";
import { 
  Smile, 
  Hash, 
  Sparkles, 
  Calendar, 
  Plus, 
  X,
  Image as ImageIcon,
  Video,
  Save,
  Send,
  Clock
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { AccountSelector } from "./account-selector";
import { usePostStore } from "./post-store";
import { DateTimePicker } from "./date-time-picker";

const POST_TYPES = [
  { value: "post", label: "Post" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
] as const;

export function CreatePostPanel() {
  const [dragActive, setDragActive] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    postType,
    content,
    firstComment,
    mediaFile,
    selectedAccounts,
    scheduledDate,
    isDraft,
    setPostType,
    setContent,
    setFirstComment,
    setMediaFile,
    setScheduledDate,
    setIsDraft,
  } = usePostStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setMediaFile(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleScheduleClick = () => {
    setShowSchedulePicker(!showSchedulePicker);
    if (!showSchedulePicker && !scheduledDate) {
      // Set default to 1 hour from now
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      defaultDate.setMinutes(0);
      setScheduledDate(defaultDate);
    }
  };

  const handleSaveDraft = () => {
    if (!content.trim() && !mediaFile) {
      toast.error("Please add content or media before saving as draft");
      return;
    }
    setIsDraft(true);
    toast.success("Post saved as draft");
  };

  const handlePostNow = () => {
    if (!selectedAccounts.length) {
      toast.error("Please select at least one account");
      return;
    }
    if (!content.trim() && !mediaFile) {
      toast.error("Please add content or media before posting");
      return;
    }
    setIsDraft(false);
    setScheduledDate(null);
    toast.success("Post published successfully!");
  };

  const handleSchedulePost = () => {
    if (!selectedAccounts.length) {
      toast.error("Please select at least one account");
      return;
    }
    if (!content.trim() && !mediaFile) {
      toast.error("Please add content or media before scheduling");
      return;
    }
    if (!scheduledDate) {
      toast.error("Please select a date and time");
      return;
    }
    if (scheduledDate < new Date()) {
      toast.error("Please select a future date and time");
      return;
    }
    setIsDraft(false);
    toast.success(`Post scheduled for ${scheduledDate.toLocaleString()}`);
  };

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Create Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Accounts</Label>
          <AccountSelector />
        </div>

        {/* Post Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Post Type</Label>
          <RadioGroup
            value={postType}
            onValueChange={(value) => setPostType(value as typeof postType)}
            className="flex gap-4"
          >
            {POST_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label
                  htmlFor={type.value}
                  className="cursor-pointer text-sm font-normal"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Content Section with Integrated Media and Tools */}
        <div className="space-y-3">
          <Label htmlFor="post-content" className="text-sm font-medium">
            Content
          </Label>
          
          {/* Text Area Container */}
          <div 
            className="relative rounded-lg border bg-card"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Drag Overlay */}
            {dragActive && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-primary bg-primary/10 backdrop-blur-sm">
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 size-8 text-primary" />
                  <p className="text-sm font-medium text-primary">Drop your file here</p>
                </div>
              </div>
            )}
            
            <Textarea
              id="post-content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24 resize-none border-0 focus-visible:ring-0"
            />
            
            {/* Media Preview (Inline) */}
            {mediaFile && (
              <>
                <Separator />
                <div className="relative p-3">
                  <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg bg-muted">
                    {mediaFile.type.startsWith("image/") ? (
                      <div className="relative size-full">
                        <img
                          src={URL.createObjectURL(mediaFile)}
                          alt="Preview"
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Video className="text-muted-foreground size-8" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={removeMedia}
                      className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {mediaFile.name} • {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </>
            )}
            
            {/* Toolbar */}
            <Separator />
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-8"
                    asChild
                  >
                    <span>
                      <ImageIcon className="size-4" />
                    </span>
                  </Button>
                </label>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-8"
                >
                  <Smile className="size-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-8"
                >
                  <Hash className="size-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-8"
                >
                  <Sparkles className="size-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-xs">
                  {content.length} characters
                </p>
              </div>
            </div>
          </div>
          

        </div>

        {/* Schedule Section */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Schedule</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("gap-2 h-8", scheduledDate && "text-primary")}
              onClick={handleScheduleClick}
            >
              <Calendar className="size-4" />
              <span className="text-xs">Set date & time</span>
            </Button>
          </div>

          {/* Schedule Date/Time Picker */}
          {showSchedulePicker && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <DateTimePicker
                date={scheduledDate}
                onDateChange={setScheduledDate}
              />
            </div>
          )}
        </div>

        {/* First Comment */}
        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="first-comment" className="text-sm font-medium">
            First Comment <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="first-comment"
            placeholder="Add a first comment..."
            value={firstComment}
            onChange={(e) => setFirstComment(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <Separator />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleSaveDraft}
            >
              <Save className="size-4" />
              <span>Save as a draft</span>
            </Button>
            <Button
              type="button"
              variant="default"
              className="flex-1 gap-2"
              onClick={handlePostNow}
            >
              <Send className="size-4" />
              <span>Post it now</span>
            </Button>
          </div>
          
          {showSchedulePicker && scheduledDate && (
            <Button
              type="button"
              variant="default"
              className="w-full gap-2"
              onClick={handleSchedulePost}
            >
              <Clock className="size-4" />
              <span>Schedule Post</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
