#!/usr/bin/env node
// 注意：必须添加 shebang（#!/usr/bin/env node）才能通过 npx 执行

function detectEnvironment() {
    const isElectron = () => {
        return (
            (typeof process !== 'undefined' && !!process.versions?.electron) ||
            (typeof window !== 'undefined' && window?.process?.type === 'renderer')
        );
    };

    if (isElectron()) {
        try {
            require('electron');
            return { isElectron: true, env: 'main' };
        } catch (e) {
            return { isElectron: true, env: 'renderer' };
        }
    } else {
        return { isElectron: false, env: 'node' };
    }
}

// 执行检测并输出结果
const { isElectron, env } = detectEnvironment();
console.log(
    isElectron
        ? `当前环境: Electron (${env === 'main' ? '主进程' : '渲染进程'})`
        : '当前环境: Node.js'
);
