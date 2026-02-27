import { groq } from 'next-sanity'
import { sanityClient } from './client'

// ─── Course queries ────────────────────────────────────────────────────────

const courseFields = groq`
  _id,
  "id": _id,
  "slug": slug.current,
  title,
  description,
  difficulty,
  xpReward,
  durationMinutes,
  instructorName,
  track,
  featured,
  publishedAt,
  "thumbnailUrl": thumbnail.asset->url,
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[])
`

export async function getAllCourses() {
    return sanityClient.fetch(
        groq`*[_type == "course" && defined(publishedAt)] | order(publishedAt desc) {
      ${courseFields}
    }`
    )
}

export async function getFeaturedCourses() {
    return sanityClient.fetch(
        groq`*[_type == "course" && featured == true && defined(publishedAt)] | order(publishedAt desc)[0...6] {
      ${courseFields}
    }`
    )
}

export async function getCourseBySlug(slug: string) {
    return sanityClient.fetch(
        groq`*[_type == "course" && slug.current == $slug][0] {
      ${courseFields},
      prerequisites,
      "modules": modules[]-> {
        _id,
        title,
        order,
        "lessons": lessons[]-> {
          _id,
          "id": _id,
          title,
          "slug": slug.current,
          type,
          xpReward,
          estimatedMinutes,
          order
        } | order(order asc)
      } | order(order asc)
    }`,
        { slug }
    )
}

export async function getLessonBySlug(courseSlug: string, lessonSlug: string) {
    return sanityClient.fetch(
        groq`*[_type == "lesson" && slug.current == $lessonSlug][0] {
      _id,
      title,
      type,
      xpReward,
      content,
      starterCode,
      hints,
      testCases
    }`,
        { courseSlug, lessonSlug }
    )
}

export async function getCoursesByTrack(track: string) {
    return sanityClient.fetch(
        groq`*[_type == "course" && track == $track && defined(publishedAt)] | order(xpReward asc) {
      ${courseFields}
    }`,
        { track }
    )
}
