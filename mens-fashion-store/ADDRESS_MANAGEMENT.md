# Address Management Feature

## Overview

The address management feature allows customers to save, edit, and delete shipping addresses for future orders. Addresses are stored locally using a unique identifier and persisted in the Supabase database.

## Features

### 1. Save Addresses
- When checking out, users can check "Save this address for future orders"
- Addresses can be labeled as "Home", "Work", or "Other"
- First saved address is automatically set as default

### 2. Select Saved Addresses
- On the checkout page, saved addresses are displayed as selectable cards
- Click on any address to auto-fill the shipping form
- Default address is auto-selected on page load

### 3. Delete Addresses
- Click the trash icon on any address to delete it
- Confirmation dialog prevents accidental deletion

### 4. Add New Address
- Click "Add New" button to show the address form
- Fill in details and optionally save for future use

## Setup

### 1. Create Addresses Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN DEFAULT false,
  label TEXT DEFAULT 'Home',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can create addresses" ON addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read addresses" ON addresses FOR SELECT USING (true);
CREATE POLICY "Public can update addresses" ON addresses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete addresses" ON addresses FOR DELETE USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_identifier);
```

## API Endpoints

### GET /api/addresses
Fetch all addresses for a user.

**Query Parameters:**
- `userIdentifier` (required): Unique identifier for the user

**Response:**
```json
[
  {
    "id": "uuid",
    "user_identifier": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address_line1": "123 Main Street",
    "address_line2": "Apt 4",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "landmark": "Near Park",
    "is_default": true,
    "label": "Home",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/addresses
Create a new address.

**Request Body:**
```json
{
  "userIdentifier": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "landmark": "Near Park",
  "isDefault": true,
  "label": "Home"
}
```

### PUT /api/addresses/[id]
Update an existing address.

### DELETE /api/addresses/[id]
Delete an address.

## User Identifier

- A unique identifier is generated and stored in localStorage
- Format: `user_{timestamp}_{random_string}`
- This allows anonymous users to save addresses without authentication
- For authenticated users, you can replace this with their user ID

## UI Components

### Saved Address Card
- Displays address details in a compact format
- Shows label icon (Home/Work/Other)
- Shows "Default" badge for default address
- Delete button on hover
- Checkmark when selected

### Address Form
- Full shipping address form
- "Save this address" checkbox
- Label selector (Home/Work/Other)

## Future Improvements

1. **Edit Address**: Add ability to edit existing addresses
2. **Set Default**: Button to set any address as default
3. **Address Validation**: Integrate with pincode API for auto-fill city/state
4. **User Authentication**: Link addresses to authenticated user accounts
5. **Address Limit**: Limit number of saved addresses per user

