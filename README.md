# Kanban_Board


## Preview system
- Add new task
![chrome_XqzcME4RQl](https://github.com/user-attachments/assets/04b1e5f5-1713-4075-b89c-a6109d046fcc)

- Add comment, edit task, change task status , delete task
![chrome_EofvTyHjSB](https://github.com/user-attachments/assets/65c26f9c-ce05-404d-9714-960198c77302)


 # 📖 README: Setup Guide for Local Development (Frontend & Backend)
This guide provides step-by-step instructions to set up the Kanban Board project locally, including both frontend (React) and backend (Node.js + MySQL).

# Prerequisites
Before proceeding, ensure you have the following installed on your machine:

 **✅ Node.js (v18 or higher)**
 
 **✅ MySQL (or MariaDB)**
 
 **✅ Git**

# 🖥️ Backend Setup (Node.js + Express + MySQL)
## 1️⃣ Clone the repository
     https://github.com/Cukeli/kanban_board.git
     cd kanban_board/backend
## 2️⃣ Install dependencies
     npm install
## 3️⃣ Setup environment variables
Find server.js file in the backend/ folder and configure the following:

    // MySQL Connection
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '', // Set your MySQL password
        database: 'kanban_db'
    });

## 4️⃣ Start MySQL and Create Database
    CREATE DATABASE kanban_db;

## 5️⃣ Download and Import sql
   https://drive.google.com/file/d/1kDYrpTQP6M_S_nI29tfyNRjebdqEB7th/view?usp=sharing

## 6️⃣ Start the backend server
    nodemon server

# 🌐 Frontend Setup (React + TypeScript + Tailwind)
## 1️⃣ Open split terminal 
## 2️⃣ Install dependencies
    npm install
## 3️⃣ Start the development server
    npm run dev

