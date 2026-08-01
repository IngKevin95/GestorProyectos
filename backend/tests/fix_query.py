import json
with open('backend/tests/postman-ep001-crud.json', 'r', encoding='utf-8') as f:
    col = json.load(f)

for item in col['item']:
    if item['name'].startswith('GET /projects?estado=Activo'):
        url = item['request']['url']
        if 'raw' in url:
            url['raw'] = url['raw'].replace('estado=Activo', 'status=Activo')
        if 'query' in url:
            for q in url['query']:
                if q['key'] == 'estado':
                    q['key'] = 'status'
                    
        exec_script = item['event'][0]['script']['exec']
        new_exec = []
        for line in exec_script:
            line = line.replace("project.estado", "project.status")
            new_exec.append(line)
        item['event'][0]['script']['exec'] = new_exec

with open('backend/tests/postman-ep001-crud.json', 'w', encoding='utf-8') as f:
    json.dump(col, f, indent=2)

print('Query and status fixed')
