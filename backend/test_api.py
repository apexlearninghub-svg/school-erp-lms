import requests

base_url = 'https://school-erp-lms.onrender.com/api'
email = 'tester_teacher_ai_124@gmail.com'
password = 'Password123!'

# Login
res = requests.post(f'{base_url}/auth/login', json={'identifier': email, 'password': password})
token = res.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}

# Generate Mock Test
res = requests.post(f'{base_url}/generate-test', json={'title': 'Test 2', 'subject': 'Math', 'difficulty': 'easy', 'count': 5, 'prompt': ''}, headers=headers)
print('Generate Test:', res.status_code)
test_data = res.json().get('test')
test_id = test_data['id']

# Edit Test
res = requests.put(f'{base_url}/tests/{test_id}', json=test_data, headers=headers)
print('Edit Test:', res.status_code, res.text)

# Publish Test
res = requests.post(f'{base_url}/publish-test', json={'test_id': test_id, 'classes': ['Class 1']}, headers=headers)
print('Publish Test:', res.status_code, res.text)
