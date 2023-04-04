import React, { useState } from 'react'
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt('commonmark');
import { TItem } from './types/app';
import { parseContent, convertToMarkdown } from './util/helper'
import Item from './components/Item';
import NewItemForm from './components/NewItemForm';
import './App.css'


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
