import { useState } from 'react'
import { TItem } from '../types/app';
import { createDateTag } from '../util/helper'

const Item = ({ item, updateItem, removeItem }: { item: TItem, updateItem: Function, removeItem: Function }) => {

    const [newCommentContent, setNewCommentContent] = useState('')

    const handleAddNewComment = () => {
        if (newCommentContent.length === 0) {
            return alert('New comment is empty');
        }
        const newComments = [...item.comments];
        newComments.push({ content: createDateTag() + ' ' + newCommentContent, isNew: true })
        setNewCommentContent('');
        updateItem({
            ...item,
            title: `[UPDATED] ${item.title}`,
            comments: newComments
        })
    }

    const handleRemoveComment = () => {
        updateItem({
            ...item,
            title: item.title.replace(/\[UPDATED\]|\[DONE\] ?/, ''),
            comments: item.comments.filter(comment => !comment.isNew)
        })
    }

    const handleRemoveItem = () => {
        removeItem(item)
    }

    const handleMarkItemDone = () => {
        // Toggle the UPDATED and DONE tag or add (and remove) the DONE tag to new items
        // Items with the DONE tag will be excluded next time
        if (item.isNew) {
            // Add or remove the DONE tag
            if (item.title.indexOf('[DONE]') > -1) {
                // Remove the DONE tag
                updateItem({
                    ...item,
                    title: item.title.replace(/\[DONE\]/, '')
                })
            } else {
                // Add the DONE tag
                updateItem({
                    ...item,
                    title: `[DONE] ${item.title}`
                })
            }
        } else {
            // Toggle UPDATED and DONE tags
            const newTag = item.title.indexOf('[DONE]') > -1 ? '[UPDATED]' : '[DONE]'
            updateItem({
                ...item,
                title: item.title.replace(/\[UPDATED\]|\[DONE\]/, newTag)
            })
        }
    }

    return (
        <li key={item.id}>
            <h2 className="item-title">{item.title}{item.isNew && (
                <>
                    <button type="button" className="inline-button delete" onClick={handleRemoveItem}>DELETE</button>
                    <button type="button" className="inline-button done" onClick={handleMarkItemDone}>DONE</button>
                </>
            )}</h2>
            {
                <ol className="item-container">
                    {item.comments.map((comment, index) => {
                        return <li className={`item-element ${index === 0 ? 'description' : ''}`} key={`${item.id}-${index}`}>
                            {
                                index === 0 ?
                                    <>{comment.content}</> :
                                    <>{`${index}: ${comment.content}`}{comment.isNew && (
                                        <>
                                            <button type="button" className="inline-button delete" onClick={handleRemoveComment}>DELETE</button>
                                            <button type="button" className="inline-button done" onClick={handleMarkItemDone}>DONE</button>
                                        </>
                                    )}</>
                            }
                        </li>
                    })}
                    {
                        !item.comments.find((comment => comment.isNew)) &&
                        <li key={`${item.id}-new`} className="comment-new">
                            <label htmlFor={`new-comment-${item.id}`}>New Comment</label><input id={`new-comment-${item.id}`} type="text" value={newCommentContent} onChange={(e) => setNewCommentContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewComment()} />
                            {newCommentContent.length > 0 && <button type="button" className="inline-button add" onClick={handleAddNewComment}>Add</button>}
                        </li>
                    }
                </ol>
            }
        </li>)
}

export default Item