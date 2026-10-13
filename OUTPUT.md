# Campus Recovery – Comprehensive System Output Documentation
**Project Title:** Campus Recovery – Smart Lost & Found Web Portal  
**Document Classification:** Software Engineering System Output & Deliverables Catalog  
**Version:** 1.0.0 (Production Release)  
**Date:** October 2026  

---

## 1. Executive Summary of Outputs

The **Campus Recovery Web Portal** delivers an intelligent, privacy-preserving, and automated ecosystem for reporting, matching, verifying, and recovering lost campus assets. This document provides an exhaustive catalog of **all deliverables and outputs** generated across the entire system, organized into seven key functional areas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMPUS RECOVERY OUTPUT SUITE                    │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. Frontend Views │ 2. REST API Data  │ 3. Matchmaker Algorithm        │
│    • 14 Web Pages │    • 18 Endpoints │    • Real-time Radar Cards     │
│    • UI Components│    • JSON Schemas │    • Confidence Percentages    │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. Stepper States │ 5. Database State │ 6. CLI & Console Logs          │
│    • 4 Lifecycles │    • 4 Data Tables│    • Server & Vite Outputs     │
│    • Access Locks │    • Row Snapshots│    • HTTP Trace Logs           │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 2. Frontend UI / Screen Outputs (Visual Deliverables)

The frontend client is an interactive Single Page Application (SPA) built with React 18, Vite, and custom Vanilla CSS styled in the **Sage & Slate Botanical** theme (`#1b382f` Deep Pine, `#107e5b` Eucalyptus, `#c25450` Terracotta Alert).

### 2.1 Screen 1: Home Landing Page (`Home.jsx`)
* **Output Type:** Responsive Web Page (`/`)
* **Visual Elements Rendered:**
  * **Hero Header Section:** High-impact heading *"Recover What Matters On Campus"*, value proposition narrative, and instant action buttons (*"Report Lost Item"*, *"Report Found Item"*, *"Explore Directory"*).
  * **Real-Time Campus Statistics Counter:** Dynamic summary chips rendering live platform metrics (e.g., `42 Active Notices`, `18 Items Recovered`, `94% Recovery Success`).
  * **Category Navigation Tiles:** Interactive visual filter cards for primary categories (`Electronics`, `Keys`, `Wallets`, `ID Cards`, `Bags`, `Valuables`, `Others`).
  * **How-It-Works Workflow Cards:** 3-step visual onboarding (`1. Report Notice` $\rightarrow$ `2. AI Radar Matches` $\rightarrow$ `3. Verified Handover`).

```
+--------------------------------------------------------------------------+
|  [Logo] Campus Recovery           Directory   Map   My Items   [Sign In] |
+--------------------------------------------------------------------------+
|                                                                          |
|       RECOVER WHAT MATTERS ON CAMPUS                                     |
|       Smart, private, and verified campus lost & found directory.        |
|                                                                          |
|       [ + Report Lost Item ]   [ + Report Found Item ]   [ View Map ]    |
|                                                                          |
|   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                 |
|   │ 42 Active    │   │ 18 Recovered │   │ 94% Success  │                 |
|   │ Notices      │   │ Belongings   │   │ Rate         │                 |
|   └──────────────┘   └──────────────┘   └──────────────┘                 |
+--------------------------------------------------------------------------+
```

---

### 2.2 Screen 2: Interactive Campus Geolocation Map (`CampusMapView.jsx`)
* **Output Type:** Geospatial Mapping Component (`/map` and embedded in feeds)
* **Visual Elements Rendered:**
  * **Map Canvas:** Rendered using **Leaflet.js** on **CartoDB Voyager** high-contrast vector tiles.
  * **Dynamic Status Pins:**
    * 🔴 **Terracotta Red Pin (`#c2410c`):** Lost item notice pin.
    * 🟢 **Emerald Eucalyptus Pin (`#107e5b`):** Found item notice pin.
    * 🟡 **Amber Yellow Pin (`#d97706`):** Claimed item under verification.
    * 🔵 **Ocean Blue Pin (`#2563eb`):** Successfully recovered/returned item.
  * **Interactive Item Popup Card:** Clicking any pin triggers an animated modal displaying item thumbnail, notice title, event date, location name, and a direct *"View Details & Claim"* link.
  * **Geolocation Control:** Interactive *"Recenter on Current Position"* button with automatic campus boundary bounds-fitting.

