import React, { useState } from 'react'
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt('commonmark');
import './App.css'

type TComment = {
  content: string,
  isNew: boolean
}
type TItem = {
  id: string,
  title: string,
  comments: Array<TComment>
  isNew: boolean,
}

const parseContent = (rawContent: string) => {

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

const convertToMarkdown = (parsedContent: Array<TItem>) => {
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

const createDateTag = () => {
  const now = new Date();
  const day = ('0' + now.getDate()).slice(-2);
  const month = ('0' + now.getMonth()).slice(-2);
  const year = now.getFullYear().toString().slice(-2);

  return `[${day}.${month}.${year}]`
}

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

function App() {
  const [rawContent, setRawContent] = useState('')
  const [copyButtonText, setCopyButtonText] = useState('Copy')
  const [parsedContent, setParsedContent] = useState<false | Array<TItem>>(false)
  const [exportContent, setExportContent] = useState<false | string>(false)

  // convert the raw content to structured data
  const handelParseInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newParsedContent = parseContent(rawContent);

    setParsedContent(newParsedContent)
  }

  // convert the parsedContent into markdown
  // and show it in the textarea
  const handleExportButton = (e: React.MouseEvent) => {
    if (parsedContent) {
      const exportContent = convertToMarkdown(parsedContent);
      setExportContent(exportContent)
    }
  }

  // Go back to the input textarea
  // Reset parsed and export content
  const handleBackButton = (e: React.MouseEvent) => {
    setParsedContent(false);
    setExportContent(false);
  }

  // clear the input area
  const handleResetButton = (e: React.MouseEvent) => {
    setRawContent('')
  }

  // Copy export content to clipboard
  const handleCopyButton = (e: React.MouseEvent) => {
    if (exportContent) {
      navigator.clipboard.writeText(exportContent)
      setCopyButtonText('Copied!')
      setTimeout(() => setCopyButtonText('Copy'), 1000)
    }
  }

  const updateItem = (updatedItem: TItem) => {
    if (parsedContent) {
      const newParsedContent = parsedContent.map(item => {
        if (item.id === updatedItem.id) {
          return { ...updatedItem };
        }
        return { ...item }
      })

      setParsedContent(newParsedContent)
    }
  }

  const addItem = (newItem: TItem) => {
    if (parsedContent) {
      const newParsedContent = [...parsedContent]
      newParsedContent.push({ ...newItem, id: String(parsedContent.length) })
      setParsedContent(newParsedContent)
    }
  }

  const removeItem = (itemToRemove: TItem) => {
    if (parsedContent) {
      const newParsedContent = [...parsedContent]
      setParsedContent(newParsedContent.filter(item => item.id !== itemToRemove.id))
    }
  }


  return (
    <div className="App">
      <h1>Weekly Recap Helper</h1>
      {
        !parsedContent ?
          <>
            <p>
              Copy the last Weekly Recap description from Trello (change to Markup View!) and insert it below.<br />
              Then click Import to parse the content.
            </p>
            <form className="form-input" onSubmit={handelParseInput}>
              <label htmlFor="input-box"></label>
              <textarea className="textarea-input" name="input-box" id="input-box" rows={20} cols={60} value={rawContent} onChange={(e) => setRawContent(e.target.value)} />
              <div className="button-container">
                {rawContent.length > 0 && <button type="button" onClick={handleResetButton}>Reset</button>}
                <button disabled={rawContent.length === 0}>Import</button>
              </div>
            </form>
          </>
          :
          <>
            <p>
              Edit Elements below, when ready press Export.
              <br />
              Then copy content to clipboard and insert it into the new Weekly
              Recap description.
            </p>
            <p>{`${parsedContent.length} items have been found.`}</p>
            <ul className="content-container">
              {parsedContent.map(item => <Item key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} />)}
            </ul>
            <NewItemForm addItem={addItem} />
            <hr />
            <div className="button-container">
              <button onClick={handleBackButton}>Back</button>
              <button onClick={handleExportButton}>Export</button>
            </div>
            {
              exportContent &&
              <>
                <textarea className="textarea-export" name="export-box" id="export-box" rows={20} cols={60} value={exportContent} onChange={(e) => setExportContent(e.target.value)} />
                <div className="button-container">
                  <button onClick={handleCopyButton}>{copyButtonText}</button>
                </div>
              </>
            }
          </>
      }
    </div >
  )
}

export default App
