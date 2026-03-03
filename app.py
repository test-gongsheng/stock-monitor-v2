#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
股票投资监控系统 v2.0 - Flask后端
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
import random

app = Flask(__name__, 
    template_folder='templates',
    static_folder='static'
)
CORS(app)

# 数据存储路径
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
STOCKS_FILE = os.path.join(DATA_DIR, 'data', 'stocks.json')
CONFIG_FILE = os.path.join(DATA_DIR, 'data', 'config.json')

# 确保数据目录存在
os.makedirs(os.path.join(DATA_DIR, 'data'), exist_ok=True)

# 默认配置
DEFAULT_CONFIG = {
    'total_assets': 8000000,  # 800万
    'a_stock_limit': 500000,   # A股50万
    'hk_stock_limit': 1500000, # 港股150万
    'default_strategy': {
        'base_ratio': 50,
        'float_ratio': 50,
        'trigger_threshold': 8,
        'adjust_ratio': 20
    }
}

# 模拟股票数据（实际应从行情API获取）
MOCK_STOCKS = [
    {
        'code': '09988.HK',
        'name': '阿里巴巴-W',
        'market': '港股',
        'price': 110.50,
        'change': 5.20,
        'change_percent': 4.94,
        'invest_limit': 1000000,
        'hold_quantity': 8000,
        'hold_cost': 87.50,
        'strategy': '进阶',
        'pivot_price': 95.00,
        'base_ratio': 60,
        'float_ratio': 40,
        'trigger_buy': 83.12,
        'trigger_sell': 94.50
    },
    {
        'code': '000001.SZ',
        'name': '平安银行',
        'market': 'A股',
        'price': 12.35,
        'change': -0.15,
        'change_percent': -1.20,
        'invest_limit': 500000,
        'hold_quantity': 20000,
        'hold_cost': 11.80,
        'strategy': '基础',
        'pivot_price': 12.00,
        'base_ratio': 50,
        'float_ratio': 50,
        'trigger_buy': 11.04,
        'trigger_sell': 12.96
    }
]

def load_stocks():
    """加载股票数据"""
    if os.path.exists(STOCKS_FILE):
        with open(STOCKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return MOCK_STOCKS

def save_stocks(stocks):
    """保存股票数据"""
    with open(STOCKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(stocks, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    """获取所有股票"""
    stocks = load_stocks()
    return jsonify({'success': True, 'data': stocks})

@app.route('/api/sectors', methods=['GET'])
def get_sectors():
    """获取热点板块"""
    sectors = [
        {'name': '半导体', 'change': 3.2},
        {'name': '黄金', 'change': 2.8},
        {'name': 'AI人工智能', 'change': 2.5},
        {'name': '新能源', 'change': 1.9},
        {'name': '稀土', 'change': 1.5}
    ]
    return jsonify({'success': True, 'data': sectors})

@app.route('/api/news', methods=['GET'])
def get_news():
    """获取新闻"""
    news = [
        {'time': '10:30', 'title': '阿里巴巴财报超预期，云业务增长34%', 'tag': 'important'},
        {'time': '10:15', 'title': '美联储3月议息会议在即，黄金价格上涨', 'tag': 'normal'},
        {'time': '09:45', 'title': '半导体板块资金净流入超50亿', 'tag': 'normal'}
    ]
    return jsonify({'success': True, 'data': news})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
