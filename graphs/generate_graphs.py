import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.patches as mpatches
import numpy as np
import os

OUT = os.path.dirname(os.path.abspath(__file__))

BLUE   = '#2563EB'
GREEN  = '#16A34A'
RED    = '#DC2626'
ORANGE = '#EA580C'
PURPLE = '#7C3AED'
GRAY   = '#6B7280'
BG     = '#F8FAFC'

def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    print(f'Saved: {path}')
    plt.close(fig)

# ── Graph 1: Consensus Threshold Bar Chart ────────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 5), facecolor=BG)
ax.set_facecolor(BG)
N   = [1, 2, 3, 4, 5, 6]
req = [1, 2, 2, 3, 3, 4]
x   = np.arange(len(N))
w   = 0.38
b1 = ax.bar(x - w/2, N,   w, label='Total Validators (N)',              color=BLUE,  alpha=0.85, zorder=3)
b2 = ax.bar(x + w/2, req, w, label='Required Approvals floor(N/2)+1',   color=GREEN, alpha=0.85, zorder=3)
for bar in b1:
    ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+0.07,
            str(int(bar.get_height())), ha='center', va='bottom', fontsize=11, fontweight='bold', color=BLUE)
for bar in b2:
    ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+0.07,
            str(int(bar.get_height())), ha='center', va='bottom', fontsize=11, fontweight='bold', color=GREEN)
ax.set_xticks(x)
ax.set_xticklabels([f'N={n}' for n in N], fontsize=11)
ax.set_ylabel('Count', fontsize=12)
ax.set_title('Graph 1: Multi-Validator Consensus Threshold', fontsize=14, fontweight='bold', pad=12)
ax.legend(fontsize=10)
ax.set_ylim(0, 8)
ax.yaxis.grid(True, linestyle='--', alpha=0.5, zorder=0)
ax.set_axisbelow(True)
ax.spines[['top','right']].set_visible(False)
ax.text(0.5, -0.16, 'Strict majority: floor(N/2)+1 approvals required. For N=2: both must approve. For N=3: any 2 must approve.',
        transform=ax.transAxes, ha='center', fontsize=9, color=GRAY, style='italic')
save(fig, 'graph1_consensus_threshold.png')

# ── Graph 2: Storage Distribution Donut ──────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 6), facecolor=BG)
ax.set_facecolor(BG)
labels  = ['MongoDB (Off-chain)\nProfiles, Posts, Messages,\nDocuments', 'Blockchain (On-chain)\nkeccak256 Hashes Only']
sizes   = [85, 15]
colors  = [BLUE, GREEN]
explode = (0.03, 0.08)
wedges, texts, autotexts = ax.pie(
    sizes, labels=labels, colors=colors, explode=explode,
    autopct='%1.0f%%', startangle=140,
    wedgeprops=dict(width=0.55, edgecolor='white', linewidth=2),
    textprops={'fontsize': 11}, pctdistance=0.75)
for at in autotexts:
    at.set_fontsize(13); at.set_fontweight('bold'); at.set_color('white')
ax.set_title('Graph 2: Hybrid Storage Architecture — Data Distribution', fontsize=13, fontweight='bold', pad=16)
legend_patches = [mpatches.Patch(color=BLUE, label='MongoDB — actual data (85%)'),
                  mpatches.Patch(color=GREEN, label='Blockchain — hashes only (15%)')]
ax.legend(handles=legend_patches, loc='lower center', bbox_to_anchor=(0.5, -0.08), fontsize=10)
save(fig, 'graph2_storage_distribution.png')

