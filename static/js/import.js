// 数据导入功能 - 简化版，确保拖拽正常工作
function initDataImport() {
    console.log('初始化数据导入...');
    
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea) {
        console.error('找不到uploadArea元素');
        return;
    }
    
    // 点击上传
    uploadArea.onclick = function(e) {
        if (e.target.tagName !== 'INPUT') {
            fileInput.click();
        }
    };
    
    // 文件选择
    if (fileInput) {
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) processFile(file);
        };
    }
    
    // 拖拽事件 - 使用on属性方式绑定
    uploadArea.ondragenter = function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    };
    
    uploadArea.ondragover = function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };
    
    uploadArea.ondragleave = function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    };
    
    uploadArea.ondrop = function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        console.log('收到文件:', files.length);
        
        if (files.length > 0) {
            processFile(files[0]);
        }
    };
    
    console.log('数据导入初始化完成');
}

// 处理文件
function processFile(file) {
    console.log('处理文件:', file.name);
    
    if (!file.name.endsWith('.txt')) {
        alert('请上传.txt格式的文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        parseAndImport(content);
    };
    reader.readAsText(file, 'GBK');
}

// 解析并导入数据
function parseAndImport(content) {
    const lines = content.split('\n');
    const stocks = [];
    let foundHeader = false;
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        // 找表头
        if (line.includes('证券代码') && line.includes('证券名称')) {
            foundHeader = true;
            continue;
        }
        
        // 解析数据行
        if (foundHeader && /^\d/.test(line)) {
            const parts = line.split(/\s+/);
            if (parts.length >= 10) {
                const stock = {
                    code: parts[0],
                    name: parts[1],
                    shares: parseInt(parts[2]) || 0,
                    costPrice: parseFloat(parts[5]) || 0,
                    currentPrice: parseFloat(parts[6]) || 0,
                    marketValue: parseFloat(parts[7]) || 0,
                    pnl: parseFloat(parts[8]) || 0,
                    exchange: parts[14] || ''
                };
                
                // 判断市场
                stock.market = (stock.exchange.includes('港股') || stock.exchange.includes('沪港通') || stock.code.length === 5) ? '港股' : 'A股';
                
                // 处理异常成本
                if (stock.costPrice <= 0 || stock.costPrice > stock.currentPrice * 10) {
                    stock.costPrice = stock.currentPrice * 0.9;
                }
                
                // 计算中轴价格和触发价
                stock.pivotPrice = stock.costPrice;
                stock.triggerBuy = stock.pivotPrice * 0.92;
                stock.triggerSell = stock.pivotPrice * 1.08;
                stock.investLimit = stock.market === '港股' ? 1500000 : 500000;
                stock.strategy = '基础';
                stock.baseRatio = 50;
                stock.floatRatio = 50;
                
                stocks.push(stock);
            }
        }
    }
    
    if (stocks.length > 0) {
        // 更新到appState
        stocks.forEach(newStock => {
            const idx = appState.stocks.findIndex(s => s.code === newStock.code);
            if (idx >= 0) {
                appState.stocks[idx] = { ...appState.stocks[idx], ...newStock };
            } else {
                appState.stocks.push(newStock);
            }
        });
        
        renderStockList();
        updateAssetOverview();
        
        alert(`成功导入 ${stocks.length} 只股票！`);
        hideDataImportModal();
    } else {
        alert('未能解析到股票数据');
    }
}

// 显示/隐藏弹窗
function showDataImportModal() {
    const modal = document.getElementById('dataImportModal');
    if (modal) modal.classList.add('active');
}

function hideDataImportModal() {
    const modal = document.getElementById('dataImportModal');
    if (modal) modal.classList.remove('active');
}

function showAnalysisModal() {
    analyzeData();
}

// 清空文件
function clearFile() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
}

// 切换标签
function switchImportTab(tabName) {
    document.querySelectorAll('.import-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.import-content').forEach(content => {
        content.classList.remove('active');
    });
    const target = document.getElementById(tabName + 'Tab');
    if (target) target.classList.add('active');
}

// 全局导出
window.showDataImportModal = showDataImportModal;
window.hideDataImportModal = hideDataImportModal;
window.showAnalysisModal = showAnalysisModal;
window.clearFile = clearFile;
window.switchImportTab = switchImportTab;
