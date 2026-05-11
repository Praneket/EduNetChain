import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import os

OUT = os.path.dirname(os.path.abspath(__file__))

fig, ax = plt.subplots(figsize=(7, 14))
fig.patch.set_facecolor('white')
ax.set_facecolor('white')
ax.set_xlim(0, 7)
ax.set_ylim(0, 14)
ax.axis('off')

def box(x, y, w, h, fc='white'):
    ax.add_patch(FancyBboxPatch((x, y), w, h,
        boxstyle='square,pad=0', facecolor=fc,
        edgecolor='black', linewidth=1.4, zorder=3))

def diamond(cx, cy, hw=1.4, hh=0.4):
    xs = [cx, cx+hw, cx, cx-hw, cx]
    ys = [cy+hh, cy, cy-hh, cy, cy+hh]
    ax.fill(xs, ys, facecolor='white', edgecolor='black', linewidth=1.4, zorder=3)

def txt(x, y, s, size=9, bold=False, ha='center'):
    ax.text(x, y, s, fontsize=size, fontweight='bold' if bold else 'normal',
            ha=ha, va='center', color='black', zorder=4)

def arr(x, y1, y2):
    ax.annotate('', xy=(x, y2), xytext=(x, y1),
                arrowprops=dict(arrowstyle='->', color='black', lw=1.3))

def side_arr(x1, y, x2):
    ax.annotate('', xy=(x2, y), xytext=(x1, y),
                arrowprops=dict(arrowstyle='->', color='black', lw=1.3))

# ── Title ─────────────────────────────────────────────────────────────────────
txt(3.5, 13.7, 'EduNetChain - System Flowchart', size=12, bold=True)

# ── 1. User ───────────────────────────────────────────────────────────────────
box(1.5, 12.8, 4.0, 0.6, fc='#eeeeee')
txt(3.5, 13.1, 'User  (Student / Alumni / Validator)', size=9, bold=True)
arr(3.5, 12.8, 12.35)

# ── 2. Frontend ───────────────────────────────────────────────────────────────
box(1.5, 11.7, 4.0, 0.6, fc='#f5f5f5')
txt(3.5, 12.05, 'Frontend', size=9, bold=True)
txt(3.5, 11.82, 'React 19 + Vite  |  Tailwind CSS', size=8)
arr(3.5, 11.7, 11.25)
txt(3.75, 11.48, 'Axios HTTP Request', size=7.5, ha='left')

# ── 3. Backend ────────────────────────────────────────────────────────────────
box(1.5, 10.6, 4.0, 0.6, fc='white')
txt(3.5, 10.95, 'Backend API', size=9, bold=True)
txt(3.5, 10.72, 'Node.js + Express.js  |  JWT  |  bcrypt', size=8)
arr(3.5, 10.6, 10.15)

# ── 4. Auth diamond ───────────────────────────────────────────────────────────
diamond(3.5, 9.75)
txt(3.5, 9.75, 'Authenticated?', size=8.5, bold=True)

# NO → right
side_arr(4.9, 9.75, 6.2)
txt(5.55, 9.88, 'NO', size=8)
box(5.5, 9.45, 1.4, 0.55, fc='#eeeeee')
txt(6.2, 9.72, 'Reject', size=8)

# YES → down
arr(3.5, 9.35, 8.85)
txt(3.75, 9.1, 'YES', size=8, ha='left')

# ── 5. MongoDB ────────────────────────────────────────────────────────────────
box(1.5, 8.2, 4.0, 0.6, fc='#f5f5f5')
txt(3.5, 8.55, 'MongoDB Atlas', size=9, bold=True)
txt(3.5, 8.32, 'Store / Retrieve Data  (Users, Requests, Votes)', size=8)
arr(3.5, 8.2, 7.75)

# ── 6. Consensus diamond ──────────────────────────────────────────────────────
diamond(3.5, 7.35)
txt(3.5, 7.35, 'Validators Approved?', size=8.5, bold=True)

# NO → right
side_arr(4.9, 7.35, 6.2)
txt(5.55, 7.48, 'NO', size=8)
box(5.5, 7.05, 1.4, 0.55, fc='#eeeeee')
txt(6.2, 7.32, 'Pending', size=8)

# YES → down
arr(3.5, 6.95, 6.45)
txt(3.75, 6.7, 'YES', size=8, ha='left')

# ── 7. Hashing ────────────────────────────────────────────────────────────────
box(1.5, 5.8, 4.0, 0.6, fc='white')
txt(3.5, 6.15, 'keccak256 Hashing', size=9, bold=True)
txt(3.5, 5.92, 'Hash name, email, degree, institution, resume', size=8)
arr(3.5, 5.8, 5.35)

# ── 8. Blockchain ─────────────────────────────────────────────────────────────
box(1.5, 4.7, 4.0, 0.6, fc='#f5f5f5')
txt(3.5, 5.05, 'Blockchain  (Ethereum Sepolia)', size=9, bold=True)
txt(3.5, 4.82, 'issueCredential()  |  Store hashes  |  onlyOwner', size=8)
arr(3.5, 4.7, 4.25)

# ── 9. Tamper diamond ─────────────────────────────────────────────────────────
diamond(3.5, 3.85)
txt(3.5, 3.85, 'Hash Matches On-chain?', size=8.5, bold=True)

# NO → right
side_arr(4.9, 3.85, 6.2)
txt(5.55, 3.98, 'NO', size=8)
box(5.5, 3.55, 1.4, 0.55, fc='#eeeeee')
txt(6.2, 3.82, 'TAMPERED', size=8)

# YES → down
arr(3.5, 3.45, 2.95)
txt(3.75, 3.2, 'YES', size=8, ha='left')

# ── 10. End ───────────────────────────────────────────────────────────────────
box(1.5, 2.3, 4.0, 0.6, fc='#eeeeee')
txt(3.5, 2.65, 'Credential Verified', size=9, bold=True)
txt(3.5, 2.42, 'Student Dashboard Unlocked', size=8)

# ── Supabase side note ────────────────────────────────────────────────────────
ax.plot([1.5, 0.8, 0.8, 1.5], [10.9, 10.9, 8.5, 8.5],
        color='black', lw=1.0, linestyle='dashed')
txt(0.4, 9.7, 'Supabase\nStorage\n(files)', size=7.5)

# ── Save ──────────────────────────────────────────────────────────────────────
path = os.path.join(OUT, 'system_architecture.png')
fig.savefig(path, dpi=180, bbox_inches='tight', facecolor='white')
print('Saved:', path)
plt.close(fig)
