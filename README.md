<!-- Logo -->
<p align="center">
  <img src="docs/logo.png" alt="Project Logo" width="120" height="120" style="border-radius:50%;" />
</p>

<!-- Project Title -->
<h1 align="center">🚀 AI Resume Optimizer</h1>
<p align="center">
A Website using AI to optimize the resume for users.
</p>

<!-- Badges (Optional) -->
<p align="center">
  <a href="https://github.com/baddif/ai_resume_optimizer/actions"><img src="https://img.shields.io/github/actions/workflow/status/baddif/ai_resume_optimizer/ci.yml?branch=main" alt="CI Status"></a>
  <a href="https://github.com/baddif/ai_resume_optimizer/releases"><img src="https://img.shields.io/github/v/release/baddif/ai_resume_optimizer" alt="Release"></a>
  <a href="https://github.com/baddif/ai_resume_optimizer/blob/main/LICENSE"><img src="https://img.shields.io/github/license/baddif/ai_resume_optimizer" alt="License"></a>
</p>

---

## 📖 Introduction
- **Core Features**: User inputs parts of the resume, for example, summary, project details, work experience, achievements, etc... The site calls AI APIs to optimize it. Suppport multiple versions of optimization.
- **Tech Stack**: WordPress, JavaScript, 
- **Frameworks**: RESTful API, React, 

---

## 👤 Author
- **Dif** – Developer/Maintainer  
- [Personal Website](https://nonpareil.me) | [GitHub](https://github.com/baddif) | [LinkedIn](https://www.linkedin.com/in/yifudingsoftwarearchitect)  
- Contact: baddif@gmail.com  

---

## 🏗️ Background Story
While looking for remote jobs, I used AI a lot to help optimizing my resume.
Then I decided to make a website to easy the use of AI assistanted optimization, also as a way to learn WordPress / PHP / Plugins.
So this is the first project I built with WordPress.

---

## 🧩 Architecture Design
<p align="center">
  <img src="docs/architecture.svg" alt="Architecture Diagram" width="600"/>
</p>

- **System Modules**: 
  -- WordPress and Nginx for the server.
  -- Using Postfix as my own mail server.
  -- Using React for plugin pages, communicating with PHP backend through RESTful APIs.
  -- Call Hugging Face free API for the AI ability.
- **Design Considerations and Trade-offs**:
  -- Install my own mail server because I cannot register to some free mail service good enough.
  -- Have a lot to improve as this is my first WordPress / PHP project.
- **Known Issues / Improvement Directions**:
  -- The 3 plugins can be merged into 1.
  -- The cache in React Pages is not necessary. This is over design. It involved too much complexity, just for little user experience on the frontend pages... and the experience may not be any difference to end users.
  -- The session management is not very well, need to be improved.

---

## 🎥 Demo

- [YouTube Demo Video](https://www.youtube.com/watch?v=v64nUr6e2OI)

---

## 📌 Usage
```bash
# Clone the repository
git clone git@github.com:baddif/ai_resume_optimizer.git
cd ai_resume_optimizer

# Install dependencies
cd src/career-baist-plugin
npm install # only 1 plugin need to install dependencies

# Start the service
./build.sh
-- Then upload the 3 zip files in build directory as plugins to WordPress.
-- In WordPress, build 3 pages and write short code in it:
  -- Page slug: welcome, short code: [guest_optimize]
  -- Page slug: my_career, short code: [dashboard_page]
  -- Page slug: reset-password, short code: [reset-password]