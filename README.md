# Yatru Sewa - Bus Ticketing and Tracking Web App

Yatru Sewa is a web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to easily book bus tickets, receive e-tickets via Gmail, and track buses in real-time, similar to airplane tracking.

## Features

- **Bus Ticket Booking:** Book tickets for different bus routes directly through the website.
- **E-Ticket Delivery:** Receive your e-ticket instantly in your Gmail inbox for easy access.
- **Real-Time Bus Tracking:** Track your bus in real-time on a map using Leaflet, so you always know its location and estimated arrival time.
- **User-Friendly Interface:** Designed to make the booking and tracking process simple and hassle-free.

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js with Express.js
- **Database:** MongoDB
- **Real-Time Tracking:** Leaflet.js for map integration and real-time tracking
- **E-Ticketing:** Gmail API integration for e-ticket delivery

## Getting Started

1. Clone the repository:  
   `git clone https://github.com/yourusername/yatru-sewa.git`

2. Install dependencies for both the frontend and backend:  
   `npm install` (in both the `frontend` and `backend` directories)

3. Set up environment variables for Gmail API and MongoDB connection.

4. Run the app:  
   - `npm start` (in the `frontend` directory)  
   - `npm run dev` (in the `backend` directory)

5. Open the app in your browser at `http://localhost:3000`.



# Git Workflow Guide

This guide provides a structured approach to managing Git branches efficiently in a development project. It covers how to create, push, and manage different types of branches for an organized and streamlined workflow.

## 1. Clone the Repository
To start working on an existing repository, first, clone it to your local machine:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

This will download the repository and navigate into it.

### Example:
Let's say you are working on a **bus ticketing system project**. You would clone the repository and start working on it like this:

```bash
git clone https://github.com/your-team/bus-ticketing-system.git
cd bus-ticketing-system
```

## 2. Setting Up Main and Develop Branches
The `main` branch serves as the stable version of the project, while `develop` is used for ongoing development.

```bash
git checkout -b main       # Create the main branch
git push -u origin main    # Push main to remote

git checkout -b develop    # Create the develop branch
git push -u origin develop # Push develop to remote
```

Ensure that all new feature branches are created from the `develop` branch.

### Example:
For the bus ticketing system project:

```bash
git checkout -b main
git push -u origin main

git checkout -b develop
git push -u origin develop
```

## 3. Creating and Pushing Feature Branches
Feature branches are used to develop new functionalities. Always create them from the `develop` branch.

```bash
git checkout -b feature/feature-name  # Create a feature branch
git push -u origin feature/feature-name  # Push it to remote
```

### Example:
Suppose you're working on a **user authentication** feature for the bus ticketing system. You would create and push a feature branch like this:

```bash
git checkout -b feature/login-auth
git push -u origin feature/login-auth
```

## 4. Creating and Pushing Bugfix Branches
Bugfix branches are used to address issues found in the `develop` branch before a release.

```bash
git checkout -b bugfix/bug-description  # Create a bugfix branch
git push -u origin bugfix/bug-description  # Push to remote
```

### Example:
Imagine you discover a bug where the **bus ticket email is not sending correctly**. You would create and push a bugfix branch like this:

```bash
git checkout -b bugfix/fix-email-notification
git push -u origin bugfix/fix-email-notification
```

## 5. Creating and Pushing Hotfix Branches
Hotfix branches address critical bugs found in the `main` branch that need immediate attention.

```bash
git checkout -b hotfix/hotfix-description  # Create a hotfix branch
git push -u origin hotfix/hotfix-description  # Push to remote
```

### Example:
If there's a **critical issue** with the bus ticketing system, such as the **system crash on payment submission**, you would create and push a hotfix branch:

```bash
git checkout -b hotfix/fix-crash
git push -u origin hotfix/fix-crash
```

## 6. Creating and Pushing Release Branches
Release branches are used to prepare a new production release. These branches allow final testing and bug fixes before merging into `main`.

```bash
git checkout -b release/version  # Create a release branch
git push -u origin release/version  # Push to remote
```

### Example:
For a **new version of the bus ticketing system**, such as v1.0.0, you would create and push a release branch:

```bash
git checkout -b release/v1.0.0
git push -u origin release/v1.0.0
```

## 7. Creating and Pushing Documentation Updates
Documentation updates should be done in separate branches to keep changes organized.

```bash
git checkout -b docs/update-name  # Create a documentation branch
git push -u origin docs/update-name  # Push to remote
```

### Example:
You may want to update the **README file** to reflect new features or instructions in the bus ticketing project. You can do so by creating and pushing a documentation branch:

```bash
git checkout -b docs/update-readme
git push -u origin docs/update-readme
```

## 8. Fetch and Pull Remote Branches
Fetching updates retrieves the latest information about remote branches without applying changes:

```bash
git fetch origin
```

To pull the latest changes into your branch:

```bash
git pull origin branch-name
```

This ensures your branch is up-to-date with remote changes.

### Example:
To get the latest changes from the `develop` branch:

```bash
git fetch origin
git pull origin develop
```

---

### Summary of Commands

| Action            | Command Example |
|------------------|----------------|  
| Clone Repository | `git clone <repo-url>` |
| Create Branch | `git checkout -b branch-name` |
| Push Branch | `git push -u origin branch-name` |
| Delete Branch Locally | `git branch -d branch-name` |
| Delete Branch Remotely | `git push origin --delete branch-name` |
| Fetch Updates | `git fetch origin` |
| Pull Updates | `git pull origin branch-name` |

