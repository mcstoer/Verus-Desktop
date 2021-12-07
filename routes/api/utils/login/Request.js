"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
var vdxf_1 = require("../vdxf");
var Challenge_1 = require("./Challenge");
var Request = /** @class */ (function (_super) {
    __extends(Request, _super);
    function Request(request) {
        var _this = _super.call(this, vdxf_1.REQUEST_VDXF_KEY) || this;
        _this.chain_id = request.chain_id;
        _this.signing_id = request.signing_id;
        _this.signature = new vdxf_1.VerusIDSignature(request.signature);
        _this.challenge = new Challenge_1.Challenge(request.challenge);
        return _this;
    }
    Request.prototype.getSignedData = function () {
        return this.challenge.toString();
    };
    Request.prototype.stringable = function () {
        return {
            vdxfkey: this.vdxfkey,
            chain_id: this.chain_id,
            signing_id: this.signing_id,
            signature: this.signature.stringable(),
            challenge: this.challenge.stringable(),
        };
    };
    return Request;
}(vdxf_1.VDXFObject));
exports.Request = Request;