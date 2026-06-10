"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestStatus = exports.ItemStatus = exports.Condition = exports.Category = void 0;
var Category;
(function (Category) {
    Category["SOFA"] = "SOFA";
    Category["MESA"] = "MESA";
    Category["CADEIRA"] = "CADEIRA";
    Category["CAMA"] = "CAMA";
    Category["ARMARIO"] = "ARMARIO";
    Category["ESTANTE"] = "ESTANTE";
    Category["OUTROS"] = "OUTROS";
})(Category || (exports.Category = Category = {}));
var Condition;
(function (Condition) {
    Condition["NOVO"] = "NOVO";
    Condition["BOM"] = "BOM";
    Condition["REPARO"] = "REPARO";
})(Condition || (exports.Condition = Condition = {}));
var ItemStatus;
(function (ItemStatus) {
    ItemStatus["AVAILABLE"] = "AVAILABLE";
    ItemStatus["PENDING"] = "PENDING";
    ItemStatus["RESERVED"] = "RESERVED";
    ItemStatus["DONATED"] = "DONATED";
})(ItemStatus || (exports.ItemStatus = ItemStatus = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "PENDING";
    RequestStatus["APPROVED"] = "APPROVED";
    RequestStatus["REJECTED"] = "REJECTED";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
