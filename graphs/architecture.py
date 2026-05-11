import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ── Colors ────────────────────────────────────────────────────────────────────
C = {
    'bg':        '#0F172A',   # dark navy background
    'panel':     '#1E293B',   # panel bg
    'border':    '#334155',   # panel border
    'blue':      '#3B82F6',
    'blue_d':    '#1D4ED8',
    'green':     '#22C55E',
    'green_d':   '#15803D',
    'purple':    '#A855F7',
    'purple_d':  '#7E22CE',
    'orange':    '#F97316',
    'orange_d':  '#C2410C',
    'red':       '#EF4444',
    'red_d':     '#B91C1C',
    'teal':      '#14B8A6',
    'teal_d':    '#0F766E',
    'yellow':    '#EAB308',
    'white':     '#F1F5F9',
    'gray':      '#94A3B8',
    'gray_d':    '#475569',
}

fig = plt.figure(figsize=(22, 16), facecolor=C['bg'])
ax  = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, 22)
ax.set_ylim(0, 16)
ax.axis('off')
ax.set_facecolor(C['bg'])

# ─────────────────────────────────────────────────────────────────────────────
def box(ax, x, y, w, h, fc, ec, radius=0.25, alpha=1.0, lw=1.5):
    r = FancyBboxPatch((x, y), w, h,
                       boxstyle=f'round,pad={radius}',
                       facecolor=fc, edgecolor=ec,
                       linewidth=lw, alpha=alpha, zorder=3)
    ax.add_patch(r)
    return r

def label(ax, x, y, text, size=9, color=C['white'], bold=False, ha='center', va='center', zorder=5):
    ax.text(x, y, text, fontsize=size, color=color,
            fontweight='bold' if bold else 'normal',
            ha=ha, va=va, zorder=zorder,
            fontfamily='monospace' if '0x' in text else 'sans-serif')

def section_header(ax, x, y, w, h, fc, ec, title, icon=''):
    box(ax, x, y, w, h, fc, ec, radius=0.2, lw=2)
    label(ax, x+w/2, y+h-0.22, f'{icon}  {title}', size=10, bold=True, color=C['white'])

def arrow(ax, x1, y1, x2, y2, color=C['gray'], lw=1.5, style='->', bidirectional=False):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color,
                                lw=lw, connectionstyle='arc3,rad=0.0'))
    if bidirectional:
        ax.annotate('', xy=(x1, y1), xytext=(x2, y2),
                    arrowprops=dict(arrowstyle='->', color=color,
                                    lw=lw, connectionstyle='arc3,rad=0.0'))

def mini_box(ax, x, y, w, h, fc, ec, text, tsize=8, tcolor=C['white']):
    box(ax, x, y, w, h, fc+'33', ec, radius=0.15, lw=1.2)
    label(ax, x+w/2, y+h/2, text, size=tsize, color=tcolor)

# ═════════════════════════════════════════════════════════════════════════════
# TITLE
# ═════════════════════════════════════════════════════════════════════════════
label(ax, 11, 15.5, 'EduNetChain — System Architecture', size=17, bold=True, color=C['white'])
label(ax, 11, 15.1, 'Blockchain-Based Educational Credential Verification System', size=10, color=C['gray'])

# ═════════════════════════════════════════════════════════════════════════════
# LAYER 1 — FRONTEND (left column)
# ═════════════════════════════════════════════════════════════════════════════
section_header(ax, 0.3, 8.5, 4.8, 6.2, C['blue_d']+'44', C['blue'], 'FRONTEND LAYER', '🖥')

portals = [
    ('/login',             'Student Portal',     C['blue']),
    ('/alumni-login',      'Alumni Portal',      C['teal']),
    ('/validator-login',   'Validator Portal',   C['purple']),
    ('/super-admin-login', 'Super Admin Portal', C['red']),
    ('/recruiter',         'Recruiter Portal',   C['orange']),
    ('/verify-credential', 'Public Verify',      C['green']),
]
for i, (route, name, color) in enumerate(portals):
    yy = 13.2 - i * 0.72
    mini_box(ax, 0.55, yy, 4.3, 0.58, color, color, f'{name}\n{route}', tsize=7.5)

label(ax, 2.75, 8.75, 'React 19 + Vite  |  Tailwind CSS  |  Axios  |  React Router v6', size=7.5, color=C['gray'])

# ═════════════════════════════════════════════════════════════════════════════
# LAYER 2 — BACKEND API (center column)
# ═════════════════════════════════════════════════════════════════════════════
section_header(ax, 6.0, 4.2, 5.2, 10.5, C['purple_d']+'44', C['purple'], 'BACKEND API LAYER', '⚙')

label(ax, 8.6, 14.3, 'Node.js + Express.js 5  |  Port 5000', size=8, color=C['gray'])