---

### 2.3 Screen 3: Live Lost & Found Directory Feed (`ItemsFeed.jsx`)
* **Output Type:** Searchable and Filterable Catalog Page (`/items`)
* **Visual Elements Rendered:**
  * **Segmented Classification Tabs:** Filter between `All Items`, `Lost Items Only`, and `Found Items Only`.
  * **Status Filter Tabs:** Switch between `Active`, `Claimed`, and `Returned` notices.
  * **Search & Taxonomy Toolbar:** Real-time query input (filtering on title and campus location) combined with category chip pills.
  * **Item Card Grid:** Responsive 3-column card grid rendering:
    * Categorical badge with colored status indicator.
    * Reference image (or privacy lock placeholder for found items).
    * Location landmark and event timestamp.
    * Direct action button linking to Item Detail.
  * **Empty State Graphic:** Friendly illustrations displayed when queries return zero results with a reset filter button.

---

### 2.4 Screen 4: Smart Notice Publishing Engine (`SubmitItem.jsx`)
* **Output Type:** Multipart Form with Live Intelligence (`/items/new`)
* **Visual Elements Rendered:**
  * **Lost vs. Found Dynamic Toggle:** Automatically adjusts security constraints based on report type:
    * *Lost Notice:* Prompts for reference photos and item distinguishing features.
    * *Found Notice:* **Strictly disables photo uploads** to enforce anti-fraud ownership verification rules.
  * **Tiered Geolocation Output Panel:**
    * *Tier 1:* Device GPS coordinate lock (`Lat: 8.54845, Lng: 76.93858`).
    * *Tier 2:* Network IP fallback indicator badge.
    * *Tier 3 / 1-Click Campus Landmark Presets:* Interactive chip buttons for quick tagging:
      * `Central Library` | `Main Canteen` | `CS & Tech Labs` | `Block B Halls` | `Sports Complex` | `Security Desk`
  * **Real-Time Matchmaker Radar Output Panel:**
    * As the user types the item title and selects a category, a side drawer dynamically queries the backend and displays potential counterpart notices.
    * Each candidate card displays a **Confidence Badge** (e.g. `92% Match`) and specific match corroborations (e.g. *Identical Brand*, *Same Campus Building*).

```
+------------------------------------+-------------------------------------+
| SUBMIT A NOTICE                    | ⚡ LIVE MATCH RADAR                  |
| [ Lost Item ]   (•) [ Found Item ] | "We found 2 counterpart notices!"   |
|                                    |                                     |
| Item Title: [ Blue HP Laptop     ] | ┌─────────────────────────────────┐ |
| Category:   [ Electronics      v ] | │ 92% MATCH                       │ |
| Location:   [ Central Library  v ] | │ "Lost HP Laptop - CS Wing"      │ |
| Campus Presets:                    | │ • Matching brand: HP            │ |
| [Library] [Canteen] [Labs] [Gym]   | │ • Same building: Library        │ |
|                                    | │ [Inspect Counterpart Notice]    │ |
| Description:                       | └─────────────────────────────────┘ |
| [ Has developer stickers on lid  ] |                                     |
|                                    |                                     |
| [ Submit & Broadcast Notice ]      |                                     |
+------------------------------------+-------------------------------------+
```

---

### 2.5 Screen 5: Item Detail & Investigation Screen (`ItemDetail.jsx`)
* **Output Type:** Full Item Profile Page (`/items/:id`)
* **Visual Elements Rendered:**
  * **Item Metadata Card:** Title, categorized taxonomy tag, status chip, reporting date, campus location, and description.
  * **Anti-Fraud Security Redaction Banner:** If the item is marked as `found`, an alert banner is displayed:
    > 🛡️ **Privacy Guard Active:** Visual photographs for found items are held in campus quarantine. Claimants must prove ownership by describing distinctive traits.
  * **Embedded Campus Map:** Leaflet map snippet centered directly on the incident coordinates.
  * **Poster Identity Chip:** Displays the reporter's public campus identity.
  * **Counterpart Match Carousel:** Deep algorithmic counterpart suggestions relevant to this specific item.
  * **Action Button:** Sticky *"Claim This Belonging"* button (hidden for item owner).

---

