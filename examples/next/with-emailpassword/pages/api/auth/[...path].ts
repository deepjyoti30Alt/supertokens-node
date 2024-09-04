import { getAppDirRequestHandler } from "supertokens-node/nextjs";
import supertokens from "supertokens-node";
import { NextRequest, NextResponse } from "next/server";
import { backendConfig } from "../../../config/backendConfig";

supertokens.init(backendConfig());
const handleCall = getAppDirRequestHandler(NextResponse);

export default async function handler(req: NextRequest) {
    const res = await handleCall(req);

    // Add Cache-Control header if it's not already set
    if (!res.headers.has("Cache-Control")) {
        res.headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
    }

    return res;
}
