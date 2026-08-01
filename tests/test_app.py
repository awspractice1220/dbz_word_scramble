import unittest

from app import app


class DbzWordScrambleTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_new_word_returns_scramble_and_hint(self):
        response = self.client.get('/api/new-word')
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn('scrambled', payload)
        self.assertIn('hint', payload)
        self.assertIn('answer', payload)
        self.assertGreaterEqual(payload['difficulty'], 1)

    def test_check_answer_updates_score(self):
        self.client.get('/api/new-word')
        score_before = self.client.get('/api/score').get_json()['score']
        answer_response = self.client.post('/api/check-answer', json={'answer': 'goku'})
        self.assertEqual(answer_response.status_code, 200)
        score_after = self.client.get('/api/score').get_json()['score']
        self.assertGreaterEqual(score_after, score_before)


if __name__ == '__main__':
    unittest.main()
