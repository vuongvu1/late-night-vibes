import os
import subprocess

def generate_static():
    # Get the directory of the current script to handle absolute paths if needed
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_dir = os.path.join(base_dir, "src/assets/gifs")
    target_dir = os.path.join(base_dir, "src/assets/static")

    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)

    for filename in os.listdir(src_dir):
        if filename.endswith((".gif", ".webp")):
            input_path = os.path.join(src_dir, filename)
            # Use same filename but in static folder, change extension to .jpg for static
            output_filename = os.path.splitext(filename)[0] + ".jpg"
            output_path = os.path.join(target_dir, output_filename)

            if os.path.exists(output_path):
                # Optionally check if gif is newer than jpg
                continue

            print(f"Generating static for {filename}...")
            # Extract first frame [0]
            cmd = ["magick", f"{input_path}[0]", output_path]
            try:
                subprocess.run(cmd, check=True)
            except subprocess.CalledProcessError as e:
                print(f"Error processing {filename}: {e}")
            except FileNotFoundError:
                print("Error: 'magick' (ImageMagick) command not found. Please install it.")
                break

if __name__ == "__main__":
    generate_static()
