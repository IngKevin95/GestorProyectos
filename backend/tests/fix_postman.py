import json
import uuid

with open('backend/tests/postman-ep001-crud.json', 'r', encoding='utf-8') as f:
    col = json.load(f)

for item in col['item']:
    # Fix POST request body
    if item['name'].startswith('POST /projects - Create'):
        body = json.loads(item['request']['body']['raw'])
        body['name'] = body.pop('nombre', 'Proyecto Test')
        body['total_effort'] = 100
        item['request']['body']['raw'] = json.dumps(body)
        
        # Add test script to save id and version
        exec_script = item['event'][0]['script']['exec']
        # Also fix test assertions 'nombre' -> 'name'
        new_exec = []
        for line in exec_script:
            line = line.replace("property('nombre')", "property('name')")
            new_exec.append(line)
        new_exec.extend([
            "if (pm.response.code === 201) {",
            "  const jsonData = pm.response.json();",
            "  pm.collectionVariables.set('project_id', jsonData.id);",
            "  pm.collectionVariables.set('project_version', jsonData.version);",
            "}"
        ])
        item['event'][0]['script']['exec'] = new_exec
        
    elif item['name'].startswith('POST /projects - Validation'):
        body = json.loads(item['request']['body']['raw'])
        body['name'] = body.pop('nombre', 'Proyecto Sin Responsable')
        body['total_effort'] = 100
        item['request']['body']['raw'] = json.dumps(body)
        
    # Replace /1 with /{{project_id}}
    url = item['request']['url']
    if 'raw' in url:
        url['raw'] = url['raw'].replace('/1', '/{{project_id}}')
    if 'path' in url:
        url['path'] = [p.replace('1', '{{project_id}}') for p in url['path']]
        
    # Replace /99999 with a random UUID
    random_uuid = str(uuid.uuid4())
    if 'raw' in url:
        url['raw'] = url['raw'].replace('/99999', '/' + random_uuid)
    if 'path' in url:
        url['path'] = [p.replace('99999', random_uuid) for p in url['path']]

    # Fix PUT request body
    if item['name'].startswith('PUT /projects'):
        item['request']['body']['raw'] = '{"estado":"En Pausa","siguiente_paso":"Esperar feedback","version":{{project_version}}}'

    # Fix assertions in GET detail
    if item['name'].startswith('GET /projects/{id} - Get detail'):
        exec_script = item['event'][0]['script']['exec']
        new_exec = []
        for line in exec_script:
            line = line.replace("property('nombre')", "property('name')")
            new_exec.append(line)
        item['event'][0]['script']['exec'] = new_exec

with open('backend/tests/postman-ep001-crud.json', 'w', encoding='utf-8') as f:
    json.dump(col, f, indent=2)

print('Tests fixed')
