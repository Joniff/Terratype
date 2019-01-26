class AddressName {
	long: string;
	short: string;
}

class Address {
	id: string;
	country: AddressName;
	administrativeArea1: AddressName;
	administrativeArea2: AddressName;
	locality: AddressName;
	neighborhood: AddressName;
	route: AddressName;
	premise: AddressName;
	subpremise: AddressName;
	formatted: AddressName;
	postalcode: AddressName;
	urls: string[];
}
