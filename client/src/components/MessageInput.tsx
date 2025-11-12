import { useState, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Loader2, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  isSending?: boolean;
  placeholder?: string;
  onTyping?: () => void;
}

export default function MessageInput({
  onSend,
  isSending = false,
  placeholder,
  onTyping,
}: MessageInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const handleSend = () => {
    if (!message.trim() || isSending) return;
    onSend(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    if (onTyping) {
      onTyping();
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="p-3 sm:p-4">
        <div className="flex items-end gap-2">
          {/* Emoji picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0 mb-0.5 text-muted-foreground hover:text-primary"
                data-testid="emoji-button"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-full p-0 border-0" 
              side="top" 
              align="start"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.AUTO}
                width="100%"
                height={400}
                searchPlaceholder={t("messages.search_emoji") || "Ara..."}
                previewConfig={{ showPreview: false }}
              />
            </PopoverContent>
          </Popover>

          {/* Text input */}
          <Textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t("messages.type_message")}
            className="resize-none min-h-[40px] max-h-[120px] rounded-full px-4 py-2.5 text-sm border-2 focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
            disabled={isSending}
            data-testid="message-input"
          />

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            size="icon"
            className="flex-shrink-0 rounded-full h-10 w-10"
            data-testid="send-message-button"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
