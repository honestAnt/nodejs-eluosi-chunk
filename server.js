const http = require('http');
const fs = require('fs');
const path = require('path');

// 端口配置
const PORT = process.env.PORT || 3000;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 解析URL
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // 防止目录遍历攻击
    filePath = path.normalize(filePath);
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }
    
    // 构建完整文件路径
    const fullPath = path.join(__dirname, filePath);
    
    // 获取文件扩展名
    const extname = path.extname(fullPath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 404 页面
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="zh-CN">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>404 - 页面未找到</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                padding: 50px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                margin: 0;
                                height: 100vh;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                            }
                            h1 { font-size: 4em; margin-bottom: 20px; }
                            p { font-size: 1.2em; margin-bottom: 30px; }
                            a { 
                                color: #FFD700; 
                                text-decoration: none; 
                                font-weight: bold;
                                border: 2px solid #FFD700;
                                padding: 10px 20px;
                                border-radius: 5px;
                                transition: all 0.3s ease;
                            }
                            a:hover {
                                background: #FFD700;
                                color: #764ba2;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>404</h1>
                        <p>哎呀！页面不见了...</p>
                        <a href="/">返回俄罗斯方块游戏</a>
                    </body>
                    </html>
                `);
            } else {
                // 500 服务器错误
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            // 成功返回文件
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(data);
        }
    });
});

// 启动服务器
server.listen(PORT, () => {
    console.log('🎮 俄罗斯方块游戏服务器启动成功！');
    console.log(`📍 本地访问: http://localhost:${PORT}`);
    console.log(`🌐 网络访问: http://127.0.0.1:${PORT}`);
    console.log('⏹️  按 Ctrl+C 停止服务器');
    console.log('═'.repeat(50));
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('\n🛑 收到关闭信号，正在优雅关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 收到中断信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});