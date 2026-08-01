import json
import uuid
import os
import sys

# Reset back
with open('backend/tests/postman-ep001-crud.json', 'r', encoding='utf-8') as f:
    col = json.load(f)

for item in col['item']:
    url = item['request']['url']
    if 'raw' in url:
        url['raw'] = url['raw'].replace('v{{project_id}}', 'v1')
    if 'path' in url:
        url['path'] = [p.replace('v{{project_id}}', 'v1') for p in url['path']]

with open('backend/tests/postman-ep001-crud.json', 'w', encoding='utf-8') as f:
    json.dump(col, f, indent=2)

print('Path fixed')
