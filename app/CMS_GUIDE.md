# CMS Guide - Sanity Setup

Superteam Academy uses **Sanity** as its headless Content Management System (CMS) to manage Course and Lesson content.

## 🔗 Accessing the Studio

Sanity Studio is embedded directly into the Next.js application! 

You can access the admin dashboard by navigating to:
👉 **[http://localhost:3000/en/studio](http://localhost:3000/en/studio)** (or the deployed `/studio` route).

You will need to log in with the Google or GitHub account that has been granted access to the Sanity project.

---

## 📂 Content Schemas

The content models are defined in `app/src/lib/sanity/schemas/`.

### 1. Course (`course.ts`)
The top-level container for a learning path.
- **Title & Slug**: The name of the course and its URL path.
- **Language**: Dropdown to specify if the course is `en`, `pt-BR`, or `es`. (Ensure you create translated versions of your courses!)
- **Difficulty**: Beginner, Intermediate, or Advanced.
- **Image**: The thumbnail displayed on the `/courses` catalog page.
- **Tags**: Used to calculate "Skills Breakdown" on the user profile (e.g. `Rust`, `Anchor`, `DeFi`).
- **Lessons**: An array of references to specific `Lesson` documents. Order matters!

### 2. Lesson (`lesson.ts`)
Individual modules within a course.
- **Title & Slug**: The lesson name and its URL path.
- **Order**: A numeric value used to sort lessons if the array reference order is lost.
- **Content (Markdown)**: The bulk of the lesson text, instructions, and explanations. 
- **XP Reward**: How much XP the user earns for clicking "Mark Complete". (Default: 50).
- **Starter Code / Language**: Used for the interactive Monaco Editor challenge. If you provide starter code, the code editor will appear on the right side of the lesson page.
- **Course Reference**: A back-reference to the parent `Course` document.

---

## 📝 Creating a New Course

1. Ensure `NEXT_PUBLIC_SERVICE_MODE=onchain` in your `.env.local` file so the app actually fetches from Sanity instead of the Mock service.
2. Go to `/en/studio` and create a new **Course** document. Fill in the title, language, and difficulty.
3. Create multiple **Lesson** documents.
4. Go back to your Course document and add the Lessons to the "Lessons" array field in the correct order.
5. Publish all documents.
6. The new course will instantly appear on the `/courses` page in the app!

---

## 🛠 Local Configuration

If you are setting up the project from scratch, you need to connect the app to your own Sanity project:

1. Create a project at [sanity.io](https://sanity.io)
2. Add your Project ID and Dataset (usually `production`) to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```
3. Run `npx sanity cors add http://localhost:3000` to allow your local dev server to query the CMS.
