export function normalize(text: string) {
	return text
		.toLowerCase()
		.normalize("NFKC")
		.replace(/[’‘]/g, "'")
		.replace(/[^\p{L}\p{N}'\s-]/gu, "")
		.replace(/\s+/g, " ")
		.replace(/\s-\s/g, "-")
		.trim();
}
