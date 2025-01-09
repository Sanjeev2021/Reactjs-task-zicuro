import React, { useState, useEffect, useRef } from "react";
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from "draft-js";
import './App.css';


const DraftEditor = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const editorRef = useRef(null);

  const customStyleMap = {
    "red-line": {
      color: "red",
      textDecoration: "none",
    },
  };

  useEffect(() => {
    const savedContent = localStorage.getItem("draftEditorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem("draftEditorContent", JSON.stringify(convertToRaw(contentState)));
  }, [editorState]);

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleBeforeInput = (input) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);
    const blockText = block.getText();

    if (blockText === "#" && input === " ") {
      transformBlock("header-one");
      return "handled";
    }

    if (blockText === "*" && input === " ") {
      transformBlock("BOLD");
      return "handled";
    }

    if (blockText === "**" && input === " ") {
      transformBlock("red-line");
      return "handled";
    }

    if (blockText === "***" && input === " ") {
      transformBlock("UNDERLINE");
      return "handled";
    }

    return "not-handled";
  };

  const transformBlock = (type) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);
    const blockText = block.getText();

    const updatedContent = Modifier.replaceText(
      currentContent,
      selection.merge({ anchorOffset: 0, focusOffset: blockText.length }),
      ""
    );

    const newState = EditorState.push(editorState, updatedContent, "change-block-type");

    if (type === "header-one") {
      setEditorState(RichUtils.toggleBlockType(newState, "header-one"));
    } else if (type === "BOLD") {
      setEditorState(RichUtils.toggleInlineStyle(newState, "BOLD"));
    } else if (type === "red-line") {
      setEditorState(RichUtils.toggleInlineStyle(newState, "red-line"));
    } else if (type === "UNDERLINE") {
      setEditorState(RichUtils.toggleInlineStyle(newState, "UNDERLINE"));
    }
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    localStorage.setItem("draftEditorContent", JSON.stringify(convertToRaw(contentState)));
    alert("Content saved!");
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px" }} className="main-container">
      <div style={{ height: "10%",  width: "100%", display: "flex", justifyContent: "space-between", alignContent: "center", paddingBottom: "5px"}}>
        <h1>Demo Editor By Sanjeev</h1>
        <button onClick={handleSave}>Save</button>
      </div>
      <div className="editor-box" onClick={() => editorRef.current.focus()}>
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={customStyleMap}
        />
      </div>
    </div>
  );
};

export default DraftEditor;
