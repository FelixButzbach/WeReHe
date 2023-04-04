import {useState} from "react"
import { TItem } from "../types/app"
import { createDateTag } from "../util/helper"

const NewItemForm = ({ addItem }: { addItem: Function }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleAddNewItem = () => {
        if (title.length === 0) {
            return alert('Title is empty');
        }
        if (description.length === 0) {
            return alert('Description is empty');
        }
        // create a new Item by using the title and the description
        const newItem: TItem = {
            id: 'Will be set in addItem',
            title: `${title} ${createDateTag()}`,
            comments: [{ content: `-> ${description}`, isNew: true }],
            isNew: true
        }

        setTitle('')
        setDescription('')
        addItem(newItem)
    }

    return (
        <div className="item-new-form">
            <p>Add new item</p>
            <label htmlFor='title' className="item-new-title">Title<input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <label htmlFor='description' className="item-new-description">Description<input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewItem()} /></label>
            {
                (title.length > 0 && description.length > 0) &&
                <button type="button" onClick={handleAddNewItem}>Add</button>
            }
        </div>
    )
}

export default NewItemForm