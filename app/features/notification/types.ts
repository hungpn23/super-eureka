import type { MediaInfo, UUID } from "~/shared/types";

export type Notification = {
  id: UUID;
  entityId: UUID;
  type: NotificationType;
  content: string;
  actor: {
    id: UUID;
    username: string;
    avatar: MediaInfo | null;
  };
  recipientId: UUID;
  createdAt: string;
  readAt: string | null;
};

export type NotificationType = "clone";

export type GetNotificationsResponse = {
  data: Notification[];
  totalRecords: number;
};
