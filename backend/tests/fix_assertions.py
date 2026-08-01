import json
with open('backend/tests/postman-ep001-crud.json', 'r', encoding='utf-8') as f:
    col = json.load(f)

for item in col['item']:
    # Fix 'estado' -> 'status' in test scripts
    if 'event' in item:
        exec_script = item['event'][0]['script']['exec']
        new_exec = []
        for line in exec_script:
            line = line.replace("property('estado')", "property('status')")
            line = line.replace("jsonData.estado", "jsonData.status")
            # Fix list array assertions
            if "pm.expect(jsonData).to.be.an('array');" in line:
                line = "  pm.expect(jsonData.data).to.be.an('array');"
            
            if "jsonData.forEach(function(project)" in line:
                line = "  jsonData.data.forEach(function(project) {"
                
            new_exec.append(line)
        item['event'][0]['script']['exec'] = new_exec

with open('backend/tests/postman-ep001-crud.json', 'w', encoding='utf-8') as f:
    json.dump(col, f, indent=2)

print('Assertions fixed')
