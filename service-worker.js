// 百度翻译API配置
const BAIDU_APP_ID = '###############';//输入你的百度翻译平台APP ID
const BAIDU_KEY = '#############';//输入你的百度翻译平台密钥
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'translate-selection',
        title: '翻译选中文本',
        contexts: ['selection']
    });
});

// MD5加密函数
function md5(str) {
    const hexcase = 0;
    const chrsz = 8;

    function core_md5(x, len) {
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        let a = 1732584193;
        let b = -271733879;
        let c = -1732584194;
        let d = 271733878;

        for (let i = 0; i < x.length; i += 16) {
            const olda = a;
            const oldb = b;
            const oldc = c;
            const oldd = d;

            a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }

    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function safe_add(x, y) {
        const lsw = (x & 0xFFFF) + (y & 0xFFFF);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    function str2binl(str) {
        const bin = [];
        const mask = (1 << chrsz) - 1;
        for (let i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
        }
        return bin;
    }

    function binl2hex(binarray) {
        const hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        let str = "";
        for (let i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                   hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
        }
        return str;
    }

    return binl2hex(core_md5(str2binl(str), str.length * chrsz));
}

// 调用百度翻译API
async function translateText(text) {
    try {
        // 预处理文本：去除首尾空格，将多个空格替换为单个空格
        text = text.trim().replace(/\s+/g, ' ');
        
        // 如果文本为空，直接返回
        if (!text) {
            return '请选择要翻译的文本';
        }

        console.log('Translating text:', text);
        
        // 生成签名
        const salt = Date.now().toString();
        const signStr = BAIDU_APP_ID + text + salt + BAIDU_KEY;
        console.log('Sign string:', signStr);
        const sign = md5(signStr);
        console.log('Generated sign:', sign);
        
        // 构建请求参数
        const params = new URLSearchParams();
        params.append('q', text);
        params.append('from', 'en');
        params.append('to', 'zh');
        params.append('appid', BAIDU_APP_ID);
        params.append('salt', salt);
        params.append('sign', sign);

        console.log('Request parameters:', params.toString());

        // 发送请求
        const response = await fetch(BAIDU_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Translation response:', data);

        if (data.error_code) {
            throw new Error(`API error ${data.error_code}: ${data.error_msg}`);
        }

        if (data.trans_result && data.trans_result[0]) {
            return data.trans_result[0].dst;
        } else {
            throw new Error('No translation result in response');
        }
    } catch (error) {
        console.error('Translation error:', error);
        return `翻译出错: ${error.message}`;
    }
}

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'translate-selection' && info.selectionText) {
        const translation = await translateText(info.selectionText);
        try {
            // 确保content script已经加载
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => true
            });
            
            // 发送消息到content script
            chrome.tabs.sendMessage(tab.id, {
                action: 'translationResult',
                original: info.selectionText,
                translation: translation
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    // 如果发送失败，尝试重新注入content script
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    }).then(() => {
                        // 重新发送消息
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'translationResult',
                            original: info.selectionText,
                            translation: translation
                        });
                    });
                }
            });
        } catch (error) {
            console.error('Error in translation process:', error);
        }
    }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'translate') {
        translateText(message.text)
            .then(async translation => {
                try {
                    if (sender.tab?.id) {
                        // 确保content script已经加载
                        await chrome.scripting.executeScript({
                            target: { tabId: sender.tab.id },
                            func: () => true
                        });
                        
                        // 发送消息到content script
                        chrome.tabs.sendMessage(sender.tab.id, {
                            action: 'translationResult',
                            original: message.text,
                            translation: translation
                        }).catch(error => {
                            console.error('Error sending translation result:', error);
                            // 如果发送失败，尝试重新注入content script
                            return chrome.scripting.executeScript({
                                target: { tabId: sender.tab.id },
                                files: ['content.js']
                            }).then(() => {
                                // 重新发送消息
                                return chrome.tabs.sendMessage(sender.tab.id, {
                                    action: 'translationResult',
                                    original: message.text,
                                    translation: translation
                                });
                            });
                        });
                    }
                } catch (error) {
                    console.error('Error in translation process:', error);
                    // 尝试通过sendResponse返回错误
                    if (sendResponse) {
                        sendResponse({ error: error.message });
                    }
                }
            })
            .catch(error => {
                console.error('Translation error:', error);
                // 尝试通过sendResponse返回错误
                if (sendResponse) {
                    sendResponse({ error: error.message });
                }
            });
        return true; // 表示会异步发送响应
    } else if (message.action === 'contentScriptReady') {
        // Content script 准备就绪的消息
        sendResponse({ status: 'acknowledged' });
        return true;
    }
});