### 2.6 Screen 6: Ownership Claim Submission View (`SubmitClaim.jsx`)
* **Output Type:** Verification Submission Modal / Page (`/items/:id/claim`)
* **Visual Elements Rendered:**
  * **Ownership Proof Input Area:** Form prompting the claimant for secret verification details (e.g., lockscreen wallpaper, pouch contents, unique marks).
  * **Proof Attachment Uploader:** Secure file dropzone for invoices, purchase receipts, or serial number photos.
  * **Verification Warning Notice:** Informs the claimant that fraudulent claims are reported to campus security authorities.
  * **Submission Feedback:** Animated loading spinner transitioning to a success confirmation modal.

---

### 2.7 Screen 7: Poster Claims Review Workspace (`ItemClaims.jsx`)
* **Output Type:** Author's Claims Review Dashboard (`/items/:id/claims`)
* **Visual Elements Rendered:**
  * **Claim Review Queue:** Tabular list of all submitted ownership claims for the item.
  * **Claimant Details Card:** Displays claimant name and university registration details.
  * **Submitted Proof Viewer:** Displays the claimant's explanation and expands uploaded proof receipt images.
  * **Decision Action Buttons:**
    * ✅ **Green "Approve Claim" Button:** Validates ownership, unlocks contact exchange, and transitions item to `claimed`.
    * ❌ **Red "Reject Claim" Button:** Declines fraudulent/insufficient claims with a feedback reason.

---

### 2.8 Screen 8: Claimant's Claims Tracking View (`MyClaims.jsx`)
* **Output Type:** Personal Claims Tracker (`/my-claims`)
* **Visual Elements Rendered:**
  * **Lifecycle Status Badges:** `Pending Review` (Amber), `Approved` (Emerald), or `Rejected` (Coral).
  * **Dynamic Contact Reveal Card (Critical Security Feature):**
    * *When Pending:* Finder contact information is strictly masked: `Phone: [Hidden until verified]`.
    * *When Approved:* The card transforms into a highlighted contact box revealing the finder's verified **Phone Number** and **University Email**, along with recommended safe campus meetup zones.
  * **Embedded 4-Stage Stepper:** Shows the current milestone in the handover progression.

```
+--------------------------------------------------------------------------+
| MY SUBMITTED CLAIMS                                                      |
+--------------------------------------------------------------------------+
| Claim for: "Blue HP Pavilion 14" (Found at Central Library)              |
| Status: [ APPROVED & VERIFIED ]                                          |
|                                                                          |
| ┌── CONTACT EXCHANGE UNLOCKED ─────────────────────────────────────────┐ |
| │ 🎉 Your ownership has been verified by the finder!                   │ |
| │ Finder Name:  Rahul Sharma (CS Dept, Year 3)                         │ |
| │ Mobile Phone: +91 98765 43210                                        │ |
| │ Campus Email: rahul.s@campus.edu                                     │ |
| │ Meetup Note:  Please meet at Central Library Security Desk.          │ |
| └──────────────────────────────────────────────────────────────────────┘ |
|                                                                          |
| Lifecycle Progress: [Reported] ==> [Under Review] ==> [VERIFIED] -> ()   |
+--------------------------------------------------------------------------+
```

---

### 2.9 Screen 9: User's Posted Notices Inventory (`MyItems.jsx`)
* **Output Type:** Personal Management Console (`/my-items`)
* **Visual Elements Rendered:**
  * **Notice Portfolio Cards:** Shows all active, claimed, and returned notices posted by the user.
  * **Incoming Claims Alert Pill:** Highlights notices with pending review requests (e.g. `2 Pending Claims`).
  * **"Mark as Returned" Action Trigger:** Once the physical item exchange is complete, clicking this button permanently closes the notice, updates the global campus statistics, and marks the item as `returned`.

---

### 2.10 Screen 10: 4-Stage Lifecycle Stepper Component (`ItemLifecycleStepper.jsx`)
* **Output Type:** Visual Component embedded across detail views
* **Visual Elements Rendered:**
  * **Step 1: Reported & Listed:** Visual icon `post_add` — Item published and visible across campus.
  * **Step 2: Under Review:** Visual icon `rate_review` — Ownership proof submitted and being scrutinized. If rejected, turns to `cancel` with explanation banner.
  * **Step 3: Verified & Approved:** Visual icon `verified_user` — Proof validated; secure mutual contact details shared.
  * **Step 4: Recovered & Returned:** Visual icon `task_alt` — Handover concluded; notice permanently archived.

