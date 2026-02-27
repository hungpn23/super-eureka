export type Metadata = {
	limit: number;
	totalRecords: number;
	totalPages: number;
	currentPage: number;
	nextPage: number;
	previousPage: number;
};

export type Paginated<T> = {
	data: T[];
	metadata: Metadata;
};
