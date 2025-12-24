#!/bin/bash

echo "Starting INTAI Backend with Uvicorn..."
echo ""

# Check if uvicorn is installed
if ! python -c "import uvicorn" 2>/dev/null; then
    echo "Error: uvicorn not installed"
    echo "Run: pip install -r requirements.txt"
    exit 1
fi

# Run with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8080 --reload


