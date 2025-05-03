#!/bin/bash

echo "Testing PDF generation..."

# Login to get token
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123")

# Extract token
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Response: $TOKEN_RESPONSE"
  exit 1
fi

echo "Got token: ${TOKEN:0:10}..."

# Get list of offers
OFFERS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/offers/ \
  -H "Authorization: Bearer $TOKEN")

# Check if there are offers
if [[ $OFFERS_RESPONSE == "[]" ]]; then
  echo "No offers found"
  exit 1
fi

# Extract first offer ID
OFFER_ID=$(echo $OFFERS_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$OFFER_ID" ]; then
  echo "Could not extract offer ID. Response: $OFFERS_RESPONSE"
  exit 1
fi

echo "Using offer ID: $OFFER_ID"

# Request PDF and save to file
echo "Downloading PDF..."
curl -s -X GET http://localhost:5000/api/offers/$OFFER_ID/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -o test_offer.pdf

# Check if PDF was saved
if [ -f "test_offer.pdf" ]; then
  SIZE=$(stat -c%s "test_offer.pdf")
  echo "PDF saved to test_offer.pdf - Size: $SIZE bytes"
  
  # Check if it's actually a PDF
  if grep -q "%PDF" test_offer.pdf; then
    echo "File appears to be a valid PDF"
  else
    echo "WARNING: File may not be a valid PDF"
    head -c 100 test_offer.pdf
  fi
else
  echo "Failed to save PDF"
  exit 1
fi