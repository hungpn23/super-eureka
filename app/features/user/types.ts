import type { UUID } from "~/shared/types";
import type { UserRole } from "./enums";

export type User = {
	id: UUID;
	username: string;
	email?: string | null;
	emailVerified: boolean;
	avatarUrl?: string | null;
	role: UserRole;
	createdAt: Date;
	updatedAt?: Date | null;
};

export type Owner = Pick<User, "id" | "username" | "avatarUrl">;

export type UserStats = {
	currentStreak: number;
	longestStreak: number;
	totalCardsLearned: number;
	masteryRate: number;
};
