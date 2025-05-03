import requests
import os

print("Testing PDF generation...")

# Get access token
login_data = {
    "username": "admin@example.com", 
    "password": "admin123"
}

# Login to get token
login_response = requests.post(
    "http://localhost:5000/api/auth/login", 
    data=login_data
)

if login_response.status_code != 200:
    print(f"Failed to login: {login_response.status_code}, {login_response.text}")
    exit(1)

token_data = login_response.json()
token = token_data["access_token"]
print(f"Got token: {token[:10]}...")

# Get list of offers to find an ID
headers = {"Authorization": f"Bearer {token}"}
offers_response = requests.get(
    "http://localhost:5000/api/offers/", 
    headers=headers
)

if offers_response.status_code != 200:
    print(f"Failed to get offers: {offers_response.status_code}, {offers_response.text}")
    exit(1)

offers = offers_response.json()
if not offers:
    print("No offers found")
    exit(1)

# Use the first offer ID
offer_id = offers[0]["id"]
print(f"Using offer ID: {offer_id}")

# Request PDF
pdf_response = requests.get(
    f"http://localhost:5000/api/offers/{offer_id}/pdf", 
    headers=headers
)

if pdf_response.status_code != 200:
    print(f"Failed to get PDF: {pdf_response.status_code}, {pdf_response.text}")
    exit(1)

# Save PDF to file
with open("test_offer.pdf", "wb") as f:
    f.write(pdf_response.content)

print(f"PDF saved to test_offer.pdf - Size: {len(pdf_response.content)} bytes")