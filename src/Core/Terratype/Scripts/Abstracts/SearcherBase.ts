abstract class SearcherBase {
	id: string;
	name: string;
	description: string;
	referenceUrl: string;

	abstract reverseGeocode(position: Position): Address;
	abstract getAddress(addressId: string): Position;
	abstract getPosition(addressId: string) : Position;
	abstract geocode(searchText: string) : string[];
	abstract autocomplete(searchText: string): string[];

	configView: string;
	editorView: string;
	renderView: string;
}