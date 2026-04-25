import type { FetchError } from "ofetch";

export type SuccessResponse = {
	success: boolean;
	message?: string;
};

export type ErrorResponseDetail = {
	property: string;
	constraintName: string;
	message: string;
};

export type ErrorResponse = FetchError<{
	timestamp: string;
	statusCode: number;
	statusMessage?: string;
	message: string;
	details?: ErrorResponseDetail[];
}>;

export type MediaInfo = {
	url: string;
	fileId: string;
};
