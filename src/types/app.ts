export type TComment = {
    content: string,
    isNew: boolean
}

export type TItem = {
    id: string,
    title: string,
    comments: Array<TComment>
    isNew: boolean,
}