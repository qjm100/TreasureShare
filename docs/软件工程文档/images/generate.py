#!/usr/bin/env python3
"""Generate all 15 diagrams as PNG using matplotlib."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Arc, Wedge, Polygon
import matplotlib.patheffects as pe
import matplotlib.font_manager as fm
import numpy as np
import os
import sys

OUT = os.path.dirname(os.path.abspath(__file__))
DPI = 200

# Register Source Han Sans CN for Chinese support
font_path = '/usr/share/fonts/adobe-source-han-sans/SourceHanSansCN-Regular.otf'
if os.path.exists(font_path):
    fm.fontManager.addfont(font_path)
    prop = fm.FontProperties(fname=font_path)
    font_name = prop.get_name()
    plt.rcParams['font.family'] = font_name
    print(f"Using font: {font_name}")
else:
    plt.rcParams['font.family'] = 'sans-serif'
    print("WARNING: Source Han Sans CN not found, Chinese characters may be missing")

plt.rcParams['font.size'] = 9


def save(name):
    path = os.path.join(OUT, name)
    plt.savefig(path, dpi=DPI, bbox_inches='tight', pad_inches=0.2, facecolor='white')
    plt.close()
    print(f"  ✓ {name}")


def img01_gantt():
    """Gantt chart"""
    tasks = [
        ("需求分析与设计", "2026-03-27", "2026-04-10", "group"),
        ("  需求调研", "2026-03-27", "2026-04-02", "task"),
        ("  需求文档编写", "2026-04-03", "2026-04-10", "task"),
        ("系统设计", "2026-04-11", "2026-04-25", "group"),
        ("  概要设计", "2026-04-11", "2026-04-18", "task"),
        ("  详细设计", "2026-04-19", "2026-04-25", "task"),
        ("编码实现", "2026-04-26", "2026-05-16", "group"),
        ("  后端开发", "2026-04-26", "2026-05-10", "task"),
        ("  前端开发", "2026-05-01", "2026-05-16", "task"),
        ("测试与部署", "2026-05-17", "2026-06-01", "group"),
        ("  单元测试", "2026-05-17", "2026-05-23", "task"),
        ("  集成测试", "2026-05-24", "2026-05-28", "task"),
        ("  部署上线", "2026-05-29", "2026-06-01", "task"),
        ("文档编写", "2026-05-28", "2026-06-06", "group"),
        ("  文档填写", "2026-05-29", "2026-06-04", "task"),
        ("  审核提交", "2026-06-05", "2026-06-06", "task"),
    ]

    import datetime
    start = datetime.date(2026, 3, 27)
    end = datetime.date(2026, 6, 6)
    days_total = (end - start).days

    fig, ax = plt.subplots(figsize=(10, 5.5))
    colors = {'group': '#4472C4', 'task': '#5B9BD5'}

    for i, (name, d1, d2, typ) in enumerate(tasks):
        t1 = datetime.date.fromisoformat(d1)
        t2 = datetime.date.fromisoformat(d2)
        x = (t1 - start).days
        w = (t2 - t1).days
        y = len(tasks) - i - 1
        alpha = 0.85 if typ == 'group' else 0.6
        fc = colors[typ]
        ax.barh(y, w, left=x, height=0.55, color=fc, alpha=alpha, edgecolor='white', linewidth=0.5)
        fontweight = 'bold' if typ == 'group' else 'normal'
        ax.text(-1, y, name, ha='right', va='center', fontsize=8, fontweight=fontweight)

    # Month separators
    months = [
        (datetime.date(2026, 4, 1), "4月"),
        (datetime.date(2026, 5, 1), "5月"),
        (datetime.date(2026, 6, 1), "6月"),
    ]
    for md, label in months:
        x = (md - start).days
        ax.axvline(x, color='gray', linestyle='--', alpha=0.3, linewidth=0.5)
        ax.text(x + 1, len(tasks) + 0.2, label, fontsize=7, color='gray')

    ax.set_xlim(-6, days_total + 2)
    ax.set_ylim(-0.5, len(tasks) + 0.8)
    ax.axis('off')
    ax.set_title("TreasureShare 项目开发甘特图", fontsize=12, fontweight='bold', pad=10)
    save("01-gantt.png")


def img02_function_arch():
    """Functional architecture hierarchy"""
    fig, ax = plt.subplots(figsize=(9, 5.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    def draw_box(ax, x, y, w, h, text, color='#D6E4F0', fontsize=9, bold=False):
        box = FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="round,pad=0.1",
                             facecolor=color, edgecolor='#4472C4', linewidth=1.2)
        ax.add_patch(box)
        fw = 'bold' if bold else 'normal'
        ax.text(x, y, text, ha='center', va='center', fontsize=fontsize, fontweight=fw)

    draw_box(ax, 5, 9, 3.5, 0.8, "TreasureShare 平台", '#4472C4', fontsize=11, bold=True)

    # Level 1
    draw_box(ax, 2.5, 7.2, 3, 0.7, "用户端模块", '#D6E4F0', bold=True)
    draw_box(ax, 5, 7.2, 3, 0.7, "管理端模块", '#D6E4F0', bold=True)
    draw_box(ax, 7.5, 7.2, 3, 0.7, "公共服务模块", '#D6E4F0', bold=True)

    # Level 2 - User
    items_user = ["商品浏览与搜索", "购物车与下单", "订单管理", "消息与聊天", "社区与评价"]
    for i, item in enumerate(items_user):
        draw_box(ax, 2.5, 5.8 - i*0.75, 2.8, 0.5, item, '#E2EFDA', fontsize=7)

    items_admin = ["商品管理", "订单处理", "分类管理", "用户管理", "数据看板"]
    for i, item in enumerate(items_admin):
        draw_box(ax, 5, 5.8 - i*0.75, 2.8, 0.5, item, '#FCE4D6', fontsize=7)

    items_common = ["用户认证", "文件上传", "地址管理", "AI 智能推荐", "权限控制"]
    for i, item in enumerate(items_common):
        draw_box(ax, 7.5, 5.8 - i*0.75, 2.8, 0.5, item, '#D9E2F3', fontsize=7)

    # Lines
    for x in [2.5, 5, 7.5]:
        ax.plot([5, x], [8.6, 7.55], color='#4472C4', linewidth=1.2)

    ax.set_title("系统功能架构图", fontsize=12, fontweight='bold', pad=8)
    save("02-function-arch.png")


def img03_use_case():
    """Use case diagram"""
    fig, ax = plt.subplots(figsize=(9, 5.5))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # System boundary
    sys_box = FancyBboxPatch((2.5, 1), 8, 8, boxstyle="round,pad=0.2",
                              facecolor='#F2F2F2', edgecolor='gray', linewidth=1.5, linestyle='--')
    ax.add_patch(sys_box)
    ax.text(6.5, 9.2, "TreasureShare 系统", ha='center', fontsize=10, fontweight='bold')

    # Actors
    for x, label in [(1, "租客"), (1, "物主"), (1, "管理员")]:
        pass

    def actor(ax, x, y, label):
        ax.plot(x, y+1, marker='o', markersize=5, color='#4472C4')
        ax.plot([x, x], [y+0.6, y], color='#4472C4', linewidth=1.2)
        ax.plot([x-0.15, x, x+0.15], [y+0.3, y, y+0.3], color='#4472C4', linewidth=1.2)
        ax.text(x, y-0.4, label, ha='center', fontsize=8, fontweight='bold')

    def usecase(ax, x, y, label):
        el = mpatches.Ellipse((x, y), 2.2, 0.7, facecolor='#D6E4F0', edgecolor='#4472C4', linewidth=1)
        ax.add_patch(el)
        ax.text(x, y, label, ha='center', va='center', fontsize=7)

    actor(ax, 1.2, 7, "租客")
    actor(ax, 1.2, 4.5, "物主")
    actor(ax, 1.2, 2, "管理员")

    usecase(ax, 4.5, 7.5, "浏览商品")
    usecase(ax, 7, 7.5, "搜索商品")
    usecase(ax, 5.5, 6.2, "租赁下单")
    usecase(ax, 5.5, 5.2, "支付订单")
    usecase(ax, 4.5, 4, "即时聊天")

    usecase(ax, 4.5, 3, "发布商品")
    usecase(ax, 7, 3, "管理出租")

    usecase(ax, 4.5, 2, "用户管理")
    usecase(ax, 7, 2, "订单处理")
    usecase(ax, 5.5, 1.3, "数据看板")

    # Connection lines
    for y in [7.5, 6.2, 5.2, 4]:
        ax.plot([1.6, 3.4], [7, y], color='#4472C4', linewidth=0.8)
    for y in [3, 3]:
        ax.plot([1.6, 3.4], [4.5, y], color='#4472C4', linewidth=0.8)
    for y in [2, 1.3, 2]:
        ax.plot([1.6, 3.4], [2, y], color='#4472C4', linewidth=0.8)

    ax.set_title("用户用例图", fontsize=12, fontweight='bold', pad=8)
    save("03-use-case.png")


def img04_dfd():
    """Data flow diagram"""
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)
    ax.axis('off')

    def circle(ax, x, y, r, label):
        c = plt.Circle((x, y), r, facecolor='#D6E4F0', edgecolor='#4472C4', linewidth=1.5)
        ax.add_patch(c)
        ax.text(x, y, label, ha='center', va='center', fontsize=8, fontweight='bold')

    def rect(ax, x, y, w, h, label):
        box = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.05",
                              facecolor='#E2EFDA', edgecolor='#70AD47', linewidth=1.2)
        ax.add_patch(box)
        ax.text(x, y, label, ha='center', va='center', fontsize=8)

    def ds(ax, x, y, w, h, label):
        box = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.05",
                              facecolor='#FCE4D6', edgecolor='#ED7D31', linewidth=1.2)
        ax.add_patch(box)
        ax.plot([x-w/2, x+w/2], [y, y], color='#ED7D31', linewidth=0.5)
        ax.text(x, y+0.15, label, ha='center', va='center', fontsize=7)

    rect(ax, 1.5, 5.5, 2.2, 0.8, "用户（租客/物主）")
    rect(ax, 8.5, 5.5, 2.2, 0.8, "管理员")

    circle(ax, 5, 3.5, 1.2, "TreasureShare\n玩具租赁系统")

    ds(ax, 2.5, 1.2, 2, 0.7, "用户数据")
    ds(ax, 5, 1.2, 2, 0.7, "商品数据")
    ds(ax, 7.5, 1.2, 2, 0.7, "订单数据")

    # Arrows
    ax.annotate("", xy=(4.0, 4.3), xytext=(2.2, 5.2), arrowprops=dict(arrowstyle="->", color='#4472C4', lw=1.5))
    ax.text(2.8, 5.0, "浏览/下单/聊天", fontsize=6, color='#4472C4')
    ax.annotate("", xy=(2.2, 5.5), xytext=(3.9, 4.0), arrowprops=dict(arrowstyle="->", color='gray', lw=1.2))
    ax.text(2.5, 4.8, "商品列表/消息", fontsize=6, color='gray')

    ax.annotate("", xy=(6.0, 4.3), xytext=(7.8, 5.2), arrowprops=dict(arrowstyle="->", color='#4472C4', lw=1.5))
    ax.text(6.8, 5.0, "管理/查看", fontsize=6, color='#4472C4')
    ax.annotate("", xy=(7.8, 5.5), xytext=(6.1, 4.0), arrowprops=dict(arrowstyle="->", color='gray', lw=1.2))

    for dsx, dsy in [(2.5, 1.6), (5, 1.6), (7.5, 1.6)]:
        ax.annotate("", xy=(dsx, 1.6), xytext=(5, 2.6), arrowprops=dict(arrowstyle="->", color='#ED7D31', lw=0.8))
        ax.annotate("", xy=(5, 2.6), xytext=(dsx, 1.6), arrowprops=dict(arrowstyle="->", color='#ED7D31', lw=0.8))

    ax.set_title("顶层数据流图 (DFD)", fontsize=12, fontweight='bold', pad=8)
    save("04-dfd.png")


def img05_flowchart():
    """Process flowchart"""
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 14)
    ax.axis('off')

    def process_box(x, y, w, h, text, color='#D6E4F0', shape='rect'):
        if shape == 'diamond':
            diamond = np.array([[x, y+h/2], [x+w/2, y+h], [x+w, y+h/2], [x+w/2, y]])
            ax.fill(diamond[:, 0], diamond[:, 1], facecolor=color, edgecolor='#4472C4', linewidth=1.2)
        else:
            box = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.1",
                                  facecolor=color, edgecolor='#4472C4', linewidth=1.2)
            ax.add_patch(box)
        ax.text(x, y+h/2, text, ha='center', va='center', fontsize=7)

    def arrow(x1, y1, x2, y2):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1), arrowprops=dict(arrowstyle="->", color='#4472C4', lw=1.2))

    # Start
    process_box(5, 12.5, 2.5, 0.7, "用户访问平台", '#FCE4D6')
    arrow(5, 12.5, 5, 11.5)
    process_box(5, 11, 2.8, 0.7, "浏览/搜索商品")
    arrow(5, 11, 5, 10)

    # Auth decision
    process_box(5, 9.5, 2, 0.8, "需要登录？", '#FFF2CC', 'diamond')
    arrow(5, 9.5, 2.2, 9.5)
    process_box(1, 9.5, 1.8, 0.7, "用户登录\nJWT认证", '#D6E4F0')
    arrow(5, 9.1, 5, 8.3)
    ax.text(5, 8.9, "否", fontsize=7, ha='center', va='top')

    process_box(5, 7.8, 2.8, 0.7, "选择商品加入购物车")
    arrow(5, 7.8, 5, 6.8)
    process_box(5, 6.3, 2, 0.8, "确认下单？", '#FFF2CC', 'diamond')
    arrow(5, 6.3, 5, 5.3)
    ax.text(5.5, 5.8, "是", fontsize=7)

    process_box(5, 4.8, 2.5, 0.7, "创建订单并支付")
    arrow(5, 4.8, 5, 3.8)
    process_box(5, 3.3, 2, 0.7, "物主发货")
    arrow(5, 3.3, 5, 2.3)
    process_box(5, 1.8, 2.5, 0.7, "租客收货确认")
    arrow(5, 1.8, 5, 0.8)
    process_box(5, 0.3, 2, 0.7, "归还验收/评价", '#E2EFDA')

    ax.set_title("系统处理流程图", fontsize=12, fontweight='bold', pad=8)
    save("05-flowchart.png")


def img06_module_structure():
    """Module structure hierarchy"""
    fig, ax = plt.subplots(figsize=(9, 6))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    def box(ax, x, y, w, h, text, color='#D6E4F0', fs=8, bold=False):
        b = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.08",
                            facecolor=color, edgecolor='#4472C4', linewidth=1.2)
        ax.add_patch(b)
        fw = 'bold' if bold else 'normal'
        ax.text(x, y, text, ha='center', va='center', fontsize=fs, fontweight=fw)

    # Root
    box(ax, 5, 9.3, 4.5, 0.7, "TreasureShare 玩具租赁平台", '#4472C4', fs=10, bold=True)

    # Layer 1
    box(ax, 2.5, 7.8, 3.5, 0.7, "前端层", '#FFF2CC', bold=True)
    box(ax, 7.5, 7.8, 3.5, 0.7, "后端层", '#FFF2CC', bold=True)

    # Frontend
    box(ax, 2.5, 6.5, 3.2, 0.55, "React 用户端", '#E2EFDA', fs=7)
    box(ax, 2.5, 5.7, 3.2, 0.55, "Vue 管理端", '#E2EFDA', fs=7)

    # Backend
    be_modules = ["ruoyi-admin", "ruoyi-framework", "ruoyi-system", "ruoyi-toyrental", "ruoyi-common"]
    for i, m in enumerate(be_modules):
        box(ax, 7.5, 6.5 - i*0.7, 3.2, 0.5, m, '#D9E2F3', fs=7)

    # Infrastructure
    box(ax, 5, 2.2, 4.2, 0.65, "基础设施层", '#FCE4D6', bold=True)
    infra = ["MySQL (ry-vue)", "Redis 缓存", "Druid 连接池"]
    for i, m in enumerate(infra):
        box(ax, 5 - 1.2 + i*1.2, 1.0, 1.6, 0.5, m, '#F8D7DA', fs=6)

    # Lines
    ax.plot([5, 2.5], [8.95, 8.15], color='#4472C4', lw=1)
    ax.plot([5, 7.5], [8.95, 8.15], color='#4472C4', lw=1)
    ax.plot([3.2, 4.2], [2.8, 2.55], color='gray', lw=0.8, ls='--')
    ax.plot([6.8, 5.8], [2.8, 2.55], color='gray', lw=0.8, ls='--')

    ax.set_title("系统模块结构图", fontsize=12, fontweight='bold', pad=8)
    save("06-module-structure.png")


def img07_matrix():
    """Function-module matrix"""
    fig, ax = plt.subplots(figsize=(9, 3))
    ax.axis('off')

    modules = ["Toy\nController", "ToyOrder\nController", "ToyCart\nController",
               "ToyMessage\nController", "ToyCommunity\nController", "ToyEvaluation\nController"]
    functions = ["商品浏览/搜索", "商品CRUD", "购物车操作", "订单创建/管理",
                 "即时消息", "帖子互动", "商品评价"]

    data = [
        [1,0,0,0,0,0],
        [1,0,0,0,0,0],
        [0,0,1,0,0,0],
        [0,1,1,0,0,0],
        [0,0,0,1,0,0],
        [0,0,0,0,1,0],
        [0,0,0,0,0,1],
    ]

    table = ax.table(cellText=[['✓' if c else '' for c in row] for row in data],
                     rowLabels=functions,
                     colLabels=modules,
                     cellLoc='center', rowLoc='center', loc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(7)
    table.scale(1, 1.3)

    for key, cell in table.get_celld().items():
        cell.set_edgecolor('#4472C4')
        cell.get_text().set_fontsize(7)
        if key[0] == 0:
            cell.set_facecolor('#D6E4F0')
            cell.get_text().set_weight('bold')
        elif key[1] == -1:
            cell.set_facecolor('#E2EFDA')
            cell.get_text().set_weight('bold')
        elif key[0] > 0 and key[1] > -1:
            cell.set_facecolor('white')

    ax.set_title("功能-模块矩阵图", fontsize=12, fontweight='bold', pad=8)
    save("07-matrix.png")


def img08_er_diagram():
    """ER diagram"""
    fig, ax = plt.subplots(figsize=(9, 6))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis('off')

    def entity(ax, x, y, w, h, name, color='#D6E4F0'):
        box = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.1",
                              facecolor=color, edgecolor='#4472C4', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y, name, ha='center', va='center', fontsize=9, fontweight='bold')

    def attr(ax, x, y, w, h, text, color='#FFF2CC'):
        box = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.05",
                              facecolor=color, edgecolor='#C5A900', linewidth=1)
        ax.add_patch(box)
        ax.text(x, y, text, ha='center', va='center', fontsize=6)

    def rel(ax, x, y, w, h, text, color='#FCE4D6'):
        diamond = np.array([[x, y+h/2], [x+w/2, y+h], [x+w, y+h/2], [x+w/2, y]])
        ax.fill(diamond[:, 0], diamond[:, 1], facecolor=color, edgecolor='#ED7D31', linewidth=1)
        ax.text(x+w/2, y+h/2, text, ha='center', va='center', fontsize=7)

    # Entities
    entity(ax, 2.5, 6, 2.5, 1.2, "用户\n(user)")
    entity(ax, 9, 6, 2.5, 1.2, "商品\n(product)")
    entity(ax, 9, 2, 2.5, 1.2, "订单\n(order)")
    entity(ax, 2.5, 2, 2.5, 1.2, "购物车\n(cart)")

    # Attributes
    attr(ax, 2.5, 7.3, 3, 0.5, "user_id, username, password, phone")
    attr(ax, 9, 7.3, 3.5, 0.5, "product_id, name, price, rent_price_day")
    attr(ax, 9, 1, 3.5, 0.5, "order_id, status, total_rent, deposit")
    attr(ax, 2.5, 1, 3, 0.5, "cart_id, user_id, product_id, quantity")

    # Relationships
    ax.plot([3.75, 7.75], [6, 6], color='#4472C4', linewidth=1.2)
    ax.text(5.75, 6.2, "1 : n (发布)", fontsize=7, ha='center', color='#4472C4')

    ax.plot([3.75, 7.75], [2.4, 2.4], color='#4472C4', linewidth=1.2)
    ax.text(5.75, 2.6, "1 : 1 (对应)", fontsize=7, ha='center', color='#4472C4')

    ax.plot([2.5, 2.5], [4.8, 3.2], color='#4472C4', linewidth=1.2)
    ax.text(1.6, 4, "1 : n", fontsize=7, ha='center', color='#4472C4')

    ax.plot([9, 9], [4.8, 3.2], color='#4472C4', linewidth=1.2)
    ax.text(10.2, 4, "1 : n", fontsize=7, ha='center', color='#4472C4')

    ax.plot([3.75, 7.75], [4.8, 3.2], color='#4472C4', linewidth=1.2)
    ax.text(4.8, 4.5, "1 : n (租赁)", fontsize=7, ha='center', color='#4472C4')

    ax.set_title("ER 图（核心实体关系）", fontsize=12, fontweight='bold', pad=8)
    save("08-er-diagram.png")


def img09_table_relations():
    """Database table relations"""
    fig, ax = plt.subplots(figsize=(11, 7))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis('off')

    def table_box(ax, x, y, w, h, title, fields, color='#D6E4F0'):
        box = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.1",
                              facecolor=color, edgecolor='#4472C4', linewidth=1.2)
        ax.add_patch(box)
        ax.text(x, y+h/2 - 0.2, title, ha='center', va='top', fontsize=7, fontweight='bold')
        ax.plot([x-w/2+0.1, x+w/2-0.1], [y+h/2 - 0.4, y+h/2 - 0.4], color='#4472C4', linewidth=0.5)
        for i, f in enumerate(fields):
            ax.text(x, y+h/2 - 0.5 - i*0.25, f, ha='center', va='top', fontsize=5.5, color='#333')

    tables = [
        (2, 8, 2.5, 3.5, "user", ["user_id PK", "username", "password", "phone", "avatar", "role", "status", "create_time"]),
        (6, 8, 2.8, 3.5, "toy_product", ["product_id PK", "name", "price", "rent_price_day", "rent_price_month", "category_id FK", "owner_id FK", "status", "create_time"]),
        (10, 8, 2.3, 1.8, "toy_category", ["category_id PK", "name", "parent_id", "sort_order", "status"]),
        (4, 4.5, 2.8, 3, "toy_order", ["order_id PK", "order_no", "renter_id FK", "owner_id FK", "address_id FK", "status", "total_rent", "deposit", "pay_time"]),
        (1.5, 4.5, 2, 2, "toy_cart", ["cart_id PK", "user_id FK", "product_id FK", "quantity"]),
        (8, 4.5, 2.5, 2, "toy_evaluation", ["eval_id PK", "order_id FK", "user_id FK", "score", "content"]),
        (10, 4.5, 2.3, 2.5, "toy_message", ["msg_id PK", "from_id FK", "to_id FK", "content", "is_read", "send_time"]),
        (3, 1.5, 2.5, 2, "toy_address", ["address_id PK", "user_id FK", "name", "phone", "province", "city", "district"]),
        (7, 1.5, 2.8, 2.5, "toy_community_post", ["post_id PK", "user_id FK", "title", "content", "create_time"]),
    ]

    for args in tables:
        table_box(ax, *args)

    # Lines for FK relationships
    rels = [
        (3.25, 7.5, 4.6, 7.5),   # user -> product
        (3.25, 6.8, 2.6, 6.0),   # user -> order
        (3.25, 7, 1.5, 5.3),     # user -> cart
        (5.2, 6.0, 4.6, 6.0),    # product -> order
        (6.2, 7.5, 10, 7.1),     # product -> category
        (5.5, 5.7, 8, 5.3),      # order -> evaluation
        (3.25, 6.5, 10, 5.3),    # user -> message
        (2.5, 6.5, 3, 2.5),      # user -> address
        (3.25, 6, 7, 2.5),       # user -> community_post
    ]

    for sx, sy, ex, ey in rels:
        ax.annotate("", xy=(ex, ey), xytext=(sx, sy),
                    arrowprops=dict(arrowstyle="->", color='gray', lw=0.6, alpha=0.6))

    ax.set_title("数据库表关系图", fontsize=12, fontweight='bold', pad=8)
    save("09-table-relations.png")


def img10_program_structure():
    """Program system structure"""
    fig, ax = plt.subplots(figsize=(10, 6.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    def box(ax, x, y, w, h, text, color='#D6E4F0', fs=8, bold=False, edgecolor='#4472C4'):
        b = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.1",
                            facecolor=color, edgecolor=edgecolor, linewidth=1.2)
        ax.add_patch(b)
        fw = 'bold' if bold else 'normal'
        ax.text(x, y, text, ha='center', va='center', fontsize=fs, fontweight=fw)

    # Layers with boxes
    # Presentation
    box(ax, 2.5, 9, 2.8, 0.65, "React SPA (用户端)", '#E2EFDA', fs=8, bold=True)
    box(ax, 7.5, 9, 2.8, 0.65, "Vue Admin (管理端)", '#E2EFDA', fs=8, bold=True)
    ax.text(5, 9.7, "表现层", ha='center', fontsize=9, fontweight='bold')
    ax.plot([1, 9], [8.6, 8.6], color='gray', lw=0.5, ls='--')

    # Controllers
    ctrls = ["ToyController", "ToyOrder\nController", "ToyCart\nController",
             "ToyMessage\nController", "ToyCommunity\nController", "ToyEvaluation\nController"]
    for i, c in enumerate(ctrls):
        box(ax, 1.2 + i*1.5, 7.5, 1.4, 0.8, c, '#D9E2F3', fs=6, edgecolor='#5B9BD5')
    ax.text(5, 8.2, "控制层 (Spring MVC)", ha='center', fontsize=9, fontweight='bold')
    ax.plot([1, 9], [6.9, 6.9], color='gray', lw=0.5, ls='--')

    # Services
    svcs = ["ToyService", "OrderService", "CartService", "MessageService", "CommunityService"]
    for i, s in enumerate(svcs):
        box(ax, 1.3 + i*1.8, 6.0, 1.6, 0.65, s, '#FFF2CC', fs=7, edgecolor='#C5A900')
    ax.text(5, 6.7, "服务层", ha='center', fontsize=9, fontweight='bold')
    ax.plot([1, 9], [5.3, 5.3], color='gray', lw=0.5, ls='--')

    # Data
    box(ax, 3, 4.3, 3, 0.65, "MyBatis Mapper", '#FCE4D6', fs=8, edgecolor='#ED7D31')
    box(ax, 7, 4.3, 3, 0.65, "Druid 连接池", '#FCE4D6', fs=8, edgecolor='#ED7D31')
    ax.text(5, 5.0, "数据层", ha='center', fontsize=9, fontweight='bold')
    ax.plot([1, 9], [3.6, 3.6], color='gray', lw=0.5, ls='--')

    # Storage
    box(ax, 3, 2.5, 2.8, 0.65, "MySQL (ry-vue)", '#F8D7DA', fs=8, edgecolor='#C00000')
    box(ax, 7, 2.5, 2.8, 0.65, "Redis 缓存", '#F8D7DA', fs=8, edgecolor='#C00000')
    ax.text(5, 3.3, "存储层", ha='center', fontsize=9, fontweight='bold')

    # Connector lines
    ax.plot([2.5, 5.5], [8.67, 7.9], color='#4472C4', lw=0.8, alpha=0.5)
    ax.plot([7.5, 5.5], [8.67, 7.9], color='#4472C4', lw=0.8, alpha=0.5)

    ax.set_title("程序系统结构图", fontsize=12, fontweight='bold', pad=8)
    save("10-program-structure.png")


def img11_sequence_login():
    """Login sequence diagram"""
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Participants
    actors = ["浏览器", "React前端", "Spring后端", "JWT Filter", "MySQL"]
    positions = [0.5, 2.5, 5, 7.5, 9.5]

    for i, (name, x) in enumerate(zip(actors, positions)):
        box = FancyBboxPatch((x-0.7, 9.2), 1.4, 0.55, boxstyle="round,pad=0.05",
                              facecolor='#D6E4F0', edgecolor='#4472C4', linewidth=1)
        ax.add_patch(box)
        ax.text(x, 9.47, name, ha='center', va='center', fontsize=7, fontweight='bold')
        # lifeline
        ax.plot([x, x], [0.5, 9.1], color='gray', linestyle='--', linewidth=0.5, alpha=0.5)

    # Messages
    msgs = [
        (0.5, 2.5, 7.8, "1. POST /login"),
        (2.5, 5, 6.6, "2. /login (Spring Security)"),
        (5, 9.5, 5.3, "3. 查询用户"),
        (9.5, 5, 4.1, "4. 返回用户信息"),
        (5, 7.5, 2.9, "5. 校验密码+生成JWT"),
        (7.5, 5, 1.8, "6. 返回token"),
        (5, 2.5, 0.7, "7. {code:200, token}"),
        (2.5, 0.5, -0.5, "8. 跳转首页"),
    ]

    for sx, ex, y, label in msgs:
        ax.annotate("", xy=(ex, y), xytext=(sx, y),
                    arrowprops=dict(arrowstyle="->", color='#4472C4', lw=1))
        ax.text((sx+ex)/2, y+0.15, label, ha='center', va='bottom', fontsize=6.5, color='#333')

    # Auth block
    box = FancyBboxPatch((3.5, 2.2), 4.5, 1, boxstyle="round,pad=0.1",
                          facecolor='#F2F2F2', edgecolor='gray', linewidth=1, linestyle='--')
    ax.add_patch(box)
    ax.text(5.75, 2.4, "JWT 认证流程", ha='center', fontsize=7, color='gray')

    ax.set_title("用户登录时序图", fontsize=12, fontweight='bold', pad=8)
    save("11-sequence-login.png")


def img12_order_lifecycle():
    """Order lifecycle state diagram"""
    fig, ax = plt.subplots(figsize=(10, 4.5))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 6)
    ax.axis('off')

    states = [
        (1.5, 4.5, "已创建\nCREATED", '#D6E4F0'),
        (3.5, 4.5, "已支付\nPAID", '#D6E4F0'),
        (5.5, 4.5, "已发货\nSHIPPED", '#D6E4F0'),
        (7.5, 4.5, "已收货\nRECEIVED", '#D6E4F0'),
        (9.5, 4.5, "归还中\nRETURNING", '#D6E4F0'),
        (10.5, 2.5, "消毒中\nDISINFECTING", '#D6E4F0'),
        (9.5, 0.5, "已完成\nCOMPLETED", '#E2EFDA'),
        (1.5, 2, "已取消\nCANCELLED", '#FCE4D6'),
        (5.5, 1.5, "续租\nRENEWAL", '#FFF2CC'),
    ]

    for x, y, label, color in states:
        box = FancyBboxPatch((x-0.8, y-0.5), 1.6, 1, boxstyle="round,pad=0.1",
                              facecolor=color, edgecolor='#4472C4', linewidth=1.2)
        ax.add_patch(box)
        ax.text(x, y, label, ha='center', va='center', fontsize=6.5, fontweight='bold')

    # Transitions
    arrows = [
        (2.3, 4.5, 2.7, 4.5, "支付"),
        (4.3, 4.5, 4.7, 4.5, "发货"),
        (6.3, 4.5, 6.7, 4.5, "收货确认"),
        (8.3, 4.5, 8.7, 4.5, "归还"),
        (9.5, 4.0, 10.5, 3.0, "验收"),
        (10.5, 2.0, 9.5, 1.0, "消毒完成"),
        (2.3, 4.0, 1.5, 2.5, "取消"),
        (3.5, 4.0, 1.5, 2.5, "取消"),
        (7.5, 3.5, 5.5, 2.0, "申请续租"),
        (5.5, 2.0, 3.5, 3.5, "续租支付"),
    ]

    for sx, sy, ex, ey, label in arrows:
        ax.annotate("", xy=(ex, ey), xytext=(sx, sy),
                    arrowprops=dict(arrowstyle="->", color='#4472C4', lw=1))
        ax.text((sx+ex)/2 + 0.05, (sy+ey)/2 + 0.1, label, fontsize=6, color='#555')

    ax.set_title("订单生命周期状态图", fontsize=12, fontweight='bold', pad=8)
    save("12-order-lifecycle.png")


def img13_deployment():
    """Deployment diagram"""
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    def node(ax, x, y, w, h, label, desc="", color='#D6E4F0'):
        box = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.15",
                              facecolor=color, edgecolor='#4472C4', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y+0.05, label, ha='center', va='center', fontsize=8, fontweight='bold')
        if desc:
            ax.text(x, y-0.3, desc, ha='center', va='center', fontsize=6, color='#666')

    # Cloud - client
    cloud = plt.Circle((1.2, 4.5), 0.7, facecolor='#FFF2CC', edgecolor='#C5A900', linewidth=1.2)
    ax.add_patch(cloud)
    cloud2 = plt.Circle((1.8, 4.3), 0.55, facecolor='#FFF2CC', edgecolor='#C5A900', linewidth=1.2)
    ax.add_patch(cloud2)
    cloud3 = plt.Circle((1.5, 4.0), 0.6, facecolor='#FFF2CC', edgecolor='#C5A900', linewidth=1.2)
    ax.add_patch(cloud3)
    ax.text(1.5, 4.3, "客户端", ha='center', va='center', fontsize=7, fontweight='bold')

    node(ax, 3.8, 4.5, 2.2, 1.4, "Nginx", ":80 / :3000\n反向代理", '#E2EFDA')
    node(ax, 6.8, 4.5, 2.4, 1.4, "Spring Boot", ":8080\nruoyi-admin.jar", '#D6E4F0')
    node(ax, 5, 1.5, 2.2, 1.2, "MySQL", ":3306\nry-vue", '#FCE4D6')
    node(ax, 8.5, 1.5, 2.2, 1.2, "Redis", ":6379\n缓存/Session", '#F8D7DA')

    # Connections
    ax.plot([2.5, 2.8], [4.5, 4.5], color='#4472C4', lw=1.5)
    ax.plot([4.9, 5.6], [4.5, 4.5], color='#4472C4', lw=1.5)
    ax.plot([6.8, 5], [3.8, 2.1], color='#ED7D31', lw=1.2)
    ax.plot([6.8, 8.5], [3.8, 2.1], color='#C00000', lw=1.2)

    ax.text(2.65, 4.8, "HTTPS", fontsize=6, ha='center')
    ax.text(5.25, 4.8, "proxy", fontsize=6, ha='center')
    ax.text(5.6, 2.8, "JDBC/Druid", fontsize=6, color='#ED7D31')
    ax.text(7.8, 2.8, "Jedis", fontsize=6, color='#C00000')

    ax.text(3.8, 5.5, "Web服务器", fontsize=8, ha='center', color='gray')
    ax.text(6.8, 5.5, "应用服务器", fontsize=8, ha='center', color='gray')
    ax.text(6, 2.4, "数据服务器", fontsize=8, ha='center', color='gray')

    ax.set_title("系统部署架构图", fontsize=12, fontweight='bold', pad=8)
    save("13-deployment.png")


def img14_test_arch():
    """Test architecture"""
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    def box(ax, x, y, w, h, text, color='#D6E4F0', fs=8, bold=False):
        b = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.08",
                            facecolor=color, edgecolor='#4472C4', linewidth=1.2)
        ax.add_patch(b)
        fw = 'bold' if bold else 'normal'
        ax.text(x, y, text, ha='center', va='center', fontsize=fs, fontweight=fw)

    # Test types
    box(ax, 2, 5.5, 2.5, 0.7, "单元测试", '#D6E4F0', bold=True)
    box(ax, 5, 5.5, 2.5, 0.7, "集成测试", '#D6E4F0', bold=True)
    box(ax, 8, 5.5, 2.5, 0.7, "端到端测试 (E2E)", '#D6E4F0', bold=True)

    # Test cases
    unit_cases = ["Service层测试", "Controller层测试", "Mapper层测试"]
    for i, c in enumerate(unit_cases):
        box(ax, 2, 4.2 - i*0.65, 2.3, 0.43, c, '#E2EFDA', fs=7)

    int_cases = ["API接口测试", "JWT认证流程", "文件上传测试"]
    for i, c in enumerate(int_cases):
        box(ax, 5, 4.2 - i*0.65, 2.3, 0.43, c, '#E2EFDA', fs=7)

    e2e_cases = ["用户下单流程", "订单生命周期", "支付归还流程", "社区发帖评价"]
    for i, c in enumerate(e2e_cases):
        box(ax, 8, 4.2 - i*0.65, 2.3, 0.43, c, '#E2EFDA', fs=7)

    # System under test
    box(ax, 5, 1.0, 8, 0.65, "被测试系统：商品 | 购物车 | 订单 | 消息 | 社区 | 评价 | 分类 | 地址", '#FCE4D6', fs=7, bold=True)

    # Connection lines
    for tx in [2, 5, 8]:
        ax.plot([tx, tx], [5.1, 4.55], color='#4472C4', lw=0.8)
        ax.plot([tx, 5], [Tx_valid := 4.2 - 2*0.65, 1.35], color='gray', lw=0.5, ls='--')

    ax.set_title("测试模块架构图", fontsize=12, fontweight='bold', pad=8)
    save("14-test-arch.png")


def img15_interface_arch():
    """Interface architecture"""
    fig, ax = plt.subplots(figsize=(9, 5.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    def box(ax, x, y, w, h, text, color='#D6E4F0', fs=8, bold=False):
        b = FancyBboxPatch((x-w/2, y-h/2), w, h, boxstyle="round,pad=0.1",
                            facecolor=color, edgecolor='#4472C4', linewidth=1.2)
        ax.add_patch(b)
        fw = 'bold' if bold else 'normal'
        ax.text(x, y, text, ha='center', va='center', fontsize=fs, fontweight=fw)

    box(ax, 2, 5.5, 2.8, 0.8, "React 用户端\n(port 3000)", '#E2EFDA', bold=True)
    box(ax, 5.5, 5.5, 2.8, 0.8, "Vue 管理端\n(port 80)", '#E2EFDA', bold=True)

    box(ax, 3.75, 3, 3.5, 0.8, "Spring Boot\n(port 8080)", '#D6E4F0', fs=9, bold=True)

    box(ax, 1, 0.8, 2.2, 0.7, "/api/toy/*", '#FFF2CC', fs=7)
    box(ax, 6.5, 0.8, 2.2, 0.7, "/system/*", '#FFF2CC', fs=7)

    box(ax, 8.5, 3, 2, 0.8, "Redis\n:6379", '#F8D7DA', fs=7)
    box(ax, 1, 3, 2, 0.8, "MySQL\n:3306", '#FCE4D6', fs=7)

    # Connections
    ax.annotate("", xy=(3.2, 5.2), xytext=(2.2, 3.4),
                arrowprops=dict(arrowstyle="->", color='#4472C4', lw=1.2))
    ax.text(1.6, 4.3, "HTTP/REST\nBearer JWT", fontsize=6, ha='center', color='#4472C4')

    ax.annotate("", xy=(4.3, 5.2), xytext=(5.3, 3.4),
                arrowprops=dict(arrowstyle="->", color='#4472C4', lw=1.2))
    ax.text(4.8, 4.3, "HTTP/REST\nBearer JWT", fontsize=6, ha='center', color='#4472C4')

    ax.annotate("", xy=(2.2, 3.2), xytext=(2.2, 1.2),
                arrowprops=dict(arrowstyle="->", color='#ED7D31', lw=1))
    ax.text(1.2, 2.2, "JDBC", fontsize=6, ha='center', color='#ED7D31')

    ax.annotate("", xy=(5.3, 3.2), xytext=(6.6, 3.2),
                arrowprops=dict(arrowstyle="->", color='#C00000', lw=1))
    ax.text(6, 3.5, "Jedis", fontsize=6, ha='center', color='#C00000')

    ax.set_title("接口架构图", fontsize=12, fontweight='bold', pad=8)
    save("15-interface-arch.png")


def main():
    print("Generating diagrams...")
    img01_gantt()
    img02_function_arch()
    img03_use_case()
    img04_dfd()
    img05_flowchart()
    img06_module_structure()
    img07_matrix()
    img08_er_diagram()
    img09_table_relations()
    img10_program_structure()
    img11_sequence_login()
    img12_order_lifecycle()
    img13_deployment()
    img14_test_arch()
    img15_interface_arch()
    print(f"\nAll 15 images generated in: {OUT}")


if __name__ == "__main__":
    main()