# ── Graph 3: Workflow Timeline ────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(11, 6), facecolor=BG)
ax.set_facecolor(BG)
steps = [
    ('Student Registration Form',      0,     30,   BLUE),
    ('File Upload to Supabase',         30,    15,   PURPLE),
    ('Verification Request Created',    45,    2,    ORANGE),
    ('Validators Receive & Vote',       47,    60,   RED),
    ('Consensus Reached',               107,   2,    GREEN),
    ('keccak256 Hash Generation',       109,   0.5,  BLUE),
    ('Blockchain Tx on Sepolia (~13s)', 109.5, 13,   GREEN),
    ('Student Notified',                122.5, 1,    ORANGE),
]
y_pos = list(range(len(steps)))[::-1]
for i, (label, start, dur, color) in enumerate(steps):
    y = y_pos[i]
    ax.barh(y, dur, left=start, height=0.55, color=color, alpha=0.85, zorder=3)
    ax.text(start + dur + 1, y, f'{dur}s', va='center', fontsize=9, color=color, fontweight='bold')
ax.set_yticks(y_pos)
ax.set_yticklabels([s[0] for s in steps], fontsize=10)
ax.set_xlabel('Time (seconds)', fontsize=11)
ax.set_title('Graph 3: EduNetChain Workflow Timeline (Approximate Time per Step)', fontsize=13, fontweight='bold', pad=12)
ax.xaxis.grid(True, linestyle='--', alpha=0.4, zorder=0)
ax.set_axisbelow(True)
ax.spines[['top','right']].set_visible(False)
ax.set_xlim(0, 145)
save(fig, 'graph3_workflow_timeline.png')

# ── Graph 4: Security Layers Concentric Rings ─────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 8), facecolor=BG)
ax.set_facecolor(BG)
ax.set_aspect('equal')
ax.axis('off')
layers = [
    (2.8, '#DBEAFE', BLUE,   'JWT + RBAC\n(Outermost)'),
    (2.1, '#DCFCE7', GREEN,  'Consensus\nfloor(N/2)+1'),
    (1.4, '#FEF3C7', ORANGE, 'Blockchain\nonlyOwner'),
    (0.7, '#FCE7F3', RED,    'keccak256\nTamper Core'),
]
for radius, facecolor, edgecolor, label in layers:
    circle = plt.Circle((0, 0), radius, color=facecolor, ec=edgecolor, lw=2.5, zorder=2)
    ax.add_patch(circle)
annots = [
    (3.6,  2.0,  2.9,  1.6,  BLUE,   'Layer 1: JWT + Role-Based Access Control\n(student / alumni / validator / recruiter / super admin)'),
    (3.6,  0.4,  2.2,  0.4,  GREEN,  'Layer 2: Multi-Validator Consensus\n(floor(N/2)+1 majority required)'),
    (3.6, -1.2,  1.5, -0.8,  ORANGE, 'Layer 3: Blockchain Immutability\n(onlyOwner + write-once issueCredential)'),
    (3.6, -2.8,  0.8, -0.4,  RED,    'Layer 4: keccak256 Tamper Detection\n(live hash vs on-chain hash)'),
]
for lx, ly, ax_, ay_, color, text in annots:
    ax.annotate(text, xy=(ax_, ay_), xytext=(lx, ly), fontsize=9, color=color, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color=color, lw=1.5),
                bbox=dict(boxstyle='round,pad=0.3', fc='white', ec=color, lw=1.2))
ax.set_xlim(-4.5, 6.5)
ax.set_ylim(-4, 4)
ax.set_title('Graph 4: EduNetChain Security Architecture (Layered Defense)', fontsize=13, fontweight='bold', pad=12)
save(fig, 'graph4_security_layers.png')

# ── Graph 5: Radar Comparison ─────────────────────────────────────────────────
categories = ['Tamper\nDetection', 'Decentralized\nApproval', 'Public\nVerifiability',
              'Audit\nTrail', 'PII\nProtection', 'No Single\nPoint of Failure']
