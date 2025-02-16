console.log('Translation extension loaded');

// 发送初始化消息
chrome.runtime.sendMessage({ action: 'contentScriptReady' });

// 确保扩展已经准备好
let extensionReady = false;
let translateButton = null;
let selectedText = '';
let resultBox = null;
let selectedRange = null;
let lastScrollTop = window.scrollY;
let lastScrollLeft = window.scrollX;
let isUpdatingPosition = false;

// 初始化函数
function initialize() {
    console.log('Initializing translation extension');
    
    // 使用mouseup事件来处理选中文本
    document.addEventListener('mouseup', handleMouseUp);
    
    // 添加滚动监听
    window.addEventListener('scroll', function() {
        if (selectedRange) {
            requestAnimationFrame(() => {
                updateTranslateButtonPosition();
            });
        }
    });
    
    // 添加窗口大小改变监听
    window.addEventListener('resize', function() {
        if (selectedRange) {
            requestAnimationFrame(() => {
                updateTranslateButtonPosition();
            });
        }
    });
}

// 立即初始化
initialize();

// 处理滚动事件
function handleScroll(e) {
    if (isUpdatingPosition) return;
    
    requestAnimationFrame(() => {
        if (selectedRange && (translateButton || resultBox)) {
            const deltaY = window.scrollY - lastScrollTop;
            const deltaX = window.scrollX - lastScrollLeft;
            
            if (deltaX !== 0 || deltaY !== 0) {
                if (translateButton) {
                    const buttonLeft = parseFloat(translateButton.style.left);
                    const buttonTop = parseFloat(translateButton.style.top);
                    translateButton.style.left = `${buttonLeft - deltaX}px`;
                    translateButton.style.top = `${buttonTop - deltaY}px`;
                }
                
                if (resultBox && resultBox.style.display === 'block') {
                    const boxLeft = parseFloat(resultBox.style.left);
                    const boxTop = parseFloat(resultBox.style.top);
                    resultBox.style.left = `${boxLeft - deltaX}px`;
                    resultBox.style.top = `${boxTop - deltaY}px`;
                }
            }
        }
        
        lastScrollTop = window.scrollY;
        lastScrollLeft = window.scrollX;
    });
}

// 处理窗口大小改变
function handleResize() {
    if (selectedRange) {
        updateTranslateButtonPosition();
    }
}

// 检测文本是否包含英文
function containsEnglish(text) {
    return /[a-zA-Z]/.test(text);
}

// 处理鼠标释放事件
function handleMouseUp(e) {
    // 如果点击的是翻译按钮或结果框，不处理
    if (e.target.closest('#quick-translate-button') || 
        e.target.closest('#translation-result-box')) {
        return;
    }

    // 获取选中的文本
    const selection = window.getSelection();
    selectedText = selection.toString().trim();

    // 如果有选中的文本并且包含英文
    if (selectedText && containsEnglish(selectedText)) {
        console.log('Selected text:', selectedText);
        selectedRange = selection.getRangeAt(0).cloneRange();
        updateTranslateButtonPosition();
    } else {
        // 如果没有选中英文文本，并且点击的不是翻译UI，则隐藏它们
        if (!isClickingTranslateUI()) {
            hideTranslateButton();
            hideTranslationResult();
            selectedRange = null;
        }
    }
}

// 更新翻译按钮位置
function updateTranslateButtonPosition() {
    if (!selectedRange) return;

    try {
        const rect = selectedRange.getBoundingClientRect();
        console.log('Selection rect:', rect);

        // 确保选区有效
        if (rect.width === 0 && rect.height === 0) {
            console.log('Invalid selection rect');
            return;
        }

        const buttonX = rect.right + window.scrollX + 5;
        const buttonY = rect.top + window.scrollY - 5;

        showTranslateButton(buttonX, buttonY);

        // 如果结果框可见，也更新它的位置
        if (resultBox && resultBox.style.display === 'block') {
            updateTranslationResultPosition();
        }

        // 更新最后的滚动位置
        lastScrollTop = window.scrollY;
        lastScrollLeft = window.scrollX;
    } catch (error) {
        console.error('Error updating button position:', error);
    }
}

// 更新翻译结果框位置
function updateTranslationResultPosition() {
    if (!translateButton || !resultBox) return;

    try {
        const buttonRect = translateButton.getBoundingClientRect();
        const x = buttonRect.right + window.scrollX + 10;
        const y = buttonRect.top + window.scrollY;
        
        // 确保结果框在视窗内
        const boxWidth = 300;
        const windowWidth = window.innerWidth;
        const maxX = windowWidth - boxWidth - 20 + window.scrollX;
        
        resultBox.style.left = `${Math.min(x, maxX)}px`;
        resultBox.style.top = `${y}px`;
    } catch (error) {
        console.error('Error updating result box position:', error);
    }
}

