/** Hands a fetched file to the browser as a download. */
export function saveFile(blob: Blob, filename: string): void {
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
	URL.revokeObjectURL(link.href);
}
