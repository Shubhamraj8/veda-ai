import os
import re
import csv

# 1. Load export map
symbol_map = {}
with open('tmp_export_map.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) == 2:
            symbol_map[row[0]] = row[1]

def get_relative_path(from_file: str, to_file: str) -> str:
    # Normalize paths
    from_dir = os.path.dirname(os.path.abspath(from_file))
    to_file_abs = os.path.abspath(to_file)
    
    # Calculate relative path
    rel_path = os.path.relpath(to_file_abs, from_dir)
    rel_path = rel_path.replace('\\', '/')
    
    # Remove .ts extension and prepend ./ if needed
    base, ext = os.path.splitext(rel_path)
    if ext == '.ts':
        # Use only the base path to remove the extension
        rel_path = base
    if not rel_path.startswith('.'):
        rel_path = './' + rel_path
    return rel_path

# 2. Iterate over src files
src_dir = os.path.abspath('src')
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            changed = False
            new_lines = []
            for line in lines:
                # Find lines like: import { Symbol1, Symbol2 } from '';
                match = re.search(r"import\s+\{([^}]+)\}\s+from\s+'';", line)
                if match:
                    symbols_raw = match.group(1).split(',')
                    symbols = [s.strip().split()[-1] for s in symbols_raw if s.strip()] # handle "type Symbol"
                    
                    found_path = None
                    for s in symbols:
                        if s in symbol_map:
                            target_file = symbol_map[s]
                            found_path = get_relative_path(path, target_file)
                            break
                    
                    if found_path:
                        line = re.sub(r"from\s+'';", f"from '{found_path}';", line)
                        changed = True
                
                # Handle default imports: import symbol from '';
                match_default = re.search(r"import\s+(\w+)\s+from\s+'';", line)
                if match_default and not match:
                    symbol = match_default.group(1)
                    # We might need to guess the file if it's a default export we missed.
                    # But most of these should be in our map if they are named exports elsewhere.
                    if symbol in symbol_map:
                        target_file = symbol_map[symbol]
                        found_path = get_relative_path(path, target_file)
                        line = re.sub(r"from\s+'';", f"from '{found_path}';", line)
                        changed = True

                new_lines.append(line)
            
            if changed:
                with open(path, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                print(f"Repaired {path}")
