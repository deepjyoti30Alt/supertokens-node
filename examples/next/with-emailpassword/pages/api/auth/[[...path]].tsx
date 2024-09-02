import { superTokensNextWrapper } from "supertokens-node/nextjs";
import { middleware } from "supertokens-node/framework/express";
import { NextApiRequest, NextApiResponse } from "next";
import supertokens from "supertokens-node";
import { backendConfig } from "../../../config/backendConfig";
import { IncomingHttpHeaders } from "http";

supertokens.init(backendConfig());

class CustomResponseWrapper {
    private res: NextApiResponse;
    private headers: Headers;
    private statusCode: number;
    private body: string;

    constructor(res: NextApiResponse) {
        this.res = res;
        this.headers = new Headers();
        this.statusCode = 200;
        this.body = "";
    }

    setHeader(name: string, value: string): this {
        if (typeof this.res.setHeader === 'function') {
            this.res.setHeader(name, value);
        } else {
            this.headers.set(name, value);
        }
        return this;
    }

    getHeader(name: string): string | null {
        if (typeof this.res.getHeader === 'function') {
            const header = this.res.getHeader(name);
            return Array.isArray(header) ? header.join(', ') : header as string | null;
        } else {
            return this.headers.get(name);
        }
    }

    removeHeader(name: string): this {
        if (typeof this.res.removeHeader === 'function') {
            this.res.removeHeader(name);
        } else {
            this.headers.delete(name);
        }
        return this;
    }

    status(code: number): this {
        if (typeof this.res.status === 'function') {
            this.res.status(code);
        } else {
            this.statusCode = code;
        }
        return this;
    }

    json(data: unknown): Response | void {
        this.setHeader('Content-Type', 'application/json');
        const jsonData = JSON.stringify(data);
        return this.send(jsonData);
    }

    send(body: string | object | Buffer): Response | void {
        if (typeof this.res.send === 'function') {
            return this.res.send(body);
        } else {
            if (typeof body === 'object' && !(body instanceof Buffer)) {
                this.setHeader('Content-Type', 'application/json');
                this.body = JSON.stringify(body);
            } else {
                this.body = body.toString();
            }

            return new Response(this.body, {
                status: this.statusCode,
                headers: this.headers,
            });
        }
    }

    end(body?: string | Buffer): Response | NextApiResponse | void {
        if (typeof this.res.end === 'function') {
            return this.res.end(body);
        } else {
            return this.send(body ?? '');
        }
    }

    redirect(url: string): Response | NextApiResponse | void {
        if (typeof this.res.redirect === 'function') {
            return this.res.redirect(url);
        } else {
            this.status(302);
            this.setHeader('Location', url);
            return this.end(`Redirecting to ${url}`);
        }
    }

    get writableEnded(): boolean {
        return typeof this.res.writableEnded !== 'undefined' ? this.res.writableEnded : false;
    }
}

class CustomRequestWrapper {
    private req: NextApiRequest;

    public method: string;
    public url: string;
    public headers: IncomingHttpHeaders;
    public query: Partial<{ [key: string]: string | string[] }>;
    public body: any;
    public params: Record<string, string>;

    constructor(req: NextApiRequest) {
        this.req = req;
        this.method = req.method || '';
        this.url = req.url || '';
        this.headers = req.headers;
        this.query = req.query;
        this.body = req.body;
        this.params = {}; // params are usually set by a router, so initializing as empty
    }

    get(field: string): string | undefined {
        const headerName = field.toLowerCase();
        return this.headers[headerName] as string | undefined;
    }

    is(type: string): boolean {
        const contentType = this.headers['content-type'];
        if (!contentType) return false;
        return contentType.includes(type);
    }

    param(name: string, defaultValue?: string): string | undefined {
        if (this.params[name]) {
            return this.params[name];
        }
        return defaultValue;
    }
}


export default async function superTokens(rawReq: NextApiRequest, rawRes: NextApiResponse): Promise<void | Response> {
    const res = new CustomResponseWrapper(rawRes);
    const req = new CustomRequestWrapper(rawReq);

    await superTokensNextWrapper(
        async (next) => {
            res.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
            await middleware()(req as any, res as any, next);
        },
        req,
        res as any
    );

    if (!res.writableEnded) {
        return res.status(404).send("Not found");
    }
}