// 检查是否点击在翻译UI上
function isClickingTranslateUI() {
    return (
        document.querySelector('#quick-translate-button:hover') ||
        document.querySelector('#translation-result-box:hover')
    );
}

// 创建翻译按钮
function createTranslateButton() {
    const button = document.createElement('div');
    button.id = 'quick-translate-button';
    button.textContent = '译';
    
    button.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (selectedText) {
            try {
                console.log('Clicked translate button for text:', selectedText);
                await sendTranslationRequest(selectedText);
            } catch (error) {
                console.error('Error sending translation request:', error);
                showTranslationResult(selectedText, '翻译请求失败，请刷新页面后重试');
            }
        }
    });
    
    document.body.appendChild(button);
    return button;
}

// 显示翻译按钮
function showTranslateButton(x, y) {
    try {
        if (!translateButton) {
            translateButton = createTranslateButton();
        }
        
        translateButton.style.left = `${x}px`;
        translateButton.style.top = `${y}px`;
        translateButton.style.display = 'flex';
        console.log('Showing translate button at:', { x, y });
    } catch (error) {
        console.error('Error showing translate button:', error);
    }
}

// 隐藏翻译按钮
function hideTranslateButton() {
    if (translateButton) {
        translateButton.style.display = 'none';
    }
}

// 显示翻译结果
function showTranslationResult(original, translation) {
    try {
        if (!resultBox) {
            resultBox = document.createElement('div');
            resultBox.id = 'translation-result-box';
            resultBox.style.position = 'absolute';
            document.body.appendChild(resultBox);
        }

        // 转义 HTML 特殊字符
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        resultBox.innerHTML = `
            <div class="translation-content">
                <div class="translation-original">${escapeHtml(original)}</div>
                <div class="translation-result">${escapeHtml(translation)}</div>
            </div>
        `;

        // 先显示结果框以获取实际内容高度
        resultBox.style.display = 'block';
        
        // 调整位置
        updateTranslationResultPosition();
        
        // 确保结果框在视口内可见
        const boxRect = resultBox.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (boxRect.bottom > viewportHeight) {
            const newTop = Math.max(
                10, // 保持至少10px的上边距
                parseFloat(resultBox.style.top) - (boxRect.bottom - viewportHeight) - 20
            );
            resultBox.style.top = `${newTop}px`;
        }

        // 添加点击事件监听器，点击外部时隐藏结果框
        const handleClickOutside = (event) => {
            if (!resultBox.contains(event.target) && !translateButton.contains(event.target)) {
                hideTranslationResult();
                document.removeEventListener('click', handleClickOutside);
            }
        };
        
        // 延迟添加点击监听器，避免立即触发
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

    } catch (error) {
        console.error('Error showing translation result:', error);
    }
}

// 隐藏翻译结果
function hideTranslationResult() {
    if (resultBox) {
        resultBox.style.display = 'none';
    }
}

// 发送翻译请求
async function sendTranslationRequest(text) {
    console.log('Sending translation request for:', text);
    try {
        await chrome.runtime.sendMessage({
            action: 'translate',
            text: text
        });
        console.log('Translation request sent successfully');
    } catch (error) {
        console.error('Error sending translation request:', error);
        showTranslationResult(text, '翻译请求失败，请刷新页面后重试');
    }
}

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message in content script:', message);
    
    if (message.action === 'translationResult') {
        console.log('Showing translation result:', message);
        showTranslationResult(message.original, message.translation);
    } else if (message.action === 'translationError') {
        console.log('Showing translation error:', message);
        showTranslationResult(selectedText, `翻译出错: ${message.error}`);
    }
});

// 添加样式
const style = document.createElement('style');
style.textContent = `
#quick-translate-button {
    display: none;
    position: absolute;
    background: #4285f4;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    user-select: none;
}

#quick-translate-button:hover {
    background: #1a73e8;
}

#translation-result-box {
    display: none;
    position: absolute;
    background: white;
    border-radius: 8px;
    padding: 12px;
    width: 300px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 999999;
    font-size: 14px;
    line-height: 1.5;
}

#translation-result-box .translation-content {
    margin-bottom: 12px;
}

#translation-result-box .translation-original {
    color: #666;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
}

#translation-result-box .translation-result {
    color: #333;
}
`;
document.head.appendChild(style);
