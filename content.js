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
    if (!extensionReady) {
        extensionReady = true;
        console.log('Translation extension initialized');
        // 使用mouseup事件来处理选中文本
        document.addEventListener('mouseup', handleMouseUp);
        // 添加滚动监听
        window.addEventListener('scroll', handleScroll, { passive: true });
        // 添加调整大小监听
        window.addEventListener('resize', handleResize, { passive: true });
    }
}

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

// 处理鼠标释放事件
function handleMouseUp(e) {
    // 如果点击的是翻译按钮或结果框，不处理
    if (e.target.closest('#quick-translate-button') || 
        e.target.closest('#translation-result-box')) {
        return;
    }

    const selection = window.getSelection();
    selectedText = selection.toString().trim().replace(/\s+/g, ' ');

    if (selectedText && /[a-zA-Z]/.test(selectedText)) {
        selectedRange = selection.getRangeAt(0).cloneRange();  // 克隆范围以保持引用
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
    if (selectedRange) {
        isUpdatingPosition = true;
        const rect = selectedRange.getBoundingClientRect();
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
        isUpdatingPosition = false;
    }
}

// 更新翻译结果框位置
function updateTranslationResultPosition() {
    if (translateButton && resultBox) {
        const buttonRect = translateButton.getBoundingClientRect();
        const x = buttonRect.right + window.scrollX + 10;
        const y = buttonRect.top + window.scrollY;
        
        // 确保结果框在视窗内
        const boxWidth = 300;
        const windowWidth = window.innerWidth;
        const maxX = windowWidth - boxWidth - 20 + window.scrollX;
        
        resultBox.style.left = `${Math.min(x, maxX)}px`;
        resultBox.style.top = `${y}px`;
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
                selectedText = selectedText.trim().replace(/\s+/g, ' ');
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
        
        translateButton.style.position = 'absolute';
        translateButton.style.left = `${x}px`;
        translateButton.style.top = `${y}px`;
        translateButton.style.display = 'flex';
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

        resultBox.innerHTML = `
            <div class="translation-content">
                <div class="translation-original">${original}</div>
                <div class="translation-result">${translation}</div>
            </div>
        `;

        // 先显示结果框以获取实际内容高度
        resultBox.style.visibility = 'hidden';
        resultBox.style.display = 'block';
        
        // 获取内容实际高度
        const contentHeight = resultBox.scrollHeight;
        const viewportHeight = window.innerHeight;
        const maxHeight = Math.floor(viewportHeight * 0.8); // 最大高度为视口的80%
        
        // 调整位置
        updateTranslationResultPosition();
        
        // 确保结果框在视口内可见
        const boxRect = resultBox.getBoundingClientRect();
        let newTop = parseFloat(resultBox.style.top);
        
        // 如果内容高度超过最大高度，使用最大高度并显示滚动条
        if (contentHeight > maxHeight) {
            resultBox.style.height = `${maxHeight}px`;
        } else {
            resultBox.style.height = 'auto';
        }
        
        // 如果结果框底部超出视口，向上调整位置
        if (boxRect.bottom > viewportHeight) {
            newTop = Math.max(
                10, // 保持至少10px的上边距
                newTop - (boxRect.bottom - viewportHeight) - 20
            );
            resultBox.style.top = `${newTop}px`;
        }
        
        // 最后显示结果框
        resultBox.style.visibility = 'visible';
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
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'translate',
            text: text
        });
        return response;
    } catch (error) {
        console.error('Translation request failed:', error);
        if (error.message.includes('Extension context invalidated')) {
            extensionReady = false;
            initialize();
            await new Promise(resolve => setTimeout(resolve, 500));
            return sendTranslationRequest(text);
        }
        throw error;
    }
}

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    initialize();
    if (message.action === 'translationResult') {
        showTranslationResult(message.original, message.translation);
        sendResponse({ status: 'success' });
    }
    return true;
});

// 立即初始化
initialize();
