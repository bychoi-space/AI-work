import sys

html = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>전체 프로세스</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; background: #f8f9fa; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
        .page { width: 1440px; height: 900px; position: relative; background: #ffffff; overflow: hidden; font-family: 'Inter', sans-serif; }
    </style>
</head>
<body>
<div class="page lf-canvas">

    <!-- UI / LEGEND -->
    <div class="lf-component" style="position: absolute; top: 30px; left: 30px; width: 200px; height: 60px; z-index: 1000;">
        <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #555555; border: 3px solid #dddddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; overflow: hidden; box-sizing: border-box;">
            <div class="v4-editable-cell" contenteditable="true" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; outline: none; font-weight: 800; font-size: 16px;">전체 프로세스</div>
        </div>
    </div>

    <!-- Legend Buttons -->
    <div class="lf-component" style="position: absolute; top: 40px; right: 260px; width: 100px; height: 36px; z-index: 1000;">
        <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #e0e7ff; border: 1px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #334155; overflow: hidden; box-sizing: border-box;">
            <div class="v4-editable-cell" contenteditable="true" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; outline: none; font-weight: 700; font-size: 13px;">LFmall</div>
        </div>
    </div>
    <div class="lf-component" style="position: absolute; top: 40px; right: 140px; width: 100px; height: 36px; z-index: 1000;">
        <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #dcfce7; border: 1px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #334155; overflow: hidden; box-sizing: border-box;">
            <div class="v4-editable-cell" contenteditable="true" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; outline: none; font-weight: 700; font-size: 13px;">OMS/SAP</div>
        </div>
    </div>
    <div class="lf-component" style="position: absolute; top: 40px; right: 20px; width: 100px; height: 36px; z-index: 1000;">
        <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: #fef08a; border: 1px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #334155; overflow: hidden; box-sizing: border-box;">
            <div class="v4-editable-cell" contenteditable="true" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; outline: none; font-weight: 700; font-size: 13px;">POS</div>
        </div>
    </div>

    <!-- Horizontal Dividers -->
    <div class="lf-component" style="position: absolute; top: 400px; left: 30px; width: 1380px; height: 20px; z-index: 500;">
        <div class="v4-shape v4-shape-divider" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
            <div style="width: 100%; border-top: 2px dashed #94a3b8;"></div>
        </div>
    </div>
    <div class="lf-component" style="position: absolute; top: 710px; left: 30px; width: 1380px; height: 20px; z-index: 500;">
        <div class="v4-shape v4-shape-divider" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
            <div style="width: 100%; border-top: 2px dashed #94a3b8;"></div>
        </div>
    </div>
"""

# Base dimensions
RW = 100  # Rect Width
RH = 46   # Rect Height
CW = 80   # Circle Width/Height
DW = 110  # Diamond Width/Height
TSIZE = 12 # Text Size

# Calculate Columns (13 columns)
# Let's space them from X=30 to X=1330 (1300 width available)
# Gap = (1300 - (13 * RW)) / 12 = 0? No wait, RW=100. 13*100=1300. Gap=0! That's too tight.
# Let's reduce RW to 90. 13*90 = 1170. 1380 - 1170 = 210. 210/12 = 17.5px gap.
# Let's keep RW=94. RH=46.
RW = 94
GAP = 12
start_x = 30
cols = [start_x + i*(RW+GAP) for i in range(14)]
# cols[0] = 30
# cols[1] = 136
# cols[2] = 242
# cols[3] = 348
# cols[4] = 454
# cols[5] = 560
# cols[6] = 666
# cols[7] = 772
# cols[8] = 878
# cols[9] = 984
# cols[10] = 1090
# cols[11] = 1196
# cols[12] = 1302

# LFMALL rows: 140, 200, 260, 320
# OMS rows: 460, 540, 620
# Issues: 760, 800

def rect(x, y, w, h, bg, border, color, text, ts=13, r=8):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: {w}px; height: {h}px; z-index: 1000;">
        <div class="v4-shape v4-shape-rect" style="width: 100%; height: 100%; background: {bg}; border: 1px solid {border}; border-radius: {r}px; display: flex; align-items: center; justify-content: center; color: {color}; overflow: hidden; box-sizing: border-box;">
            <div class="v4-editable-cell" contenteditable="true" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; outline: none; font-weight: 700; font-size: {ts}px; text-align: center; line-height: 1.3;">{text}</div>
        </div>
    </div>'''

def circle(x, y, d, bg, border, color, text, ts=12):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: {d}px; height: {d}px; z-index: 1000;">
        <div class="v4-shape v4-shape-circle" style="width: 100%; height: 100%; background: {bg}; border: 2px solid {border}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: {color}; overflow: hidden; box-sizing: border-box;">
            <div class="v4-editable-cell" contenteditable="true" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; outline: none; font-weight: 700; font-size: {ts}px; text-align: center; line-height: 1.2;">{text}</div>
        </div>
    </div>'''

def diamond(x, y, d, bg, border, color, text, ts=12):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: {d}px; height: {d}px; z-index: 1000;">
        <div class="v4-shape v4-shape-diamond" style="width: 100%; height: 100%; background: {bg}; border: 1px solid {border}; clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); display: flex; align-items: center; justify-content: center; color: {color}; overflow: hidden; box-sizing: border-box;">
            <div class="v4-editable-cell" contenteditable="true" style="width: 70%; height: 70%; display: flex; align-items: center; justify-content: center; outline: none; font-weight: 800; font-size: {ts}px; text-align: center; line-height: 1.2;">{text}</div>
        </div>
    </div>'''

def text_label(x, y, text, color="#1e293b", size=14):
    return f'''<div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; z-index: 1000; font-weight: 800; font-size: {size}px; color: {color};">{text}</div>'''

def straight_arr(x, y, w, h=10, c="#94a3b8"):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: {w}px; height: {h}px; z-index: 100;">
        <div class="v4-shape v4-shape-arrow-straight" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: flex-end; box-sizing: border-box;"><div style="flex: 1; height: 2px; background: {c};"></div><div style="width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid {c}; margin-left: -1px;"></div></div>
    </div>'''

def elbow_arr_up(x, y, w, h, c="#94a3b8"):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: {w}px; height: {h}px; z-index: 100;">
        <div class="v4-shape v4-shape-arrow-elbow" style="width: 100%; height: 100%; position: relative; box-sizing: border-box;"><div style="position: absolute; left: 0; bottom: 0; width: 10px; border-bottom: 2px solid {c};"></div><div style="position: absolute; left: 8px; top: 0; bottom: 0; border-left: 2px solid {c};"></div><div style="position: absolute; left: 8px; top: 0; width: {w-8}px; border-top: 2px solid {c}; display: flex; justify-content: flex-end; align-items: center;"><div style="width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid {c}; transform: translateY(-5px); margin-left: {w-20}px;"></div></div></div>
    </div>'''

def elbow_arr_down(x, y, w, h, c="#94a3b8"):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: {w}px; height: {h}px; z-index: 100;">
        <div class="v4-shape v4-shape-arrow-elbow" style="width: 100%; height: 100%; position: relative; box-sizing: border-box;"><div style="position: absolute; left: 0; top: 0; width: 10px; border-top: 2px solid {c};"></div><div style="position: absolute; left: 8px; top: 0; bottom: 0; border-left: 2px solid {c};"></div><div style="position: absolute; left: 8px; bottom: 0; width: {w-8}px; border-bottom: 2px solid {c}; display: flex; justify-content: flex-end; align-items: center;"><div style="width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid {c}; transform: translateY(5px); margin-left: {w-20}px;"></div></div></div>
    </div>'''

def vert_line(x, y, h, c="#94a3b8"):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: 10px; height: {h}px; z-index: 100;">
        <div style="width: 2px; height: {h}px; background: {c};"></div>
    </div>'''

def vert_arr_down(x, y, h, c="#94a3b8"):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: 10px; height: {h}px; z-index: 100;">
        <div style="width: 2px; height: {h-8}px; background: {c};"></div><div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid {c}; margin-left: -4px;"></div>
    </div>'''

def vert_arr_up(x, y, h, c="#94a3b8"):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: 10px; height: {h}px; z-index: 100;">
        <div style="width: 2px; height: {h-8}px; background: {c};"></div><div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid {c}; margin-left: -4px; margin-top: -{h-8}px;"></div>
    </div>'''

def issue_arr(x, y, h):
    return f'''
    <div class="lf-component" style="position: absolute; top: {y}px; left: {x}px; width: 10px; height: {h}px; z-index: 100;">
        <div class="v4-shape v4-shape-arrow-vertical" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; box-sizing: border-box; opacity: 0.9;">
            <div style="width: 60%; flex: 1; background: linear-gradient(to bottom, #fed7aa, #ea580c); z-index: 1;"></div>
            <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #ea580c; z-index: 2; margin-top: -1px;"></div>
        </div>
    </div>'''


html += f'''
    <!-- LFMALL LAYER (TOP) -->
    <!-- Customer -->
    <div class="lf-component" style="position: absolute; top: 150px; left: {cols[0]+15}px; width: 60px; height: 90px; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div class="lf-icon lf-icon-my" style="filter: brightness(0); transform: scale(1.8); margin-bottom: 16px;"></div>
        <div class="v4-shape v4-shape-rect" style="width: 60px; height: 26px; background: #64748b; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white;">
            <div class="v4-editable-cell" contenteditable="true" style="font-size: 13px; font-weight: 700;">고객</div>
        </div>
    </div>
'''

html += rect(cols[1], 200, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '상품 목록')
html += rect(cols[2], 200, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '상품 상세')

html += rect(cols[3], 130, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '원클릭 결제')
html += rect(cols[3], 200, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '쇼핑백')
html += rect(cols[3], 270, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '주문서')

html += rect(cols[4], 200, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '주문완료')
html += rect(cols[4], 270, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '주문생성')

html += circle(cols[5]+7, 310, CW, '#334155', '#000', 'white', '결제<br>완료', 13)
html += rect(cols[6], 325, 200, 50, '#ffedd5', 'none', '#c2410c', '자동결품배치 (알림톡) 정책', 14, 25)
html += circle(cols[8]+7, 310, CW, '#334155', '#000', 'white', '상품<br>준비중', 13)
html += circle(cols[9]+7, 310, CW, '#334155', '#000', 'white', '배송중', 13)
html += circle(cols[10]+7, 310, CW, '#334155', '#000', 'white', '배송<br>완료', 13)

html += rect(cols[10], 200, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '배송중')
html += rect(cols[11], 200, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '배송완료')

html += rect(cols[12], 160, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '반품신청')
html += rect(cols[12], 240, RW, RH, '#e0e7ff', '#94a3b8', '#1e293b', '교환신청')


# OMS LAYER
html += rect(cols[4], 450, RW, RH, '#dcfce7', '#94a3b8', '#1e293b', '주문수집')
html += diamond(cols[5]-8, 420, DW, '#ffedd5', '#fb923c', '#c2410c', '매장상품<br>배송', 13)
html += text_label(cols[5]+50, 420, 'N')
html += text_label(cols[5]+30, 530, 'Y')

html += rect(cols[8], 450, RW, RH, '#dcfce7', '#94a3b8', '#1e293b', '출고처지정')
html += rect(cols[9], 450, RW, RH, '#dcfce7', '#94a3b8', '#1e293b', '입고확정')
html += rect(cols[10], 450, RW, RH, '#dcfce7', '#94a3b8', '#1e293b', '송장출력')
html += rect(cols[11], 450, RW, RH, '#dcfce7', '#94a3b8', '#1e293b', 'CJ대한통운<br>배송완료', 12)

html += rect(cols[4], 590, RW, RH, '#dcfce7', '#94a3b8', '#1e293b', '비직송매장<br>재고체크', 12)
html += rect(cols[5], 590, RW, RH, '#dcfce7', '#94a3b8', '#1e293b', '물량 이동 지시', 12)
html += rect(cols[6], 590, RW, RH, '#ffedd5', '#fb923c', '#c2410c', '물량 이동<br>확인/승인', 12)

html += diamond(cols[7]-8, 555, DW, '#ffedd5', '#fb923c', '#c2410c', '승인<br>여부', 14)
html += text_label(cols[7]+30, 535, 'N')
html += text_label(cols[7]+80, 615, 'Y')

html += diamond(cols[7]-8, 415, DW, '#f1f5f9', '#94a3b8', '#475569', '가용화', 14)
html += text_label(cols[7]+30, 400, 'N')
html += text_label(cols[7]+80, 460, 'Y')

html += rect(cols[8], 590, RW, RH, '#dcfce7', '#94a3b8', '#1e293b', '매장 반품')

# ARROWS L1
html += straight_arr(cols[0]+75, 218, 15)
html += straight_arr(cols[1]+RW, 218, 12)

html += elbow_arr_up(cols[2]+RW, 150, 26, 68)
html += straight_arr(cols[2]+RW, 218, 26)
html += elbow_arr_down(cols[2]+RW, 218, 26, 75)

html += elbow_arr_down(cols[3]+RW, 150, 26, 68)
html += straight_arr(cols[3]+RW, 218, 26)
html += elbow_arr_up(cols[3]+RW, 218, 26, 75)

# Top Long Arrow
html += straight_arr(cols[4]+RW, 218, 650)
html += straight_arr(cols[10]+RW, 218, 12)

html += elbow_arr_up(cols[11]+RW, 180, 26, 38)
html += elbow_arr_down(cols[11]+RW, 218, 26, 45)

html += vert_arr_down(cols[4]+47, 246, 24)
html += straight_arr(cols[4]+RW, 288, 12)

html += straight_arr(cols[5]+CW+7, 350, 25)
html += straight_arr(cols[6]+200, 350, 15)
html += straight_arr(cols[8]+CW+7, 350, 15)
html += straight_arr(cols[9]+CW+7, 350, 15)

html += vert_arr_up(cols[10]+47, 260, 50)
html += vert_arr_up(cols[11]+47, 260, 50)

# ARROWS L2
html += vert_arr_down(cols[4]+47, 316, 134)
html += straight_arr(cols[4]+RW, 470, 15)

html += straight_arr(cols[5]+DW-8, 470, 240)
html += straight_arr(cols[8]+RW, 470, 12)
html += straight_arr(cols[9]+RW, 470, 12)
html += straight_arr(cols[10]+RW, 470, 12)

html += vert_arr_up(cols[9]+47, 400, 50)
html += vert_arr_up(cols[10]+47, 400, 50)
html += vert_arr_up(cols[11]+47, 400, 50)

# Red arrows
html += f'''<div class="lf-component" style="position: absolute; top: 510px; left: {cols[5]+45}px; width: 10px; height: 50px; z-index: 100;"><div style="width: 2px; height: 50px; background: #dc2626;"></div></div>'''
html += f'''<div class="lf-component" style="position: absolute; top: 560px; left: {cols[4]+45}px; width: {cols[7]-cols[4]}px; height: 2px; z-index: 100; background: #dc2626;"></div>'''
html += f'''<div class="lf-component" style="position: absolute; top: 560px; left: {cols[4]+45}px; width: 10px; height: 30px; z-index: 100;"><div style="width: 2px; height: 20px; background: #dc2626;"></div><div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid #dc2626; margin-left: -4px;"></div></div>'''
html += f'''<div class="lf-component" style="position: absolute; top: 560px; left: {cols[7]+45}px; width: 10px; height: 20px; z-index: 100;"><div style="width: 2px; height: 10px; background: #dc2626;"></div><div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid #dc2626; margin-left: -4px;"></div></div>'''

html += straight_arr(cols[4]+RW, 610, 12)
html += straight_arr(cols[5]+RW, 610, 12)
html += straight_arr(cols[6]+RW, 610, 8)

html += f'''<div class="lf-component" style="position: absolute; top: 525px; left: {cols[7]+45}px; width: 10px; height: 30px; z-index: 100;"><div style="width: 2px; height: 30px; background: #94a3b8;"></div><div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid #94a3b8; margin-left: -4px; margin-top: -38px;"></div></div>'''
html += elbow_arr_up(cols[7]+45, 470, cols[8]-cols[7]-45, 20)

html += straight_arr(cols[7]+DW-8, 610, 18)
html += f'''<div class="lf-component" style="position: absolute; top: 470px; left: {cols[7]+DW-8}px; width: 40px; height: 140px; z-index: 100;"><div class="v4-shape v4-shape-arrow-elbow" style="width: 100%; height: 100%; position: relative; box-sizing: border-box;"><div style="position: absolute; left: 0; top: 0; width: 20px; border-top: 2px solid #94a3b8;"></div><div style="position: absolute; left: 18px; top: 0; bottom: 0; border-right: 2px solid #94a3b8;"></div><div style="position: absolute; left: 18px; bottom: 0; width: 22px; border-bottom: 2px solid transparent; display: flex; justify-content: flex-end; align-items: flex-end;"><div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid #94a3b8; transform: translateX(5px);"></div></div></div></div>'''

# ISSUES
I_Y = 740

def issue(x, y_start, h, label, title, text):
    return issue_arr(x, y_start, h) + f'''
    <div class="lf-component" style="position: absolute; top: {I_Y}px; left: {x-45}px; width: 100px; height: 30px; z-index: 1000;">
        <div class="v4-shape v4-shape-badge" style="width: 100%; height: 100%; background: #ea580c; border-radius: 50px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.2);">
            <div class="v4-editable-cell" contenteditable="true" style="font-weight: 800; font-size: 13px;">{label}</div>
        </div>
    </div>
    <div class="lf-component" style="position: absolute; top: {I_Y+40}px; left: {x-65}px; width: 140px; height: 50px; z-index: 1000;">
        <div class="v4-editable-cell" contenteditable="true" style="font-size: 12px; font-weight: 700; text-align: center; color: #475569; line-height: 1.4;">{text}</div>
    </div>'''

html += issue(cols[1]+47, 246, I_Y-246, "ISSUE 1.", "", "상품 재고 케이스 별<br>표현 방법")
html += issue(cols[6]+47, 636, I_Y-636, "ISSUE 2.", "", "비직송 매장<br>물량 이동 승인 이슈<br>(매장 제공 혜택)")
html += issue(cols[7]+47, 600, I_Y-600, "ISSUE 3.", "", "자동결품배치<br>예외처리 (D+5 등)<br>정책 수립")
html += issue(cols[8]+47, 636, I_Y-636, "ISSUE 4.", "", "고객 주문취소<br>인터벌에 대한<br>정책 수립")
html += issue(cols[12]+47, 286, I_Y-286, "ISSUE 5.", "", "교환 신청<br>재고 체크 로직")


html += """
</div>
</body>
</html>
"""

with open("c:/ai-work/data/on_off_inventory/01_Global_Process.html", "w", encoding="utf-8") as f:
    f.write(html)