# Middleware row
label(ax, 8.6, 13.85, 'MIDDLEWARE', size=7.5, bold=True, color=C['purple'])
mw = [('Helmet', C['red']), ('CORS', C['orange']), ('JWT Auth', C['blue']),
      ('Rate Limit\n200/15min', C['yellow']), ('Morgan\nLogger', C['gray_d'])]
for i, (m, c) in enumerate(mw):
    mini_box(ax, 6.15 + i*1.0, 13.3, 0.88, 0.48, c, c, m, tsize=6.5)

# Routes
label(ax, 8.6, 13.1, 'API ROUTES', size=7.5, bold=True, color=C['purple'])
routes = [
    ('/api/auth',      'Auth Routes',      C['blue']),
    ('/api/requests',  'Requests Routes',  C['green']),
    ('/api/admin',     'Admin Routes',     C['red']),
    ('/api/verify',    'Verify Routes',    C['teal']),
    ('/api/posts',     'Posts Routes',     C['orange']),
    ('/api/messages',  'Messages Routes',  C['purple']),
    ('/api/recruiter', 'Recruiter Routes', C['yellow']),
    ('/api/ai',        'AI Routes',        C['gray_d']),
    ('/api/users',     'Users Routes',     C['blue']),
    ('/api/comments',  'Comments Routes',  C['teal']),
]
for i, (route, name, color) in enumerate(routes):
    col = i % 2
    row = i // 2
    mini_box(ax, 6.15 + col*2.55, 12.55 - row*0.62, 2.4, 0.52, color, color,
             f'{name}  {route}', tsize=6.8)

# Services
label(ax, 8.6, 9.55, 'SERVICES', size=7.5, bold=True, color=C['purple'])
services = [
    ('chainService.js\nethers.js v6', C['green']),
    ('cryptoService.js\nkeccak256', C['blue']),
    ('consensusService.js\nfloor(N/2)+1', C['orange']),
    ('ipfs.js\nWeb3.Storage', C['teal']),
    ('email.js\nNodemailer', C['red']),
]
for i, (s, c) in enumerate(services):
    col = i % 3
    row = i // 3
    mini_box(ax, 6.15 + col*1.7, 8.85 - row*0.85, 1.58, 0.72, c, c, s, tsize=6.5)

# Models
label(ax, 8.6, 7.85, 'MONGOOSE MODELS', size=7.5, bold=True, color=C['purple'])
models = ['User', 'Request', 'Vote', 'Verification', 'CredentialVersion', 'Post', 'Message', 'Comment']
for i, m in enumerate(models):
    col = i % 4
    row = i // 4
    mini_box(ax, 6.15 + col*1.27, 7.25 - row*0.58, 1.18, 0.48, C['purple_d'], C['purple'], m, tsize=7)

label(ax, 8.6, 4.4, 'bcrypt (12 rounds)  |  JWT  |  Multer  |  compression  |  helmet', size=7.5, color=C['gray'])

# ═════════════════════════════════════════════════════════════════════════════
# LAYER 3 — DATABASE (bottom center)
# ═════════════════════════════════════════════════════════════════════════════
section_header(ax, 6.0, 0.4, 5.2, 3.6, C['teal_d']+'44', C['teal'], 'DATABASE LAYER', '🗄')

label(ax, 8.6, 3.55, 'MongoDB Atlas  |  Mongoose ODM', size=8.5, bold=True, color=C['teal'])
collections = [
    ('users\n(roles, hashes,\nwallet, nft)', C['blue']),
    ('requests\n(ADD/UPDATE,\napprovalCount)', C['green']),
    ('votes\n(requestId,\nvalidatorId)', C['orange']),
    ('credentialversions\n(hash, prevHash,\ntxHash)', C['purple']),
]
for i, (c, color) in enumerate(collections):
    col = i % 2
    row = i // 2
    mini_box(ax, 6.2 + col*2.55, 2.55 - row*1.0, 2.35, 0.88, color, color, c, tsize=7)

label(ax, 8.6, 0.62, 'Indexes: role+isVerified | skills | requestId+validatorId (unique)', size=7, color=C['gray'])

# ═════════════════════════════════════════════════════════════════════════════
# LAYER 4 — BLOCKCHAIN (right column)
# ═════════════════════════════════════════════════════════════════════════════
section_header(ax, 12.2, 7.5, 5.5, 7.2, C['green_d']+'44', C['green'], 'BLOCKCHAIN LAYER', '⛓')

label(ax, 14.95, 14.3, 'Ethereum Sepolia Testnet  |  Alchemy RPC', size=8, color=C['gray'])