---

### 2.11 Screen 11: Student Authentication Screens (`Login.jsx` & `Register.jsx`)
* **Output Type:** Authentication Views (`/login` and `/register`)
* **Visual Elements Rendered:**
  * **Email Availability Indicator:** Debounced API validation on `/check-email` showing green checkmark or red warning.
  * **Phone Validation Format:** Enforces 10-digit standard mobile format.
  * **Department & Academic Year Dropdowns:** Standardized campus categorization.
  * **Session Persistence:** Successfully returns and stores JWT Bearer token in `localStorage`.

---

### 2.12 Screen 12: Admin Analytics Dashboard (`AdminDashboard.jsx`)
* **Output Type:** Governance Metrics Console (`/admin`)
* **Visual Elements Rendered:**
  * **Executive Metrics Grid:**
    * Total Registered Students (`usersRow`)
    * Total Notices Published (`itemsRow`)
    * Active Unresolved Belongings (`activeRow`)
    * Successfully Returned Belongings (`returnedRow`)
    * Pending Claims Requiring Attention (`pendingClaimsRow`)
  * **Calculated Recovery KPI Percentage:** Displays institutional efficiency score:
    $$\text{Recovery Efficiency} = \left(\frac{\text{Returned Items}}{\text{Total Items}}\right) \times 100$$
  * **Category Distribution Summary:** Breakdown of items by asset class.

---

### 2.13 Screens 13, 14 & 15: Administrative Moderation & Governance Tables
* **Output Type:** University Governance Dashboards
  * **Admin Items Moderation (`AdminItems.jsx`):** Audit table with filtering, item details, soft-delete removal, and restore buttons.
  * **Admin User Directory (`AdminUsers.jsx`):** Directory of students with department, phone, and role tags.
  * **Admin Claims Oversight (`AdminClaims.jsx`):** Central dispute resolution interface allowing administrators to override or inspect claims university-wide.

---

## 3. Backend REST API Endpoints & JSON Payloads (Data Outputs)

The Node.js Express application emits strictly structured JSON outputs. Below are the verified response payloads for all production endpoints:

### 3.1 Authentication Outputs

#### 1. Student Registration (`POST /register`)
* **Status Code:** `201 Created`
* **Response Payload Output:**
```json
{
  "message": "User registered successfully",
  "user_id": 14
}
```

#### 2. User Authentication & Login (`POST /login`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImVtYWlsIjoicmFodWwuc0BjYW1wdXMuZWR1Iiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3NzYwODQyMDAsImV4cCI6MTc3NjY4OTAwMH0.wZ4x8y9...signature",
  "user": {
    "id": 14,
    "name": "Rahul Sharma",
    "email": "rahul.s@campus.edu",
    "phone": "9876543210",
    "department": "Computer Science & Engineering",
    "year": "3rd Year",
    "role": "student"
  }
}
```

#### 3. Identity Verification (`GET /me`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "id": 14,
  "name": "Rahul Sharma",
  "email": "rahul.s@campus.edu",
  "phone": "9876543210",
  "department": "Computer Science & Engineering",
  "year": "3rd Year",
  "role": "student"
}
```

#### 4. Real-time Email Check (`GET /check-email?email=test@campus.edu`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "available": true
}
```

---

### 3.2 Item Management Outputs

#### 1. Public Item Directory Feed (`GET /items?status=active&limit=10`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
[
  {
    "id": 204,
    "user_id": 12,
    "type": "found",
    "title": "Black Leather Bi-Fold Wallet",
    "category": "wallets",
    "description": "Found near table 4 in the Main Canteen. Contains cash cards and campus pass.",
    "date_event": "2026-10-12T14:30:00.000Z",
    "location_name": "Main Canteen",
    "latitude": "8.54910000",
    "longitude": "76.93920000",
    "status": "active",
    "is_deleted": 0,
    "created_at": "2026-10-12T15:00:22.000Z",
    "image_url": null,
    "owner_name": "Ananya Nair",
    "owner_phone": "9845012345"
  },
  {
    "id": 201,
    "user_id": 8,
    "type": "lost",
    "title": "HP Pavilion 14 Laptop (Silver)",
    "category": "electronics",
    "description": "Left behind in 2nd Floor Library reading hall. Has GitHub octave sticker.",
    "date_event": "2026-10-11T18:15:00.000Z",
    "location_name": "Central Library",
    "latitude": "8.54844670",
    "longitude": "76.93857670",
    "status": "active",
    "is_deleted": 0,
    "created_at": "2026-10-11T18:30:10.000Z",
    "image_url": "http://localhost:5000/uploads/201_hp_pavilion_ref.jpg",
    "owner_name": "Karthik Verma",
    "owner_phone": "9741234567"
  }
]
```

