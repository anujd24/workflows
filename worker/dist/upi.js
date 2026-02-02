"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUpi = sendUpi;
function sendUpi(to, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`creating payment session for ${to}...`);
        yield new Promise(r => setTimeout(r, 2000));
        console.log(`sent ₹${amount} to ${to} via upi`);
        return { status: "success", transactionId: "txn_" + Date.now() };
    });
}
