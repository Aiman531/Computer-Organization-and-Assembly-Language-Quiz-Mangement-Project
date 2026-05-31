# 🎯 Assembly Language Quiz Management System

A semester project developed for the **Computer Organization and Assembly Language (COAL)** course.

This project combines an **8086 Assembly Language Quiz Engine** with a **modern Web-Based Analytics Dashboard**. The quiz is executed using TASM and DOSBox, while quiz records are visualized through an interactive HTML/CSS/JavaScript interface.

---

## 📌 Project Overview

The core quiz engine is developed in **8086 Assembly Language** and runs through **DOSBox**. Users can attempt quizzes from different categories, and their results are stored in a text file.

The web interface allows users to upload the generated record file and view:

* Quiz records
* Performance statistics
* Category analysis
* Pie charts
* Bar charts

---

## 🚀 Features

### Assembly Quiz Engine

* Username input
* Multiple quiz categories
* Score calculation
* File handling using DOS interrupts
* Automatic record storage

### Quiz Categories

* General Knowledge
* Science
* History
* Sports
* Movies

### Web Dashboard

* View uploaded quiz records
* Interactive statistics
* Pie chart visualization
* Bar chart visualization
* User-friendly interface
* Responsive design

---

## 🛠 Technologies Used

### Backend Quiz Engine

* 8086 Assembly Language
* Turbo Assembler (TASM)
* DOSBox

### Frontend Dashboard

* HTML5
* CSS3
* JavaScript
* Chart.js

---

## 📂 Project Structure

```text
Assembly-Quiz-System/
│
├── COAL.ASM
├── COAL.EXE
├── RECORD.TXT
│
├── index.html
├── style.css
├── script.js
│
├── assets/
│   └── images
│
└── README.md
```

---

## ⚙️ How It Works

### Step 1: Run the Assembly Quiz

Open DOSBox and execute:

```dos
mount c D:\TASM
c:
COAL.EXE
```
<img width="639" height="467" alt="image" src="https://github.com/user-attachments/assets/fb2b2702-5375-48c7-b0f0-0c7cc6ac1bed" />

### Step 2: Complete the Quiz

* Enter username
* Select category
* Answer questions
* View score
<img width="643" height="427" alt="image" src="https://github.com/user-attachments/assets/2826202b-08d9-41eb-9257-a7be580be825" />

### Step 3: Record Generation

The Assembly program automatically stores records in:

```text
RECORD.TXT
```

Example:

```text
Username: Aiman Munawar | Category: General Knowledge | Score: 2
Username: Ali | Category: Sports | Score: 1
Username: Zimal Fatimah | Category: Science | Score: 2
```
<img width="832" height="251" alt="image" src="https://github.com/user-attachments/assets/0894584b-8e16-48d1-9da1-ae9e93cb682c" />


### Step 4: Open Dashboard

Open:

```text
index.html
```
<img width="1918" height="914" alt="image" src="https://github.com/user-attachments/assets/774dc5f3-49b1-4eb5-85b3-7a9d12f9cd73" />


### Step 5: Upload RECORD.TXT

* Click "View Records"
* Upload RECORD.TXT
* View statistics and charts

---
<img width="1913" height="1009" alt="image" src="https://github.com/user-attachments/assets/5c3b129c-aa72-4850-93d1-1d7095dc4136" />

## 📊 Dashboard Analytics

The dashboard generates:

* Total Players
* Highest Score
* Average Score
* Category Distribution
* Performance Analysis

Visualization includes:

* 📈 Bar Charts
* 🥧 Pie Charts

---

<img width="1755" height="717" alt="image" src="https://github.com/user-attachments/assets/11aab65f-e2e0-4f89-afc2-a6c4932305f3" />
<img width="1390" height="898" alt="image" src="https://github.com/user-attachments/assets/61e61b07-b9ce-4a1f-86e7-0fb35122ca77" />
<img width="1228" height="917" alt="image" src="https://github.com/user-attachments/assets/a41f82f8-39dc-4efe-bcec-530d339f75c6" />


## 🎓 Academic Purpose

This project was developed as a semester project for:

**Computer Organization and Assembly Language (COAL)**

The objective was to demonstrate:

* Assembly Language Programming
* DOS Interrupts
* File Handling
* Data Processing
* User Interface Design
* Data Visualization

---

## 🔮 Future Enhancements

* More quiz categories
* Larger question database
* User authentication
* Database integration
* Real-time analytics
* Online quiz support

---

## 👨‍💻 Author

**Aiman Munawar**

Computer Science Student

Semester Project – Computer Organization and Assembly Language (COAL)

---

## 📄 License

This project is developed for educational and academic purposes.
