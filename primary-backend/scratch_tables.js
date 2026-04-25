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
const client_1 = require("@prisma/client");
const p = new client_1.PrismaClient();
function m() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tables = yield p.$queryRawUnsafe("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
            console.log(JSON.stringify(tables, null, 2));
        }
        catch (e) {
            console.error(e);
        }
        finally {
            yield p.$disconnect();
        }
    });
}
m();
