/**
 * Sanity CMS schemas for Superteam Academy.
 * All course content is managed via Sanity — fetched at build time / ISR.
 * This file exports schema definitions for use with next-sanity.
 */

import { defineType, defineField } from 'sanity'

// ─── Course ──────────────────────────────────────────────────────────────────

export const courseSchema = defineType({
    name: 'course',
    title: 'Course',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string', validation: R => R.required() }),
        defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: R => R.required() }),
        defineField({ name: 'description', title: 'Short Description', type: 'text', rows: 3 }),
        defineField({
            name: 'difficulty',
            title: 'Difficulty',
            type: 'string',
            options: { list: ['beginner', 'intermediate', 'advanced'], layout: 'radio' },
        }),
        defineField({ name: 'xpReward', title: 'XP Reward (total)', type: 'number' }),
        defineField({ name: 'durationMinutes', title: 'Duration (minutes)', type: 'number' }),
        defineField({
            name: 'thumbnail',
            title: 'Thumbnail',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({ name: 'instructorName', title: 'Instructor Name', type: 'string' }),
        defineField({ name: 'modules', title: 'Modules', type: 'array', of: [{ type: 'reference', to: [{ type: 'module' }] }] }),
        defineField({
            name: 'track',
            title: 'Learning Track',
            type: 'string',
            options: { list: ['fundamentals', 'defi', 'anchor', 'nft', 'security'] },
        }),
        defineField({ name: 'prerequisites', title: 'Prerequisites', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
        defineField({ name: 'featured', title: 'Featured on homepage', type: 'boolean', initialValue: false }),
    ],
    preview: { select: { title: 'title', subtitle: 'difficulty', media: 'thumbnail' } },
})

// ─── Module ──────────────────────────────────────────────────────────────────

export const moduleSchema = defineType({
    name: 'module',
    title: 'Module',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Module Title', type: 'string', validation: R => R.required() }),
        defineField({ name: 'order', title: 'Order', type: 'number' }),
        defineField({ name: 'lessons', title: 'Lessons', type: 'array', of: [{ type: 'reference', to: [{ type: 'lesson' }] }] }),
    ],
})

// ─── Lesson ──────────────────────────────────────────────────────────────────

export const lessonSchema = defineType({
    name: 'lesson',
    title: 'Lesson',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Lesson Title', type: 'string', validation: R => R.required() }),
        defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
        defineField({
            name: 'type',
            title: 'Lesson Type',
            type: 'string',
            options: { list: ['content', 'quiz', 'challenge', 'video'], layout: 'radio' },
        }),
        defineField({ name: 'xpReward', title: 'XP Reward', type: 'number', initialValue: 50 }),
        defineField({
            name: 'content',
            title: 'Content (MDX)',
            type: 'array',
            of: [
                { type: 'block' },
                {
                    type: 'code',
                    options: { language: true, withFilename: true },
                },
                { type: 'image', options: { hotspot: true } },
            ],
        }),
        defineField({ name: 'starterCode', title: 'Starter Code (for challenges)', type: 'text' }),
        defineField({ name: 'solutionCode', title: 'Solution Code', type: 'text' }),
        defineField({
            name: 'hints',
            title: 'Hints',
            type: 'array',
            of: [{ type: 'text' }],
        }),
        defineField({
            name: 'testCases',
            title: 'Test Cases',
            type: 'array',
            of: [{
                type: 'object', fields: [
                    { name: 'description', type: 'string', title: 'Description' },
                    { name: 'code', type: 'text', title: 'Test Code' },
                ]
            }],
        }),
        defineField({ name: 'order', title: 'Order within module', type: 'number' }),
        defineField({ name: 'estimatedMinutes', title: 'Estimated Duration (min)', type: 'number', initialValue: 15 }),
    ],
})

// ─── Quiz Question ────────────────────────────────────────────────────────────

export const quizQuestionSchema = defineType({
    name: 'quizQuestion',
    title: 'Quiz Question',
    type: 'object',
    fields: [
        defineField({ name: 'question', type: 'text', title: 'Question' }),
        defineField({ name: 'options', type: 'array', title: 'Options', of: [{ type: 'string' }] }),
        defineField({ name: 'correctIndex', type: 'number', title: 'Correct Answer Index (0-based)' }),
        defineField({ name: 'explanation', type: 'text', title: 'Explanation' }),
    ],
})

// ─── Schema list for Sanity Studio ───────────────────────────────────────────

export const schemaTypes = [courseSchema, moduleSchema, lessonSchema, quizQuestionSchema]
