var ColourFilterBase = /** @class */ (function () {
    function ColourFilterBase() {
    }
    return ColourFilterBase;
}());
//# sourceMappingURL=ColorFilterBase.js.map
var CoordinateDisplayBase = /** @class */ (function () {
    function CoordinateDisplayBase() {
    }
    return CoordinateDisplayBase;
}());
//# sourceMappingURL=CoordinateDisplayBase.js.map
var CoordinateSystemBase = /** @class */ (function () {
    function CoordinateSystemBase() {
    }
    return CoordinateSystemBase;
}());
//# sourceMappingURL=CoordinateSystemBase.js.map
var LabelBase = /** @class */ (function () {
    function LabelBase() {
    }
    return LabelBase;
}());
//# sourceMappingURL=LabelBase.js.map
var MapBase = /** @class */ (function () {
    function MapBase() {
    }
    return MapBase;
}());
//# sourceMappingURL=MapBase.js.map
var ProviderBase = /** @class */ (function () {
    function ProviderBase() {
    }
    return ProviderBase;
}());
//# sourceMappingURL=ProviderBase.js.map
var SearcherBase = /** @class */ (function () {
    function SearcherBase() {
    }
    return SearcherBase;
}());
//# sourceMappingURL=SearcherBase.js.map
var ViewBase = /** @class */ (function () {
    function ViewBase() {
    }
    return ViewBase;
}());
//# sourceMappingURL=ViewBase.js.map
var AddressName = /** @class */ (function () {
    function AddressName() {
    }
    return AddressName;
}());
var Address = /** @class */ (function () {
    function Address() {
    }
    return Address;
}());
//# sourceMappingURL=Address.js.map
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
var Position = /** @class */ (function () {
    function Position() {
    }
    return Position;
}());
//# sourceMappingURL=Position.js.map