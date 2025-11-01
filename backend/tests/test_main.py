import unittest
from app.main import app

class MoodTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_status(self):
        response = self.client.get('/status')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'API running', response.data)

if __name__ == '__main__':
    unittest.main()
