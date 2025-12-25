# Application Flow & Configuration Guide

## App Flow Diagram

```text
┌──────────────────────┐
│      Get Schema      │
│  (Enter Schema URL)  │
└─────────┬────────────┘
          │
          ▼
┌─────────────────────┐
│ Column Modification │
│ (Edit columns, types│
│ & aggregates)       │
└─────────┬────┬──────┘
          │    │
          │    └────────────────────────────────┐
          │                                     │
          ▼                                     ▼
┌─────────────────────┐          ┌─────────────────────────────┐
│    DB Config        │          │  Config for Gold & Silver   │
│ (Host, Port, DB)    │          │ Layers available after edit │
└─────────┬───────────┘          └──────────────┬──────────────┘
          │                                     │
          ▼                                     │
┌─────────────────────┐                         │
│   Upload Config     │                         │
│ (Push to Database)  │◄────────────────────────┘
└─────────────────────┘
```

---

## Step 1: Installation
- **Minimum Requirements**: Node.js version 24.12 LTS or higher.
- **Install dependencies**:
```bash
cd next-js-forms   # Optional if not in root folder
npm i
```
- **Protocol Notes**:
  - **Local**: Use HTTP
  - **Remote/Public**: Use HTTPS

---

## Step 2: Add Configuration
### 1. Create DDL
1. Go to the DDL creation page.
2. Enter **Schema URL**.
3. Enter the table name (must match Schema URL and not exist in DDL).
4. Click **Generate**.

### 2. Modify Columns
- Edit **column names**, **data types**, and **aggregate types**.
- **Note**:
  - Dimension data must remain unchanged.
  - Aggregate Type should be **None**.

### 3. Configure Database
1. By default, the system uses the Tech Lead’s machine configuration or the current PostgreSQL setup.
2. To change, enter:
   - **Host**: Server address
   - **Port**: Connection port
   - **Username**: Login name
   - **Password**: Password
   - **Database**: Database name
3. Click **Submit** to push gold & silver layer configurations to the DB.

---

## Step 3: View & Delete Configurations
1. Select **Explorer**.
2. Choose **Configuration**.

### 1. Enter DB Config
- Host, Port, Username, Password, DB, Table Name.

### 2. Filter Table Config
1. Enter **table name**.
2. Select **layer configuration** (Silver, Gold, or both).
3. Click **Search**.

### 3. Delete Configuration
1. Click the **ID** of the configuration to delete.
2. Confirm in the popup box.

---

## Step 4: Update Table Configuration
### 1. Access Update Page
1. Select **Explorer**.
2. Choose **Configuration**.
3. Find the table configuration to update.

### 2. Edit Information
- Update data in the table.

### 3. Save Changes
1. Click **Save Configuration**.
2. System pushes updated config to DB.
3. Confirm update completion.

---

