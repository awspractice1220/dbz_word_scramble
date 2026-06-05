from flask import Flask, render_template, jsonify, request
import random
import time

app = Flask(__name__)

# -----------------------------
# WORD LIST (we can expand later)
# -----------------------------
WORDS = [
    "dragon", "warrior", "saiyan", "fusion", "galaxy",
    "energy", "spirit", "battle", "legend", "eternal",
    "crystal", "power", "universe", "destiny", "shadow"
]

# -----------------------------
# GAME STATE (simple version)
# -----------------------------
game_state = {
    "score": 0,
    "difficulty": 1,
    "last_word": "",
    "start_time": time.time()
}

# -----------------------------
# SCRAMBLE FUNCTION
# -----------------------------
def scramble_word(word):
    letters = list(word)
    random.shuffle(letters)
    return "".join(letters)

# -----------------------------
# API: Get a new scrambled word
# -----------------------------
@app.route("/api/new-word")
def new_word():
    difficulty = game_state["difficulty"]

    # Increase word length based on difficulty
    filtered_words = [w for w in WORDS if len(w) >= difficulty + 4]

    if not filtered_words:
        filtered_words = WORDS

    word = random.choice(filtered_words)
    scrambled = scramble_word(word)

    game_state["last_word"] = word

    return jsonify({
        "scrambled": scrambled,
        "difficulty": difficulty
    })

# -----------------------------
# API: Check user answer
# -----------------------------
@app.route("/api/check-answer", methods=["POST"])
def check_answer():
    data = request.get_json()
    user_answer = data.get("answer", "").strip().lower()
    correct_word = game_state["last_word"]

    if user_answer == correct_word:
        game_state["score"] += 10 * game_state["difficulty"]
        game_state["difficulty"] += 1

        return jsonify({
            "correct": True,
            "score": game_state["score"],
            "difficulty": game_state["difficulty"]
        })

    return jsonify({
        "correct": False,
        "score": game_state["score"],
        "difficulty": game_state["difficulty"]
    })

# -----------------------------
# API: Get current score
# -----------------------------
@app.route("/api/score")
def get_score():
    return jsonify({
        "score": game_state["score"],
        "difficulty": game_state["difficulty"]
    })

# -----------------------------
# FRONTEND ROUTE
# -----------------------------
@app.route("/")
def index():
    return render_template("index.html")

# -----------------------------
# RUN APP
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
