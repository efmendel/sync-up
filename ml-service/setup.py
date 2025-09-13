#!/usr/bin/env python3
"""
Setup script for the Music Query Parser ML Service
Installs dependencies and downloads required spaCy model
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Command: {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    """Main setup process"""
    print("🎵 Setting up Music Query Parser ML Service")
    print("=" * 50)

    # Check if we're in a virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not in a virtual environment")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Please activate your virtual environment and run setup again")
            sys.exit(1)

    # Install Python requirements
    if not run_command("pip install -r requirements.txt", "Installing Python requirements"):
        print("Failed to install requirements. Please check your Python environment.")
        sys.exit(1)

    # Download spaCy model
    if not run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English model"):
        print("Failed to download spaCy model. Please install manually:")
        print("python -m spacy download en_core_web_sm")
        sys.exit(1)

    # Create .env file if it doesn't exist
    if not os.path.exists('.env'):
        print("\n🔧 Creating .env file from template...")
        try:
            with open('.env.example', 'r') as template:
                with open('.env', 'w') as env_file:
                    env_file.write(template.read())
            print("✅ .env file created. Please add your OpenAI API key!")
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")

    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Add your OpenAI API key to the .env file")
    print("2. Run the service: python app.py")
    print("3. Test at: http://localhost:5001/health")
    print("\n📚 API Endpoints:")
    print("- POST /parse - Parse music queries")
    print("- GET /examples - View sample queries")
    print("- GET /health - Health check")

if __name__ == "__main__":
    main()