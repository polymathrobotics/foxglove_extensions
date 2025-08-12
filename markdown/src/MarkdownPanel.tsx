import { PanelExtensionContext } from "@foxglove/extension";
import { ReactElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";

type MarkdownPanelState = {
  markdownContent: string;
  useEditor: boolean;
};

function MarkdownPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [useEditor, setUseEditor] = useState<boolean>(false);
  const stateRef = useRef({ markdownContent, useEditor });

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = { markdownContent, useEditor };
  }, [markdownContent, useEditor]);

  useLayoutEffect(() => {
    const panelState = context.initialState as MarkdownPanelState | undefined;
    if (panelState?.markdownContent) {
      setMarkdownContent(panelState.markdownContent);
    }
    if (panelState?.useEditor != undefined) {
      setUseEditor(panelState.useEditor);
    }

    context.updatePanelSettingsEditor({
      actionHandler: (action) => {
        if (
          action.action === "update" &&
          action.payload.path[0] === "markdownContent" &&
          action.payload.path[1] === "value"
        ) {
          const newContent = action.payload.value as string;
          setMarkdownContent(newContent);
        }
        if (
          action.action === "update" &&
          action.payload.path[0] === "useEditor" &&
          action.payload.path[1] === "value"
        ) {
          const newUseEditor = action.payload.value as boolean;
          setUseEditor(newUseEditor);
        }
      },
      nodes: {
        markdownContent: {
          label: "Markdown Content",
          fields: {
            value: {
              label: "Content",
              input: "string",
              value: markdownContent,
            },
          },
        },
        useEditor: {
          label: "Editor Mode",
          fields: {
            value: {
              label: "Use Editor",
              input: "boolean",
              value: useEditor,
            },
          },
        },
      },
    });
  }, [context, markdownContent, useEditor]);

  useEffect(() => {
    context.saveState({ markdownContent, useEditor });
  }, [context, markdownContent, useEditor]);

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setMarkdownContent(newContent);
  };

  return (
    <div style={{ padding: "1rem", height: "100%", overflow: "auto" }}>
      {useEditor ? (
        <textarea
          value={markdownContent}
          onChange={handleTextareaChange}
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "0.5rem",
            fontFamily: "monospace",
            fontSize: "14px",
            resize: "none",
          }}
          placeholder="Enter markdown content here..."
        />
      ) : markdownContent ? (
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      ) : (
        <div style={{ color: "#888", fontStyle: "italic" }}>
          Enter markdown content in the panel settings...
        </div>
      )}
    </div>
  );
}

export function initMarkdownPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<MarkdownPanel context={context} />);

  return () => {
    root.unmount();
  };
}
