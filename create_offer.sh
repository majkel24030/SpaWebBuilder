#!/bin/bash

echo "Creating a test offer..."

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

# Create a new offer
OFFER_DATA='{
  "numer": "TEST/2025/123",
  "data": "2025-05-03",
  "klient": "Test Client",
  "uwagi": "Test notes",
  "suma_netto": 1000,
  "suma_vat": 230,
  "suma_brutto": 1230,
  "items": [
    {
      "typ": "TYP001",
      "szerokosc": 1000,
      "wysokosc": 1500,
      "konfiguracja": {
        "profile": "PRO001",
        "glass": "SZK001",
        "hardware": "OKU001"
      },
      "cena_netto": 1000,
      "ilosc": 1
    }
  ]
}'

# Submit the offer
OFFER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/offers/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$OFFER_DATA")

# Extract offer ID
OFFER_ID=$(echo $OFFER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$OFFER_ID" ]; then
  echo "Failed to create offer. Response: $OFFER_RESPONSE"
  exit 1
fi

echo "Created offer with ID: $OFFER_ID"

# Now try to download the PDF
echo "Downloading PDF..."
PDF_RESPONSE=$(curl -s -X GET http://localhost:5000/api/offers/$OFFER_ID/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -o test_offer.pdf)

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