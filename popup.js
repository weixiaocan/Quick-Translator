// 监听来自background script的翻译结果
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'translationResult') {
        document.getElementById('original').textContent = message.original;
        document.getElementById('translation').textContent = message.translation;
    }
});

// 页面加载时请求最新的翻译结果
window.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: 'getLatestTranslation' });
});
