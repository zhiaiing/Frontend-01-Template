const net = require("net");

class Request {
    constructor(options) {
        this.method = options.method || "GET";
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || "/";
        this.headers = options.headers || {};
        this.body = options.body || {};

        if (!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        if (this.headers["Content-Type"] === "application/json") {
            this.bodyText = JSON.stringify(this.body);
        } else if ( this.headers["Content-Type"] === "application/x-www-form-urlencoded") {
            this.bodyText = Object.keys(this.body).map((key) => {
                return `${key}=${encodeURIComponent(this.body[key])}`
            }).join('&')
        }
        this.headers["Content-Length"] = this.bodyText.length;
    }

    toString() {
        if (!this.path) {
            throw new Error('path 参数缺数');
        }
        return  [
                    `${this.method} ${this.path} HTTP/1.1`,
                    `${Object.keys(this.headers)
                    .map((key) => `${key}: ${this.headers[key]}`)
                    .join('\r\n')}`,
                    '',
                    `${this.bodyContent}`,
                ].join('\r\n');
    }

    send(connection) {
        console.log('start send request ');
        return new Promise((resolve, reject) => {
            if (connection) {
                console.log(this.toString());
                connection.write(this.toString());
            } else {
                console.log(this);
                connection = net.createConnection({
                        host: this.host,
                        port: this.port,
                    },
                    () => {
                        console.log('start write request header');
                        console.log(this.toString());
                        connection.write(this.toString());
                    }
                );
                connection.on("data", (data) => {
                    const parser = new ResponseParser();
                    parser.receive(data.toString());
                    if (parser.isFinished) {
                        console.log(parser.response);
                    }
                    connection.end();
                });
                connection.on("error", (err) => {
                    console.log('error == ', err);
                    reject(err);
                });
                connection.on("end", () => {
                    console.log("已从服务器断开");
                });
            }
        });
    }
}

class ResponseHeaderParser {
    constructor() {
        let n = 0; 
        this.WAITING_STATUS_LINE_START = n++;
        this.WAITING_STATUS_LINE_NED = n++;
        this.WAITING_PARSE_HEADER_KEY_START = n++;
        this.WAITING_PARSE_HEADER_KEY_END = n++;
        this.WAITING_PARSE_HEADER_VALUE_START = n++;
        this.WAITING_PARSE_HEADER_VALUE_END = n++;
        this.WAITING_HEADER_BLOCK_END = n++;

        this.WAITING_PARSE_BODY_START = n++;

        this.current = this.WAITING_STATUS_LINE_START;
        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
    }

    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE_START) {
            if (char === '\r'){
                this.current = this.WAITING_STATUS_LINE_NED;
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_NED) {
            if (char === '\n'){
                this.current = this.WAITING_PARSE_HEADER_KEY_START;
            }
        } else if (this.current === this.WAITING_PARSE_HEADER_KEY_START) {
            if (char === ':') {
                this.current = this.WAITING_PARSE_HEADER_KEY_END;
            } else if (char === '\r'){
                this.current = this.WAITING_HEADER_BLOCK_END;
            } else {
                this.headerName += char;
            }
        } else if (this.current === this.WAITING_PARSE_HEADER_KEY_END) {
            if (char === ' ') {
                this.current = this.WAITING_PARSE_HEADER_VALUE_START;
            } 
        } else if (this.current === this.WAITING_PARSE_HEADER_VALUE_START) {
            if (char === '\r') {
                this.current = this.WAITING_PARSE_HEADER_VALUE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            } else {
                this.headerValue += char;
            }
        } else if (this.current === this.WAITING_PARSE_HEADER_VALUE_END) {
            if (char === '\n') {
                this.current = this.WAITING_PARSE_HEADER_KEY_START;
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_PARSE_BODY_START;
                return 1;
            }
        }
        return 0;
    }
}

class ResponseBodyParser {
    constructor() {
        let n = 0;
        this.WAITING_BODY_LENGTH = n++;
        this.WAITING_BODY_LENGTH_END = n++;
        this.READING_CHUNKED = n++;
        this.READING_CHUNKED_END = n++;
        this.WAITING_NEW_LINE = n++;
        this.WAITING_NEW_LINE_END = n++;

        this.current = this.WAITING_BODY_LENGTH;
        this.content = [];
        this.chunkLength = 0;
        this.isFinished = false;
    }

    receiveChar(char) {
        if (this.current === this.WAITING_BODY_LENGTH) {
            console.log(char);
            if (char === '\r') {
                this.current = this.WAITING_BODY_LENGTH_END;
            } else if (char === '0'){
                this.current = this.WAITING_NEW_LINE;
            } else {
                this.chunkLength *= 16;
                this.chunkLength += Number(`0x${char}`);
            }
        } else if (this.current === this.WAITING_BODY_LENGTH_END) {
            if (char === '\n') {
                this.current = this.READING_CHUNKED;
            }
        } else if (this.current === this.READING_CHUNKED) {
            if (char === '\r') {
                this.current = this.READING_CHUNKED_END;
                this.chunkLength = 0
            } else if (this.chunkLength > 0) {
                this.content.push(char);
                this.chunkLength -= 1;
            }
        } else if (this.current === this.READING_CHUNKED_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY_LENGTH;
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\n') {
                this.current = this.WAITING_NEW_LINE_END;
                this.isFinished = true;
                return 2;
            }
        }
        return 1;
    }
}



class ResponseParser {
    constructor() {
        this.WAITING_STATUS_HEADER_PARSER = 0;
        this.WAITING_STATUS_BODY_PARSER = 1;
        this.WAITING_STATUS_PARSER_COMPLETE = 2;

        this.current = this.WAITING_STATUS_HEADER_PARSER;

        this.statusLine = "";
        this.headers = {};
        this.bodyContent = [];

        this.headerParser = new ResponseHeaderParser();
        this.bodyParser = null;
    }

    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response() {
        this.statusLine.match(/^HTTP\/1\.1 ([1-5]\d{2}) (\w+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join(""),
        };
    }

    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }

    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_HEADER_PARSER) {
            this.current = this.headerParser.receiveChar(char);
            this.statusLine = this.headerParser.statusLine;
            this.headers = this.headerParser.headers;
            if (this.current === this.WAITING_STATUS_BODY_PARSER) {
                this.bodyParser = new ResponseBodyParser();
            }
        } else if (this.current === this.WAITING_STATUS_BODY_PARSER) {
            this.current = this.bodyParser.receiveChar(char);
            this.bodyContent = this.bodyParser.content;
        } 
    }
}

// 发送一个请求
void(async function () {
    const request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: 8088,
        headers: {
            "X-Foo2": "customed",
        },
        body: {
            name: "kang",
        },
    });

    await request.send();
})();