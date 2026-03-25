# 🏥 MedPFP — Medical Patient First Profile

## 🧠 What This Project is About

MedPFP is built to solve a critical problem in healthcare — **fragmented patient medical records across different hospitals and clinics**.

Today, when a patient visits a new doctor, their past medical history is often incomplete or unavailable. This forces doctors to:

* Spend extra time understanding the case
* Repeat tests or treatments
* Start diagnosis from scratch

MedPFP eliminates this gap by creating a **unified digital medical profile** that stores a patient’s complete history in one place.

With MedPFP:

* All medical records (personal info, prescriptions, reports, conditions) are **centrally stored and easily accessible**
* Doctors can instantly retrieve patient history using **QR code or unique ID**
* AI generates a **quick summary of past treatments and conditions**, helping doctors understand the case in seconds
* Patients receive **continuity in treatment**, regardless of hospital or location

👉 In simple terms, MedPFP ensures that **no doctor ever has to start from zero again** when treating a patient.

It saves time, reduces redundancy, and improves the overall quality of healthcare.


## 🎯 Target Audience

* 👴 **Elderly people** who need quick and simple access to medical records
* 👨‍⚕️ Doctors who require fast patient history during consultations
* 👨‍👩‍👧 General users who want to maintain organized digital health records

---

## ✨ Features Implemented

### 👤 Patient Dashboard

* Store personal medical data:

  * Name, Age, Height, Weight
  * Allergies
  * Chronic conditions
  * Current medications

* 📱 **QR Code System**

  * Unique QR code generated for each patient
  * Can be scanned by doctors for instant access

* 📂 **Document Upload**

  * Upload reports, prescriptions, and medical files

* 🗺️ **Nearby Specialized Doctors**

  * Based on patient’s disease
  * Uses maps to show nearby relevant doctors

---

### 🩺 Doctor Dashboard

* Access patient data using:

  * 📷 QR code scanner
  * 🔢 Manual unique ID entry
  * 🖼️ Upload QR image from local machine

* 📋 View **history of previously accessed patients**

* 🤖 **AI Summary**

  * Generates quick overview of:

    * Patient history
    * Prescriptions
    * Reports

* 💬 **AI Chatbot**

  * Handles general queries and assistance

---

### 📲 Smart Reminders

* WhatsApp reminders for:

  * Medications
  * Health-related alerts
* Configurable via `/msg` page

---

## ⚙️ Core Functionalities

* Digital patient profile management
* Doctor–Patient interaction system
* QR-based instant access
* AI-powered medical insights
* Location-based doctor discovery
* File upload and structured storage

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite) + Tailwind CSS

* **Backend / Database:** Supabase

* **Authentication:** Clerk

* **Maps & Location:** OpenStreetMap

* **Messaging:** Twilio (WhatsApp integration)

* **AI Services:**

  * Google Gemini API
  * Groq API

* **QR System:** QR Code Generator + Scanner

---

## 💡 What Makes This Unique

* 📲 **WhatsApp-based reminders** (practical & widely accessible)
* 🤖 **AI-generated patient summaries** (saves doctor time)
* 📷 **Multiple QR access methods** (scan, upload, manual)
* 🧓 **Simple UI designed for elderly users**
* 🗺️ **Disease-based doctor discovery using maps**
* 📂 **All-in-one medical record system**

---

## 📂 Project Setup (Run Locally)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Abhiix0/MedPFP.git
cd MedPFP
```

---

### 2️⃣ Install Frontend Dependencies

```bash
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory and add:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

---

### 4️⃣ Run Backend Server

Navigate to backend folder and start server:

```bash
cd backend
node server.js
```

---

### 5️⃣ Run Frontend

In a new terminal (root folder):

```bash
npm run dev
```

---

## 🤝 Contributing

Feel free to fork the repository and contribute!

---

## 📄 License

This project is built for educational and development purposes.

---

## 👨‍💻 Author

Developed by 
Yashwanth Abhishek guvvala
Abhinav sai gunnampalli
Abhinava guna charan gunnampalli