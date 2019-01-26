var Global = /** @class */ (function () {
    function Global() {
        this.installedCoordinateSystems = {};
        this.installedProviders = {};
        this.installedSearchers = {};
    }
    Global.prototype.addCoordinateSystem = function (coordinateSystem) {
        this.installedCoordinateSystems[coordinateSystem.id] = coordinateSystem;
    };
    ;
    Global.prototype.getCoordinateSystem = function (id) {
        return this.installedCoordinateSystems[id];
    };
    Global.prototype.getWgs84 = function () {
        return this.installedCoordinateSystems['wgs84'];
    };
    Global.prototype.addProvider = function (provider) {
        this.installedProviders[provider.id] = provider;
    };
    ;
    Global.prototype.getProvider = function (id) {
        return this.installedProviders[id];
    };
    Global.prototype.addSearcher = function (searcher) {
        this.installedSearchers[searcher.id] = searcher;
    };
    ;
    Global.prototype.getSearcher = function (id) {
        return this.installedSearchers[id];
    };
    return Global;
}());
//# sourceMappingURL=Global.js.map