const http = require('http');

const server = http.createServer((req, res) => {
    console.log('request from client ');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(
        `<html maaa=a>
        <head>
            <style>
                #main{
                    display: flex;
                    flex-direction: row;
                    width: 500px;
                    background-color: #fff;
                }
                #one {
                    width: 200px;
                    height: 40px;
                    background-color: rgb(100,0,0)
                }
                #two{
                    width: 300px;
                    height: 100px;
                    background-color: rgb(0,100,0);
                }
                #three{
                    width: 50px;
                    height: 40px;
                    background-color: rgb(0,0,100);
                }
            </style>
        </head>
        <body>
            <div id="main">
                <div id="one"></div>
                <div id="two"></div>
                <div id="three"></div>
            </div>
        </body>
        </html>`
    );
});

server.listen(8088);