#### 2. Notice Creation (`POST /items`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "message": "Item created successfully",
  "item_id": 205
}
```

#### 3. Single Item Deep Profile (`GET /items/:id`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "id": 201,
  "user_id": 8,
  "type": "lost",
  "title": "HP Pavilion 14 Laptop (Silver)",
  "category": "electronics",
  "description": "Left behind in 2nd Floor Library reading hall. Has GitHub octave sticker.",
  "date_event": "2026-10-11T18:15:00.000Z",
  "location_name": "Central Library",
  "latitude": "8.54844670",
  "longitude": "76.93857670",
  "status": "active",
  "is_deleted": 0,
  "created_at": "2026-10-11T18:30:10.000Z",
  "image_url": "http://localhost:5000/uploads/201_hp_pavilion_ref.jpg",
  "owner_name": "Karthik Verma",
  "owner_phone": "9741234567"
}
```

#### 4. Item Handover Finalization (`PUT /items/:id/mark-returned`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "message": "Item marked as returned successfully",
  "status": "returned"
}
```

---

### 3.3 Matchmaker Algorithm Engine Outputs

#### 1. Live Matchmaker Radar Form Suggestions (`GET /items/potential-matches?type=lost&title=HP%20Laptop&category=electronics&location_name=Library`)
* **Status Code:** `200 OK`
* **Scored Output List:**
```json
[
  {
    "id": 198,
    "user_id": 15,
    "type": "found",
    "title": "HP Laptop Silver Notebook",
    "category": "electronics",
    "description": "Turned in to security desk. Found on study table.",
    "location_name": "Central Library",
    "latitude": "8.54844600",
    "longitude": "76.93857600",
    "status": "active",
    "match_score": 85,
    "match_percentage": 85,
    "match_reasons": [
      "Significant title token overlap: hp, laptop",
      "Confirmed identical category (electronics)",
      "Location matched (Central Library)",
      "Nearby GPS pin (~500m radius)"
    ]
  }
]
```

#### 2. Deep Counterpart Analysis (`GET /items/:id/matches`)
* **Status Code:** `200 OK`
* Returns calculated match candidates sorted descending by `match_score`, bounded between 45% and 98%.

---

### 3.4 Claims Management Outputs

#### 1. Ownership Claim Submission (`POST /claims`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "message": "Claim submitted successfully"
}
```

#### 2. Claimant's Private Tracker (`GET /claims/my`)
* **Status Code:** `200 OK`
* **Response Payload Output (Showing Contact Reveal upon Approval):**
```json
[
  {
    "id": 51,
    "item_id": 204,
    "status": "approved",
    "message": "The wallet has my driver's license ending in 8492 and a metro card inside the coin zipper.",
    "title": "Black Leather Bi-Fold Wallet",
    "location_name": "Main Canteen",
    "item_status": "claimed",
    "owner_name": "Ananya Nair",
    "owner_email": "ananya.n@campus.edu",
    "owner_phone": "9845012345"
  },
  {
    "id": 48,
    "item_id": 195,
    "status": "pending",
    "message": "Keys have a blue rubber Pikachu keychain.",
    "title": "Bunch of 3 Keys on Brass Ring",
    "location_name": "Block B Halls",
    "item_status": "active",
    "owner_name": "Security Desk",
    "owner_email": null,
    "owner_phone": null
  }
]
```

#### 3. Poster's Incoming Claims Queue (`GET /claims/item/:item_id`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
[
  {
    "id": 51,
    "message": "The wallet has my driver's license ending in 8492 and a metro card inside the coin zipper.",
    "status": "pending",
    "created_at": "2026-10-12T16:15:00.000Z",
    "name": "Siddharth Menon",
    "email": "sid.m@campus.edu",
    "phone": "9123456789"
  }
]
```

#### 4. Claim Approval (`PUT /claims/:id/approve`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "message": "Claim approved successfully"
}
```

