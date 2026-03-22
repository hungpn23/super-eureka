import type { UUID } from "~/shared/types";

export type Notification = {
  id: UUID;
  entityId: UUID;
  content: string;
  actor: {
    id: UUID;
    username: string;
    avatarUrl: string | null;
  };
  recipientId: UUID;
  createdAt: string;
  readAt: string | null;
};
