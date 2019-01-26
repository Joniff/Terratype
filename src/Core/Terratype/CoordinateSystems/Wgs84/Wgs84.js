var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Wgs84CoordinateSystem = /** @class */ (function (_super) {
    __extends(Wgs84CoordinateSystem, _super);
    function Wgs84CoordinateSystem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 'Wgs84';
        return _this;
    }
    Wgs84CoordinateSystem.prototype.display = function (datum) {
    };
    Wgs84CoordinateSystem.prototype.parse = function (text) {
    };
    return Wgs84CoordinateSystem;
}(CoordinateSystem));
//# sourceMappingURL=Wgs84.js.map