# Smart contract box
box(ax, 12.45, 12.5, 5.0, 1.55, C['green_d']+'66', C['green'], radius=0.2, lw=2)
label(ax, 14.95, 13.75, 'Verification.sol  (Solidity 0.8.17)', size=9, bold=True, color=C['green'])
label(ax, 14.95, 13.38, '0x26E86BAB79C32Ad11Fe374A15e98aB2Cc6eE2fc5', size=7.5, color=C['yellow'])
label(ax, 14.95, 13.05, 'Deployed on Sepolia via Hardhat', size=7.5, color=C['gray'])

# Contract functions
label(ax, 14.95, 12.35, 'CONTRACT FUNCTIONS', size=7.5, bold=True, color=C['green'])
funcs = [
    ('issueCredential()\nwrite-once onlyOwner', C['green']),
    ('storeVerification()\nlegacy hash store', C['teal']),
    ('storeVersionedHash()\npreviousHash link', C['blue']),
    ('verifyHash()\npublic read', C['orange']),
    ('storePostHash()\npost integrity', C['purple']),
    ('verifyPostHash()\npublic read', C['yellow']),
]
for i, (f, c) in enumerate(funcs):
    col = i % 2
    row = i // 2
    mini_box(ax, 12.45 + col*2.52, 11.6 - row*0.88, 2.38, 0.78, c, c, f, tsize=7)

# Events
label(ax, 14.95, 9.0, 'EVENTS EMITTED', size=7.5, bold=True, color=C['green'])
events = ['CredentialIssued\n(student, dataHash, timestamp)',
          'VerificationStored\n(user, hash, timestamp)',
          'PostHashStored\n(postHash, timestamp)']
for i, e in enumerate(events):
    mini_box(ax, 12.45 + i*1.68, 8.2, 1.58, 0.72, C['green_d'], C['green'], e, tsize=6.5)

label(ax, 14.95, 7.72, 'onlyOwner guard  |  write-once issueCredential  |  public read', size=7.5, color=C['gray'])

# ═════════════════════════════════════════════════════════════════════════════
# LAYER 5 — EXTERNAL SERVICES (right bottom)
# ═════════════════════════════════════════════════════════════════════════════
section_header(ax, 12.2, 0.4, 5.5, 6.8, C['orange_d']+'44', C['orange'], 'EXTERNAL SERVICES', '☁')

ext = [
    ('Supabase Storage\nCertificates + Resumes\nFile Upload via Multer', C['green']),
    ('Alchemy RPC\nSepolia Testnet\nEthers.js JsonRpcProvider', C['blue']),
    ('Nodemailer\nSMTP Email\nApproval Notifications', C['red']),
    ('Web3.Storage\nIPFS (optional)\nDecentralized Docs', C['teal']),
    ('Hardhat\nContract Compile\n& Deploy Scripts', C['purple']),
    ('MongoDB Atlas\nCloud Database\nMongoose ODM', C['orange']),
]
for i, (e, c) in enumerate(ext):
    col = i % 2
    row = i // 2
    mini_box(ax, 12.35 + col*2.72, 5.85 - row*1.05, 2.55, 0.92, c, c, e, tsize=7)

label(ax, 14.95, 0.62, 'JWT_SECRET  |  DEPLOYER_PRIVATE_KEY  |  SUPER_ADMIN_KEY  →  .env', size=7, color=C['gray'])

# ═════════════════════════════════════════════════════════════════════════════
# CONSENSUS ENGINE (center bottom)
# ═════════════════════════════════════════════════════════════════════════════
section_header(ax, 6.0, 0.4, 5.2, 3.6, C['teal_d']+'44', C['teal'], 'DATABASE LAYER', '🗄')
# (already drawn above — now draw consensus flow box separately)

box(ax, 0.3, 0.4, 4.8, 7.8, C['orange_d']+'33', C['orange'], radius=0.2, lw=2)
label(ax, 2.75, 7.95, '🔄  CONSENSUS ENGINE', size=10, bold=True, color=C['orange'])
label(ax, 2.75, 7.55, 'consensusService.js', size=8, color=C['gray'])

steps_c = [
    ('1. Student submits\nADD / UPDATE request', C['blue']),
    ('2. Request saved\nin MongoDB', C['teal']),
    ('3. Validators see\nrequest in dashboard', C['purple']),
    ('4. Each validator\ncasts vote', C['orange']),
    ('5. floor(N/2)+1\nmajority check', C['yellow']),
    ('6. APPROVED →\nissueCredential()', C['green']),
    ('7. REJECTED →\nstudent notified', C['red']),
]
for i, (s, c) in enumerate(steps_c):
    mini_box(ax, 0.5, 6.85 - i*0.88, 4.4, 0.78, c, c, s, tsize=7.5)

