# Job Application Tracker

Job Application Tracker is a full-stack job tracking dashboard built with Next.js, TypeScript, Tailwind CSS, and Supabase.

The app helps users track job applications, including company name, job title, application status, priority, application date, job link, and notes.

## Live Demo

[View Live Project](https://job-application-tracker-rouge-nu.vercel.app)

## GitHub Repository

[View Source Code](https://github.com/fasihbabar123/job-application-tracker)

## About This Project

This project is part of my full-stack development learning path. I built it to practice working with forms, React state, filtering, searching, editing, deleting, and saving application data in a real Supabase database.

The project started as a local React state app, then was upgraded to use localStorage, and finally connected to Supabase for persistent database storage.

## Features

- Add job applications
- Edit job applications
- Delete job applications
- Track company name and job title
- Select application status
- Select priority level
- Add application date
- Add job link
- Add notes
- View application cards
- Filter applications by status
- Search applications by company or job title
- Dashboard statistics
- Required field validation
- Supabase database storage
- Responsive layout

## Application Statuses

- Applied
- Interview
- Offer
- Rejected

## Priority Levels

- Low
- Medium
- High

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Git
- GitHub
- Vercel

## How It Works

The app uses a Supabase `jobs` table to store job applications.

When the page loads, the app fetches saved jobs from Supabase.

When a user adds, edits, or deletes a job, the app sends the change to Supabase and reloads the updated job list.

## Database Table

Table name:

```txt
jobs