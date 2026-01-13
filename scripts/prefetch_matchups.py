
import json
import time
import urllib.request
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEROES_PATH = os.path.join(BASE_DIR, '../src/data/heroes.json')
MATCHUPS_OUTPUT_PATH = os.path.join(BASE_DIR, '../src/data/all_matchups.json')

def fetch_matchups():
    print("Loading heroes from", HEROES_PATH)
    with open(HEROES_PATH, 'r') as f:
        heroes = json.load(f)
    
    # Load existing progress
    all_matchups = {}
    if os.path.exists(MATCHUPS_OUTPUT_PATH):
        try:
            with open(MATCHUPS_OUTPUT_PATH, 'r') as f:
                all_matchups = json.load(f)
            print(f"Loaded existing data: {len(all_matchups)} heroes found.")
        except:
            print("Could not load existing file, starting fresh.")

    total = len(heroes)
    
    for i, hero in enumerate(heroes):
        hero_id = str(hero['id']) # JSON keys are strings
        int_id = hero['id']
        name = hero['localized_name']
        
        if str(int_id) in all_matchups or int_id in all_matchups:
            print(f"[{i+1}/{total}] Skipping {name} (already have).")
            continue

        print(f"[{i+1}/{total}] Fetching matchups for {name} (ID: {hero_id})...")
        
        url = f"https://api.opendota.com/api/heroes/{hero_id}/matchups"
        
        success = False
        retries = 3
        
        while not success and retries > 0:
            try:
                # 10 second timeout
                with urllib.request.urlopen(url, timeout=10) as response:
                    data = json.loads(response.read().decode())
                    all_matchups[hero_id] = data # use string key for consistency
                    success = True
            except Exception as e:
                print(f"  Error fetching {name}: {e}")
                if "429" in str(e):
                    print("  Hit Rate Limit. Sleeping 10s...")
                    time.sleep(10)
                retries -= 1
                time.sleep(2)
        
        if not success:
             print(f"FAILED to fetch {name} after retries.")

        # Save periodically (every 5) to save progress
        if (i+1) % 5 == 0:
             with open(MATCHUPS_OUTPUT_PATH, 'w') as f:
                json.dump(all_matchups, f)
        
        # 1.2s delay to stay under 60 reqs/min
        time.sleep(1.2)

    print(f"Saving final {len(all_matchups)} hero entries to {MATCHUPS_OUTPUT_PATH}...")
    with open(MATCHUPS_OUTPUT_PATH, 'w') as f:
        json.dump(all_matchups, f)
    
    print("Done!")

if __name__ == "__main__":
    fetch_matchups()