N_cat = len(categories)
traditional = [1, 1, 1, 1, 2, 1]
edunetchain  = [5, 5, 5, 5, 5, 5]
angles = np.linspace(0, 2*np.pi, N_cat, endpoint=False).tolist()
angles += angles[:1]
traditional += traditional[:1]
edunetchain  += edunetchain[:1]
fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True), facecolor=BG)
ax.set_facecolor(BG)
ax.plot(angles, traditional, 'o-', linewidth=2, color=RED,  label='Traditional System')
ax.fill(angles, traditional, alpha=0.15, color=RED)
ax.plot(angles, edunetchain,  'o-', linewidth=2, color=BLUE, label='EduNetChain')
ax.fill(angles, edunetchain,  alpha=0.15, color=BLUE)
ax.set_xticks(angles[:-1])
ax.set_xticklabels(categories, fontsize=11)
ax.set_ylim(0, 5.5)
ax.set_yticks([1, 2, 3, 4, 5])
ax.set_yticklabels(['1', '2', '3', '4', '5'], fontsize=8, color=GRAY)
ax.yaxis.grid(True, linestyle='--', alpha=0.4)
ax.xaxis.grid(True, linestyle='--', alpha=0.3)
ax.set_title('Graph 5: Traditional System vs EduNetChain\n(Feature Score Comparison — out of 5)',
             fontsize=13, fontweight='bold', pad=20)
ax.legend(loc='upper right', bbox_to_anchor=(1.35, 1.15), fontsize=11)
save(fig, 'graph5_comparison_radar.png')

# ── Graph 6: Credential Version Chain ────────────────────────────────────────
fig, ax = plt.subplots(figsize=(13, 4.5), facecolor=BG)
ax.set_facecolor(BG)
ax.axis('off')
blocks = [
    ('Genesis\n(Registration)', 'v1', '0x0000...0000', '0xa3f1...c82e', BLUE),
    ('Profile Update',          'v2', '0xa3f1...c82e', '0x7b2d...f19a', GREEN),
    ('Degree Change',           'v3', '0x7b2d...f19a', '0xd4e8...3301', PURPLE),
    ('Current State',           'v4', '0xd4e8...3301', '0x9c5a...77bf', ORANGE),
]
bw, bh = 2.4, 2.8
gap    = 0.65
start_x = 0.5
for i, (title, version, prev_hash, curr_hash, color) in enumerate(blocks):
    x = start_x + i * (bw + gap)
    y = 0.8
    rect = patches.FancyBboxPatch((x, y), bw, bh, boxstyle='round,pad=0.1',
                                   linewidth=2, edgecolor=color, facecolor='white', zorder=3)
    ax.add_patch(rect)
    ax.text(x+bw/2, y+bh-0.22, version,    ha='center', va='top', fontsize=14, fontweight='bold', color=color)
    ax.text(x+bw/2, y+bh-0.55, title,      ha='center', va='top', fontsize=8,  color='#374151')
    ax.text(x+bw/2, y+1.55,    'prevHash:', ha='center', fontsize=7.5, color=GRAY)
    ax.text(x+bw/2, y+1.25,    prev_hash,  ha='center', fontsize=7,   color=RED,   family='monospace')
    ax.text(x+bw/2, y+0.85,    'hash:',    ha='center', fontsize=7.5, color=GRAY)
    ax.text(x+bw/2, y+0.55,    curr_hash,  ha='center', fontsize=7,   color=color, family='monospace')
    if i < len(blocks) - 1:
        ax.annotate('', xy=(x+bw+gap, y+bh/2+0.8), xytext=(x+bw, y+bh/2+0.8),
                    arrowprops=dict(arrowstyle='->', color=GRAY, lw=2.2))
ax.text(6.5, 0.35,
        'Each version links to previous hash — immutable audit trail on Sepolia blockchain',
        ha='center', fontsize=9.5, color=GRAY, style='italic')
ax.set_xlim(0, 13)
ax.set_ylim(0, 4.5)
ax.set_title('Graph 6: Credential Version Chain (previousHash Linking)', fontsize=14, fontweight='bold', y=0.98)
save(fig, 'graph6_version_chain.png')

print('\nAll 6 graphs saved to:', OUT)
