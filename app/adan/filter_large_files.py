import os
import shutil
from pathlib import Path

# =================CONFIGURATION=================
# Define the threshold for what you consider a "large file".
# Currently set to 100 MB. Change this number if you want.
SIZE_THRESHOLD_MB = 100

# The name of the folder where large files will be moved.
# Putting an underscore at the start keeps it at the top of your file list.
TARGET_FOLDER_NAME = "_LargeFilesToReview"
# ===============================================


def get_downloads_folder():
    """Attempts to locate the Downloads folder cross-platform."""
    home = Path.home()
    # Typical locations for Windows and macOS/Linux
    possible_paths = [
        home / "Downloads",
        home / "downloads"
    ]
    for path in possible_paths:
        if path.exists() and path.is_dir():
            return path
    raise FileNotFoundError("Could not automatically locate your Downloads folder.")

def generate_unique_name(target_path, filename):
    """
    Handles duplicate filenames. If 'video.mp4' exists in the target folder,
    it generates 'video_1.mp4', 'video_2.mp4', etc.
    """
    base_name = target_path / filename
    if not base_name.exists():
        return base_name
    
    stem = base_name.stem
    suffix = base_name.suffix
    counter = 1
    while True:
        new_name = target_path / f"{stem}_{counter}{suffix}"
        if not new_name.exists():
            return new_name
        counter += 1

def organize_large_files():
    # Convert threshold to bytes
    threshold_bytes = SIZE_THRESHOLD_MB * 1024 * 1024
    
    try:
        downloads_path = get_downloads_folder()
        print(f"Scanning Downloads folder: {downloads_path}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return

    # Define target path
    target_path = downloads_path / TARGET_FOLDER_NAME

    # Create the target directory if it doesn't exist
    if not target_path.exists():
        target_path.mkdir()
        print(f"Created target folder: {target_path.name}")
    else:
        print(f"Target folder exists: {target_path.name}")

    print(f"\nLooking for files larger than {SIZE_THRESHOLD_MB} MB...")
    print("-" * 50)

    moved_count = 0
    moved_size_bytes = 0

    # Iterate through items in the Downloads folder
    for item in downloads_path.iterdir():
        # Skip directories (including our target directory)
        if item.is_dir():
            continue

        try:
            # Get file size
            file_size = item.stat().st_size

            if file_size > threshold_bytes:
                size_mb = file_size / (1024 * 1024)
                print(f"Found: {item.name} ({size_mb:.2f} MB)")
                
                # Determine destination path with duplicate handling
                destination = generate_unique_name(target_path, item.name)
                
                # Move the file
                shutil.move(str(item), str(destination))
                print(f" -> Moved to: {destination.name}")
                
                moved_count += 1
                moved_size_bytes += file_size
        except PermissionError:
             print(f" [!] Permission denied accessing: {item.name}. Skipping.")
        except Exception as e:
             print(f" [!] Error moving {item.name}: {e}")

    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    total_moved_mb = moved_size_bytes / (1024 * 1024)
    print(f"Completed. Moved {moved_count} files.")
    print(f"Total space ready for review: {total_moved_mb:.2f} MB")
    print(f"Check the folder: {target_path}")
    print("="*50)

if __name__ == "__main__":
    # This ensures the script runs when executed directly
    organize_large_files()