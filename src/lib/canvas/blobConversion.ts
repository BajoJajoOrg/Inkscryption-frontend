export const JSONtoBlob = (data: any) => {
	const jsonString = JSON.stringify(data);
	const blob = new Blob([jsonString], { type: 'application/json' });
	return blob;
};

export const BlobToJSON = async (blob: any) => {
	return JSON.parse(await blob.text());
};
