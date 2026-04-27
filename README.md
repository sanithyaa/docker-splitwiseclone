# Splitwise Clone

> A simple expense-sharing web app to create groups and manage shared expenses with ease.

## 📌 Overview
This project is a lightweight **Splitwise-inspired application** where users can create groups, add members, and manage shared expenses efficiently.
Built using **Flask** for the backend and **Docker** for easy deployment.

---

## 🚀 Features

- Create expense groups  
- Add multiple group members  
- Clean and simple dashboard  
- Responsive user interface  
- Easy deployment with Docker  

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Flask (Python)  
- **Deployment:** Docker  

---

## ⚙️ Run Locally

```bash id="f3k7vn"
git clone https://github.com/yourusername/splitwise-clone.git
cd splitwise-clone
pip install -r requirements.txt
python app.py

docker build -t splitwise-app .
docker run -p 5000:5000 splitwise-app
