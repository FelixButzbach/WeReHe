import MarkdownIt from 'markdown-it';
const md = new MarkdownIt('commonmark');
import { TComment, TItem } from '../types/app';

export const parseContent = (rawContent: string) => {

    // Clean out some common whitespaces (found here: https://marked.js.org/)
    const cleanedRawContent = rawContent.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "");

    const markDownContent = md.parse(cleanedRawContent, {})

    const newParsedContent: Array<TItem> = [];
    let currentIndex = 0;

    markDownContent.forEach((element, index) => {
        // Extract all inline elements (type=inline) that actually have content (content.length > 1)
        // Remove headers by checking previous element and see if it is type = heading_open

        if (element.type === 'inline' && element.content && element.content.length > 1) {
            // Found an inline element that is not empty
            // Check if it is a header
            if (markDownContent[index - 1] && markDownContent[index - 1].type === "heading_open") {
                // Its a header
                // We currently dont do anything with the header, just ignore it
            } else {
                // Its some (real) content        
                // Loop over the comments to get all content
                const newItem: TItem = {
                    id: String(currentIndex),
                    title: "",
                    comments: [],
                    isNew: false,
                }
                const newComments: Array<TComment> = [];
                element.children?.forEach((child, index) => {
                    if (child.type === 'text') {
                        if (index === 0) {
                            // Thats the title
                            newItem.title = child.content.replace(/\[UPDATED\] ?/, '') // Remove the [UPDATED] tag, if any
                        } else {
                            newComments.push({ content: child.content, isNew: false })
                        }
                    }
                });

                // Only add this item if its status is not done
                // This probably should be done before parsing all comments
                if (newItem.title.indexOf('[DONE]') === -1) {
                    newParsedContent.push({
                        ...newItem,
                        comments: newComments
                    })
                    currentIndex++;
                }
            }
        }
    })

    console.log('newParsedContent', newParsedContent);

    return newParsedContent;
}

export const convertToMarkdown = (parsedContent: Array<TItem>) => {
    // Create new headers 'doing' and 'new'
    // add all itens as sub headers
    // add all comments as list
    let exportString = '# Tarefas em andamento:\n---\n';
    let isNew = false;

    parsedContent.forEach(item => {
        if (item.isNew !== isNew) {
            // Now the new items
            exportString += '# Tarefas novas:\n---\n';;
            isNew = true;
        }
        exportString += `- ${item.title}\n`;
        item.comments.forEach(comment => {
            exportString += `  ${comment.content}\n`;
        })
        exportString += '---\n'
    });

    return exportString;
}

export const createDateTag = () => {
    const now = new Date();
    const day = ('0' + now.getDate()).slice(-2);
    const month = ('0' + now.getMonth()).slice(-2);
    const year = now.getFullYear().toString().slice(-2);

    return `[${day}.${month}.${year}]`
}