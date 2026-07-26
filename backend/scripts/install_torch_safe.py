import os
import sys
import glob
import zipfile
import subprocess
import shutil

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
site_packages = os.path.join(backend_dir, "venv", "Lib", "site-packages")
temp_dir = os.path.join(backend_dir, "temp_wheels")

def run_cmd(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def main():
    # 1. Download PyTorch wheel
    os.makedirs(temp_dir, exist_ok=True)
    print("Downloading PyTorch wheel...")
    # Explicitly pull the CPU version to keep it lightweight and fast
    run_cmd(f'"{backend_dir}/venv/Scripts/pip" download torch --no-deps --dest "{temp_dir}"')
    
    # 2. Find the downloaded wheel file
    wheels = glob.glob(os.path.join(temp_dir, "torch-*.whl"))
    if not wheels:
        print("Error: PyTorch wheel not found!")
        sys.exit(1)
    
    wheel_path = wheels[0]
    print(f"Found PyTorch wheel: {wheel_path}")
    
    # 3. Extract wheel using custom extractor to bypass path limit issues
    print("Extracting wheel to site-packages...")
    skipped_files = 0
    extracted_files = 0
    with zipfile.ZipFile(wheel_path, 'r') as zip_ref:
        for member in zip_ref.infolist():
            # Construct target path
            target_path = os.path.join(site_packages, member.filename)
            # If path exceeds 255 chars, skip it
            if len(target_path) >= 250:
                print(f"Skipping too long path: {member.filename}")
                skipped_files += 1
                continue
            
            # Extract
            try:
                zip_ref.extract(member, site_packages)
                extracted_files += 1
            except Exception as e:
                print(f"Failed to extract {member.filename}: {e}")
                skipped_files += 1
    
    print(f"Extraction completed. Extracted: {extracted_files}, Skipped: {skipped_files}")
    
    # 4. Clean up temp folder
    try:
        shutil.rmtree(temp_dir)
        print("Cleaned up temporary download folder.")
    except Exception as e:
        print(f"Warning: Failed to delete temp folder: {e}")
    
    # 5. Install the rest of the packages (ultralytics) with dependencies, pip will see torch is already installed!
    print("Installing ultralytics...")
    run_cmd(f'"{backend_dir}/venv/Scripts/pip" install ultralytics')
    print("Installation complete!")

if __name__ == "__main__":
    main()
