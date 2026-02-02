import matter from 'gray-matter';

export function transformMarkdownContent(content: string, newMeta: Record<string, any>): string {
    const { data, content: body } = matter(content);

    // Merge existing metadata with new metadata
    const mergedData = {
        ...data,
        ...newMeta
    };

    // Return the stringified version with the triple dash separators
    return matter.stringify(body, mergedData);
}
