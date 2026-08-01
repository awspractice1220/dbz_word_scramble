import os
import random
import time

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

CHARACTERS = [
    {"name": "goku", "hint": "The spirited Saiyan hero who never stops training.", "image": "/static/images/dbz01.png"},
    {"name": "vegeta", "hint": "The proud prince of all Saiyans with a fierce rivalry.", "image": "/static/images/dbz02.png"},
    {"name": "gohan", "hint": "The son of Goku who grows into a powerful protector.", "image": "/static/images/dbz01.png"},
    {"name": "trunks", "hint": "The half-Saiyan warrior with a bold sword style.", "image": "/static/images/dbz02.png"},
    {"name": "piccolo", "hint": "The Namekian strategist and guardian of Earth.", "image": "/static/images/dbz01.png"},
    {"name": "krillin", "hint": "The brave martial artist with a loyal heart.", "image": "/static/images/dbz01.png"},
    {"name": "bulma", "hint": "The brilliant scientist behind many of the team’s inventions.", "image": "/static/images/dbz02.png"},
    {"name": "frieza", "hint": "The galactic tyrant who commands fear and power.", "image": "/static/images/dbz02.png"},
    {"name": "cell", "hint": "The perfect android monster built for destruction.", "image": "/static/images/dbz02.png"},
    {"name": "beerus", "hint": "The god of destruction who loves good food and battle.", "image": "/static/images/dbz02.png"},
    {"name": "broly", "hint": "A legendary Saiyan known for unstoppable rage.", "image": "/static/images/dbz01.png"},
    {"name": "whis", "hint": "The wise angel who teaches discipline and balance.", "image": "/static/images/dbz02.png"},
    {"name": "goten", "hint": "The younger Saiyan child with a bright future.", "image": "/static/images/dbz01.png"},
    {"name": "android18", "hint": "The cool-headed android with incredible combat skill.", "image": "/static/images/dbz02.png"},
    {"name": "majinbuu", "hint": "A mischievous magical being with chaotic power.", "image": "/static/images/dbz02.png"},
]


game_state = {
    "score": 0,
    "difficulty": 1,
    "streak": 0,
    "combo": 1,
    "last_word": "",
    "last_hint": "",
    "last_message": "A new challenge is ready.",
    "start_time": time.time(),
}


def normalize_answer(value: str) -> str:
    return "".join(ch for ch in value.lower() if ch.isalnum())


def scramble_word(word: str) -> str:
    letters = list(word)
    shuffled = letters[:]
    while "".join(shuffled) == word:
        random.shuffle(shuffled)
    return "".join(shuffled)


def pick_character() -> dict:
    min_length = max(4, game_state["difficulty"] + 2)
    pool = [character for character in CHARACTERS if len(character["name"]) >= min_length]
    if not pool:
        pool = CHARACTERS
    return random.choice(pool)


@app.route("/api/new-word")
def new_word():
    character = pick_character()
    word = character["name"]
    scrambled = scramble_word(word)

    game_state["last_word"] = word
    game_state["last_hint"] = character["hint"]
    game_state["last_message"] = "Unscramble the name of this Dragon Ball hero."

    return jsonify({
        "scrambled": scrambled,
        "difficulty": game_state["difficulty"],
        "hint": character["hint"],
        "answer": word,
        "character_image": character["image"],
        "character_name": character["name"].upper(),
    })


@app.route("/api/check-answer", methods=["POST"])
def check_answer():
    data = request.get_json()
    user_answer = normalize_answer(data.get("answer", ""))
    correct_word = normalize_answer(game_state["last_word"])

    if user_answer == correct_word:
        game_state["combo"] = min(5, game_state["combo"] + 1)
        game_state["score"] += 10 + (game_state["difficulty"] * 5) + ((game_state["combo"] - 1) * 5)
        game_state["difficulty"] += 1
        game_state["streak"] += 1
        game_state["last_message"] = "Amazing! The Saiyan energy is rising."
        return jsonify({
            "correct": True,
            "score": game_state["score"],
            "difficulty": game_state["difficulty"],
            "streak": game_state["streak"],
            "combo": game_state["combo"],
            "message": game_state["last_message"],
        })

    game_state["combo"] = 1
    game_state["streak"] = 0
    game_state["last_message"] = "Not quite. Try another Dragon Ball legend."
    return jsonify({
        "correct": False,
        "score": game_state["score"],
        "difficulty": game_state["difficulty"],
        "streak": game_state["streak"],
        "message": game_state["last_message"],
    })


@app.route("/api/score")
def get_score():
    return jsonify({
        "score": game_state["score"],
        "difficulty": game_state["difficulty"],
        "streak": game_state["streak"],
        "combo": game_state["combo"],
        "message": game_state["last_message"],
    })


@app.route("/api/reset")
def reset_game():
    game_state.update({
        "score": 0,
        "difficulty": 1,
        "streak": 0,
        "combo": 1,
        "last_word": "",
        "last_hint": "",
        "last_message": "The arena has reset. A new challenge awaits.",
        "start_time": time.time(),
    })
    return jsonify({"status": "reset"})


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
