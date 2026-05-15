import os
import re

def update_controller(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # 1. Replace hardcoded tenant queries (Create/GetById endpoints usually)
    new_content = re.sub(
        r'var tenantId\s*=\s*await _db\.Tenants.*?FirstOrDefaultAsync\(\);\s*(?:if\s*\(tenantId\s*==\s*0\)\s*tenantId\s*=\s*1;)?',
        r'var tenantIdStr = User.FindFirstValue(\"tenant_id\");\n            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();',
        new_content, flags=re.DOTALL
    )
    
    new_content = re.sub(
        r'var buyerTenantId\s*=\s*await _db\.Tenants.*?FirstOrDefaultAsync\(\);\s*(?:if\s*\(buyerTenantId\s*==\s*0\)\s*buyerTenantId\s*=\s*1;)?',
        r'var tenantIdStr = User.FindFirstValue(\"tenant_id\");\n            if (!int.TryParse(tenantIdStr, out var buyerTenantId)) return Unauthorized();',
        new_content, flags=re.DOTALL
    )

    new_content = re.sub(
        r'var userId\s*=\s*await _db\.TenantUsers\.*?FirstOrDefaultAsync\(\);',
        r'var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);\n            if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();',
        new_content, flags=re.DOTALL
    )
    
    # 2. Inject tenant filtering into GetAll endpoints
    # Finds "public async Task<IActionResult> GetAll()" and modifies it
    def inject_getall(match):
        body = match.group(0)
        
        # Prevent double-injection
        if 'FindFirstValue(\"tenant_id\")' in body:
            return body
            
        preamble = 'var tenantIdStr = User.FindFirstValue(\"tenant_id\");\\n            if (!int.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();\\n            '
        
        # Inject preamble at start of block
        body = re.sub(r'{\s*(var list = await _db\.[a-zA-Z]+)', r'{\n            ' + preamble + r'\1\n                .Where(x => x.TenantID == tenantId || x.VendorTenantID == tenantId)', body)
        return body

    new_content = re.sub(r'public async Task<IActionResult> GetAll\(\)\s*\{.*?(?=return Ok|return\s+NotFound)', inject_getall, new_content, flags=re.DOTALL)

    if new_content != content:
        if \"using System.Security.Claims;\" not in new_content:
            new_content = \"using System.Security.Claims;\\n\" + new_content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f\"Updated {filepath}\")

for root, _, files in os.walk('Proqrli/Controllers'):
    for file in files:
        if file.endswith('.cs'):
            update_controller(os.path.join(root, file))
