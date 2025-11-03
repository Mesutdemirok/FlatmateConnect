import { formatDateRelative } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck, Check } from "lucide-react";

interface MessageBubbleProps {
  message: string;
  isMine: boolean;
  senderName?: string;
  senderImage?: string;
  timestamp: string;
  isRead?: boolean;
  showAvatar?: boolean;
}

export default function MessageBubble({
  message,
  isMine,
  senderName,
  senderImage,
  timestamp,
  isRead,
  showAvatar = true,
}: MessageBubbleProps) {
  const initials = senderName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  return (
    <div
      className={`flex gap-2 items-end mb-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`message-bubble-${isMine ? "mine" : "theirs"}`}
    >
      {/* Avatar */}
      {showAvatar && !isMine && (
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={senderImage} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      {showAvatar && isMine && <div className="w-7" />}

      {/* Message Content */}
      <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[75%] sm:max-w-md`}>
        {/* Bubble */}
        <div
          className={`px-3 py-2 rounded-2xl shadow-sm ${
            isMine
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message}
          </p>
        </div>

        {/* Timestamp & Read Status */}
        <div className="flex items-center gap-1 mt-0.5 px-2">
          <span className="text-[10px] text-muted-foreground">
            {formatDateRelative(timestamp)}
          </span>
          {isMine && (
            <span className="text-muted-foreground">
              {isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-500" data-testid="message-read" />
              ) : (
                <Check className="h-3 w-3" data-testid="message-sent" />
              )}
            </span>
          )}
        </div>
      </div>

      {!showAvatar && !isMine && <div className="w-7" />}
    </div>
  );
}
