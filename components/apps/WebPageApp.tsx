import React from 'react';

interface WebPageAppProps {
    data: { name: string; html: string; css: string; js: string; };
}

const WebPageApp: React.FC<WebPageAppProps> = ({ data }) => {
    const { html, css, js } = data;

    const srcDoc = `
        <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}</script>
            </body>
        </html>
    `;

    return (
        <iframe
            srcDoc={srcDoc}
            title={data.name}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-none bg-white"
        />
    );
};

export default WebPageApp;