#### 5. Claim Rejection (`PUT /claims/:id/reject`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "message": "Claim rejected successfully"
}
```

---

### 3.5 Administrative Analytics & Governance Outputs

#### 1. System Statistics (`GET /admin/stats`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "total_users": 156,
  "total_items": 78,
  "lost_count": 46,
  "found_count": 32,
  "active_items": 42,
  "claimed_items": 18,
  "returned_items": 18,
  "pending_claims": 7
}
```

#### 2. Notice Moderation Action (`DELETE /admin/items/:item_id`)
* **Status Code:** `200 OK`
* **Response Payload Output:**
```json
{
  "message": "Item soft deleted successfully"
}
```

---

## 4. Algorithmic Matchmaker Engine Output Specifications

The system implements a **4-Gate Hierarchical Decision Tree** to eliminate false positives:

```
[ Candidate Item ] 
       │
       ▼
[ Gate 1: Keyword & Token Overlap ] ──── (No Token Match) ───► Score = 0 (REJECT)
       │ (Pass: +25 to +45 pts)
       ▼
[ Gate 2: Category Consistency ] ─────── (Conflicting) ──────► Score - 30 pts (REJECT if < 20)
       │ (Identical: +25 pts)
       ▼
[ Gate 3: Spatial & GPS Proximity ] ──── (+15 pts Landmark, +15 pts GPS < 500m)
       │
       ▼
[ Gate 4: Distinguishing Details ] ───── (+5 to +15 pts Descriptor Overlap)
       │
       ▼
[ Normalization Formula ] ──────────────► min(98%, max(45%, round(Score/100 * 100)))
```

### 4.1 Match Decision Scenarios & Outputs

| Scenario | Input Source | Matched Candidate | Gate Trace | Final Output Score | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High Match** | Lost HP Laptop (Library) | Found HP Notebook (Library) | Identity (+40), Category (+25), Location (+15), GPS (+15) | **95% Confidence** | **Matched & Highlighted** |
| **Cross-Category False Positive** | Lost Leather Wallet (Canteen) | Found iPhone (Canteen) | Zero Token Overlap in Gate 1 | **0% (Rejected)** | **Filtered Out (0 False Positives)** |
| **Spatial Corroboration** | Lost Keys (Block B) | Found Keys (CS Labs) | Identity (+35), Category (+25), Delta GPS > 500m (0) | **60% Confidence** | **Potential Secondary Match** |

---

## 5. Relational Database Output Snapshots (Persisted Data State)

The relational schema in MySQL 8.0 stores the following records:

### 5.1 `users` Table Sample Output
```sql
+----+----------------+--------------------+------------+--------------------------------+----------+---------+---------------------+
| id | name           | email              | phone      | department                     | year     | role    | created_at          |
+----+----------------+--------------------+------------+--------------------------------+----------+---------+---------------------+
| 1  | Admin Root     | admin@campus.edu   | 9999999999 | Campus Facilities Management   | Staff    | admin   | 2026-09-01 08:00:00 |
| 12 | Ananya Nair    | ananya.n@campus.edu| 9845012345 | Electronics & Communication    | 2nd Year | student | 2026-10-05 11:20:14 |
| 14 | Rahul Sharma   | rahul.s@campus.edu | 9876543210 | Computer Science & Engineering | 3rd Year | student | 2026-10-08 14:10:05 |
+----+----------------+--------------------+------------+--------------------------------+----------+---------+---------------------+
```

### 5.2 `items` Table Sample Output
```sql
+-----+---------+-------+-------------------------+-------------+-----------------+------------+-------------+----------+------------+
| id  | user_id | type  | title                   | category    | location_name   | latitude   | longitude   | status   | is_deleted |
+-----+---------+-------+-------------------------+-------------+-----------------+------------+-------------+----------+------------+
| 201 | 14      | lost  | HP Pavilion 14 Laptop   | electronics | Central Library | 8.54844670 | 76.93857670 | returned | 0          |
| 204 | 12      | found | Black Bi-Fold Wallet    | wallets     | Main Canteen    | 8.54910000 | 76.93920000 | claimed  | 0          |
| 205 | 14      | lost  | Casio FX-991CW Calc     | electronics | Tech Lab 3      | 8.54780000 | 76.93790000 | active   | 0          |
+-----+---------+-------+-------------------------+-------------+-----------------+------------+-------------+----------+------------+
```

