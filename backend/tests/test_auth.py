import sys
import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.auth import signup_user, login_user

class BackendTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_security_hashing_and_verification(self):
        password = 'SecurePassword123!'
        hashed = hash_password(password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password('WrongPassword', hashed))
        self.assertFalse(verify_password('', hashed))
        self.assertFalse(verify_password(password, ''))
        self.assertFalse(verify_password(password, 'invalid_corrupted_hash'))

    def test_02_token_creation_and_decoding(self):
        user_id = 999
        token = create_access_token(user_id)
        self.assertIsInstance(token, str)
        payload = decode_access_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload.get('sub'), str(user_id))

        invalid_payload = decode_access_token('not.a.valid.jwt.token')
        self.assertIsNone(invalid_payload)

    def test_03_services_signup_and_normalization(self):
        test_email = 'TestUser@Example.Com'
        existing = self.db.query(User).filter(User.email == 'testuser@example.com').first()
        if existing:
            self.db.delete(existing)
            self.db.commit()

        user = signup_user(
            db=self.db,
            email=test_email,
            password='StrongPassword123!',
            name='Test Guardian',
            phone='+919876543210'
        )
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'testuser@example.com')
        self.assertEqual(user.name, 'Test Guardian')
        self.assertEqual(user.phone, '+919876543210')

        dup_user = signup_user(
            db=self.db,
            email='testuser@example.com',
            password='AnotherPassword123!'
        )
        self.assertIsNone(dup_user)

    def test_04_services_login(self):
        res = login_user(self.db, 'TESTUSER@EXAMPLE.COM', 'StrongPassword123!')
        self.assertIsNotNone(res)
        token, user = res
        self.assertEqual(user.email, 'testuser@example.com')
        self.assertIsInstance(token, str)

        self.assertIsNone(login_user(self.db, 'testuser@example.com', 'WrongPassword!'))

        user.is_active = False
        self.db.commit()
        self.assertIsNone(login_user(self.db, 'testuser@example.com', 'StrongPassword123!'))
        
        user.is_active = True
        self.db.commit()

    def test_05_api_root_and_health(self):
        res_root = self.client.get('/')
        self.assertEqual(res_root.status_code, 200)
        self.assertIn('Silambu API is running', res_root.json().get('message', ''))

        res_health = self.client.get('/health')
        self.assertEqual(res_health.status_code, 200)
        self.assertEqual(res_health.json().get('status'), 'healthy')

    def test_06_api_signup_endpoint(self):
        clean_user = self.db.query(User).filter(User.email == 'apiguardian@example.com').first()
        if clean_user:
            self.db.delete(clean_user)
            self.db.commit()

        payload = {
            'name': 'API Guardian',
            'email': 'APIGuardian@Example.Com',
            'phone': '+911234567890',
            'password': 'SecurePassWord123!'
        }
        res = self.client.post('/api/v1/auth/signup', json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['email'], 'apiguardian@example.com')
        self.assertEqual(data['name'], 'API Guardian')
        self.assertEqual(data['phone'], '+911234567890')
        self.assertTrue(data['is_active'])

        # Duplicate signup
        res_dup = self.client.post('/api/v1/auth/signup', json=payload)
        self.assertEqual(res_dup.status_code, 400)
        self.assertIn('Email already registered', res_dup.json().get('detail', ''))

        # Validation errors (short password)
        res_short = self.client.post('/api/v1/auth/signup', json={
            'email': 'valid@example.com',
            'password': 'short'
        })
        self.assertEqual(res_short.status_code, 422)

    def test_07_api_login_endpoint(self):
        # Valid login
        res = self.client.post('/api/v1/auth/login', json={
            'email': 'apiguardian@example.com',
            'password': 'SecurePassWord123!'
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('access_token', data)
        self.assertEqual(data['token_type'], 'bearer')
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], 'apiguardian@example.com')
        self.assertEqual(data['user']['name'], 'API Guardian')

        # Invalid login
        res_invalid = self.client.post('/api/v1/auth/login', json={
            'email': 'apiguardian@example.com',
            'password': 'WrongPassword999!'
        })
        self.assertEqual(res_invalid.status_code, 401)

    def test_08_api_me_endpoint(self):
        login_res = self.client.post('/api/v1/auth/login', json={
            'email': 'apiguardian@example.com',
            'password': 'SecurePassWord123!'
        })
        token = login_res.json()['access_token']

        # Missing token
        res_no_token = self.client.get('/api/v1/auth/me')
        self.assertEqual(res_no_token.status_code, 401)

        # Invalid token
        res_bad_token = self.client.get('/api/v1/auth/me', headers={'Authorization': 'Bearer badtoken123'})
        self.assertEqual(res_bad_token.status_code, 401)

        # Valid token
        res_me = self.client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res_me.status_code, 200)
        user_data = res_me.json()
        self.assertEqual(user_data['email'], 'apiguardian@example.com')
        self.assertEqual(user_data['name'], 'API Guardian')
        self.assertEqual(user_data['phone'], '+911234567890')

    def test_09_api_google_auth_url(self):
        res = self.client.get('/api/v1/auth/google/url')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('url', data)
        self.assertIn('accounts.google.com', data['url'])

    def test_10_api_google_auth_endpoint(self):
        # 1. New Google user via dev token
        payload = {
            'id_token': 'dev-test-token-1',
            'email': 'google.test@example.com',
            'name': 'Google Test User',
            'picture': 'https://example.com/avatar.png'
        }
        res = self.client.post('/api/v1/auth/google', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn('access_token', data)
        self.assertEqual(data['user']['email'], 'google.test@example.com')
        self.assertEqual(data['user']['name'], 'Google Test User')
        self.assertEqual(data['user']['google_id'], 'dev-google-dev-test-token-1')

        # 2. Re-login with same Google user
        res_relogin = self.client.post('/api/v1/auth/google', json=payload)
        self.assertEqual(res_relogin.status_code, 200)
        data_relogin = res_relogin.json()
        self.assertEqual(data_relogin['user']['id'], data['user']['id'])

        # 3. Invalid / empty token
        res_invalid = self.client.post('/api/v1/auth/google', json={'id_token': ''})
        self.assertEqual(res_invalid.status_code, 400)


if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(BackendTestSuite)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)