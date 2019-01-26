class Global {
	installedCoordinateSystems: { [id: string]: CoordinateSystemBase; } = {};

	addCoordinateSystem(coordinateSystem: CoordinateSystemBase): void {
		this.installedCoordinateSystems[coordinateSystem.id] = coordinateSystem;
	};

	getCoordinateSystem(id: string): CoordinateSystemBase {
		return this.installedCoordinateSystems[id];
	}

	getWgs84(): CoordinateSystemBase {
		return this.installedCoordinateSystems['wgs84'];
	}

	installedProviders: { [id: string]: ProviderBase; } = {};

	addProvider(provider: ProviderBase): void {
		this.installedProviders[provider.id] = provider;
	};

	getProvider(id: string): ProviderBase {
		return this.installedProviders[id];
	}

	installedSearchers: { [id: string]: SearcherBase; } = {};

	addSearcher(searcher: SearcherBase): void {
		this.installedSearchers[searcher.id] = searcher;
	};

	getSearcher(id: string): SearcherBase {
		return this.installedSearchers[id];
	}


}