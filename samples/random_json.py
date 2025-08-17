import os
import json
import uuid
from pathlib import Path
from random import randrange, choice, choices

CURRENT_FOLDER = Path(__file__).absolute().parent
OUTPUT_FILE = CURRENT_FOLDER / 'random.json'

SIBLINGS = 1000
DEPTH = 10

def main():
    json_text = json.dumps(build_json(DEPTH), indent=2)
    OUTPUT_FILE.write_text(json_text)

def build_json(depth):
    root = random_dict()
    stack = [(root, depth)]
    while stack:
        (current, remaining) = stack.pop()
        if remaining:
            child = random_dict()
            current[random_string()] = child
            stack.append((child, remaining - 1))
    return root

def random_dict():
    return {random_string(): random_value() for _ in range(SIBLINGS)}

def random_value():
    return choices([random_array, random_literal], [1, 10])[0]()

def random_array():
    return [random_literal() for _ in range(randrange(700))] 

def random_literal():
    return choice([random_string, random_number, random_boolean, null])()
    
def random_string():
    return str(uuid.uuid4())[:randrange(1, 32)] * randrange(1, 4)

def random_number():
    return randrange(1_000_000_000)

def random_boolean():
    return bool(randrange(2))

def null():
    return None

if __name__ == "__main__":
    main()