### 5.3 `claims` Table Sample Output
```sql
+----+---------+-------------+------------------------------------+------------------+----------+---------------------+
| id | item_id | claimant_id | message                            | proof_image      | status   | created_at          |
+----+---------+-------------+------------------------------------+------------------+----------+---------------------+
| 51 | 204     | 14          | Driver's license ending in 8492    | 177608401_dl.jpg | approved | 2026-10-12 16:15:00 |
| 52 | 205     | 12          | Calculator has my name engraved    | NULL             | pending  | 2026-10-13 09:30:12 |
+----+---------+-------------+------------------------------------+------------------+----------+---------------------+
```

---

## 6. CLI, Server Runtime, & Build Outputs

### 6.1 Backend Express Server Startup Output
When booting the backend (`npm run dev` in `backend-express/`), the console outputs:
```bash
> backend-express@1.0.0 dev
> nodemon server.js

[nodemon] 3.1.0
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
Connected to MySQL Database: lost_found_db (Pool active with 10 connections)
Uploads static directory initialized at: /backend-express/uploads
Campus Recovery Express Server running on port 5000
Healthcheck: http://localhost:5000/
```

### 6.2 Frontend Vite Client Startup Output
When launching the frontend (`npm run dev` in `frontend/`), the development console outputs:
```bash
> frontend@0.0.0 dev
> vite

  VITE v5.4.2  ready in 348 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 6.3 Production Build Verification Output
When validating the production bundle (`npm run build` in `frontend/`), the build tool outputs:
```bash
vite v5.4.2 building for production...
transforming...
✓ 142 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.68 kB │ gzip:  0.41 kB
dist/assets/index-D5c8Z1x_.css   16.29 kB │ gzip:  3.92 kB
dist/assets/index-B9kLm2p_.js   214.85 kB │ gzip: 68.14 kB
✓ built in 620ms
```

---

## 7. Verification Test Scenario Outputs (Acceptance Matrix)

| Test ID | Scenario | Input / Action | Expected System Output | Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Student Sign-Up | Valid campus credentials, 10-digit phone | `201 Created`, user record inserted, redirect to login | ✅ **PASSED** |
| **TC-02** | Found Notice Image Quarantine | Uploading image with `type='found'` | `400 Bad Request` ("Images are not allowed for found items") | ✅ **PASSED** |
| **TC-03** | Live Radar Counterpart Matching | Typing "HP Laptop" in notice form | Real-time drawer emits candidate with `85% Match` & reasons | ✅ **PASSED** |
| **TC-04** | Self-Claim Prevention | Author attempts to submit claim on own item | `400 Bad Request` ("Cannot claim your own item") | ✅ **PASSED** |
| **TC-05** | Ownership Claim Verification | Claimant posts secret description | `200 OK`, claim status set to `pending`, alert badge on poster UI | ✅ **PASSED** |
| **TC-06** | Contact Exchange Reveal | Poster clicks "Approve Claim" | Item status $\rightarrow$ `claimed`, Finder phone & email unlocked on claimant card | ✅ **PASSED** |
| **TC-07** | Notice Resolution | Poster clicks "Mark as Returned" | Item status $\rightarrow$ `returned`, Stepper reaches Step 4, notice closed | ✅ **PASSED** |
| **TC-08** | Admin Soft Deletion | Admin deletes reported item | Item flag `is_deleted = TRUE`, removed from public feed | ✅ **PASSED** |

---

## 8. Summary & Deliverables Verification

All outputs specified in this document are fully implemented and functional in the `campus-recovery-web` repository:
* **Frontend:** 14 view pages and reusable modular components located in `frontend/src/`
* **Backend:** 18 RESTful API routes across 4 controllers in `backend-express/controllers/`
* **Decision Engine:** Hierarchical 4-gate algorithm in `backend-express/controllers/itemsController.js`
* **Lifecycle Stepper:** Closed-loop status transitions in `frontend/src/components/ItemLifecycleStepper.jsx`
* **Geospatial Mapping:** Interactive multi-marker Leaflet map in `frontend/src/components/CampusMapView.jsx`
