"""
Main entry point for Docker and Render
"""
import os
import sys
import subprocess

# Set the working directory to backend directory
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

# Run the backend FastAPI server
cmd = [
    "python", "-m", "uvicorn", 
    "app.main:app", 
    "--host", "0.0.0.0", 
    "--port", "5000"
]

# Execute the command
try:
    subprocess.run(cmd, check=True)
except KeyboardInterrupt:
    print("Server stopped.")
except Exception as e:
    print(f"Error running server: {e}")
    sys.exit(1)