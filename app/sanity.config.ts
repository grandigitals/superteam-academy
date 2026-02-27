import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { codeInput } from '@sanity/code-input'
import { schemaTypes } from '@/lib/sanity/schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export default defineConfig({
    name: 'superteam-academy',
    title: 'Superteam Academy CMS',

    projectId,
    dataset,
    basePath: '/studio',

    plugins: [
        structureTool({
            structure: (S) =>
                S.list()
                    .title('Content')
                    .items([
                        S.listItem()
                            .title('Courses')
                            .child(S.documentTypeList('course').title('Courses')),
                        S.listItem()
                            .title('Modules')
                            .child(S.documentTypeList('module').title('Modules')),
                        S.listItem()
                            .title('Lessons')
                            .child(S.documentTypeList('lesson').title('Lessons')),
                    ]),
        }),
        codeInput(),
    ],

    schema: {
        types: schemaTypes,
    },
})
