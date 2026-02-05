import { Bell, Check, CheckCheck, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "prescription_added":
        return "💊";
      case "record_accessed":
        return "👁️";
      case "refill_approved":
        return "✅";
      case "refill_denied":
        return "❌";
      case "reminder":
        return "⏰";
      default:
        return "📢";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                !notification.is_read && "bg-primary/5"
              )}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  !notification.is_read && "font-medium"
                )}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.is_read && (
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