# ═════════════════════════════════════════════════════════════════════════════
# ARROWS — Frontend ↔ Backend
# ═════════════════════════════════════════════════════════════════════════════
arrow(ax, 5.1, 11.5, 6.0, 11.5, color=C['blue'], lw=2, bidirectional=True)
label(ax, 5.55, 11.75, 'HTTP\nAxios', size=7, color=C['blue'])

# Backend ↔ Database
arrow(ax, 8.6, 4.2, 8.6, 4.0, color=C['teal'], lw=2, bidirectional=True)

# Backend ↔ Blockchain
arrow(ax, 11.2, 10.5, 12.2, 10.5, color=C['green'], lw=2, bidirectional=True)
label(ax, 11.7, 10.75, 'ethers.js\nv6', size=7, color=C['green'])

# Backend ↔ External
arrow(ax, 11.2, 8.0, 12.2, 8.0, color=C['orange'], lw=2)
label(ax, 11.7, 8.25, 'Supabase\nSDK', size=7, color=C['orange'])

# Consensus → Backend
arrow(ax, 5.1, 4.5, 6.0, 6.5, color=C['orange'], lw=1.5)

# ═════════════════════════════════════════════════════════════════════════════
# TAMPER DETECTION FLOW (annotation box)
# ═════════════════════════════════════════════════════════════════════════════
box(ax, 17.9, 10.5, 3.8, 5.1, C['red_d']+'44', C['red'], radius=0.2, lw=2)
label(ax, 19.8, 15.3, '🔍 TAMPER DETECTION', size=9, bold=True, color=C['red'])
td = [
    '1. Fetch student data\n   from MongoDB',
    '2. Re-generate\n   keccak256 hash',
    '3. Query blockchain\n   getVerifications(wallet)',
    '4. Compare hashes',
    '✅ Match → VALID',
    '⚠  Mismatch → TAMPERED',
]
for i, t in enumerate(td):
    c = C['green'] if '✅' in t else (C['red'] if '⚠' in t else C['white'])
    label(ax, 19.8, 14.9 - i*0.72, t, size=8, color=c)

# ═════════════════════════════════════════════════════════════════════════════
# CREDENTIAL VERSION CHAIN (annotation box)
# ═════════════════════════════════════════════════════════════════════════════
box(ax, 17.9, 4.5, 3.8, 5.7, C['purple_d']+'44', C['purple'], radius=0.2, lw=2)
label(ax, 19.8, 9.9, '📦 CREDENTIAL VERSIONING', size=9, bold=True, color=C['purple'])
label(ax, 19.8, 9.5, 'CredentialVersion.sol', size=7.5, color=C['gray'])
vc = [
    ('v1  hash: 0xa3f1...', '0x0000... (genesis)', C['blue']),
    ('v2  hash: 0x7b2d...', 'prev: 0xa3f1...', C['green']),
    ('v3  hash: 0xd4e8...', 'prev: 0x7b2d...', C['purple']),
    ('v4  hash: 0x9c5a...', 'prev: 0xd4e8...', C['orange']),
]
for i, (h, p, c) in enumerate(vc):
    mini_box(ax, 18.05, 8.85 - i*1.0, 3.5, 0.82, c, c, f'{h}\n{p}', tsize=7)

label(ax, 19.8, 4.72, 'Immutable chain — each update\nlinks to previous hash on Sepolia', size=7.5, color=C['gray'])

# ═════════════════════════════════════════════════════════════════════════════
# LEGEND
# ═════════════════════════════════════════════════════════════════════════════
box(ax, 17.9, 0.4, 3.8, 3.8, C['panel'], C['border'], radius=0.2, lw=1.5)
label(ax, 19.8, 3.95, 'LEGEND', size=9, bold=True, color=C['white'])
legend_items = [
    (C['blue'],   'Frontend (React + Vite)'),
    (C['purple'], 'Backend (Express.js)'),
    (C['teal'],   'Database (MongoDB)'),
    (C['green'],  'Blockchain (Sepolia)'),
    (C['orange'], 'External Services'),
    (C['red'],    'Security / Tamper Detection'),
    (C['yellow'], 'Smart Contract Address'),
]
for i, (c, txt) in enumerate(legend_items):
    mini_box(ax, 18.05, 3.45 - i*0.43, 0.35, 0.32, c, c, '', tsize=1)
    label(ax, 18.6, 3.61 - i*0.43, txt, size=7.5, color=C['white'], ha='left')

# ═════════════════════════════════════════════════════════════════════════════
# SAVE
# ═════════════════════════════════════════════════════════════════════════════
path = os.path.join(OUT, 'system_architecture.png')
fig.savefig(path, dpi=180, bbox_inches='tight', facecolor=C['bg'])
print(f'Saved: {path}')
plt.close(fig)
